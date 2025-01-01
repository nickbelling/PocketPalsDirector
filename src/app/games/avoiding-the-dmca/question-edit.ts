import { Component, computed, effect, inject, signal } from '@angular/core';
import { v4 as uuid } from 'uuid';
import { VideogameDatabaseService } from '../../common/video-games';
import {
    BaseQuestionEditDialog,
    CommonControllerModule,
} from '../base/controller';
import { AvoidingTheDmcaDatabase } from './database';
import { AvoidingTheDmcaQuestion } from './model';

@Component({
    templateUrl: './question-edit.html',
    imports: [CommonControllerModule],
})
export class AvoidingTheDmcaQuestionEditDialog extends BaseQuestionEditDialog<AvoidingTheDmcaQuestion> {
    private _vgdb = inject(VideogameDatabaseService);
    private _db: AvoidingTheDmcaDatabase = this.db as AvoidingTheDmcaDatabase;

    protected gameId = signal<string | null>(null);
    protected fileToUpload = signal<File | null>(null);
    protected audioStartPoint = signal<number>(0);
    protected audioLengthSeconds = signal<number>(0);
    protected progress = signal<number>(0);
    protected games = this._vgdb.games;

    constructor() {
        super(inject(AvoidingTheDmcaDatabase));

        effect(async () => {
            const fileToUpload = this.fileToUpload();

            if (fileToUpload) {
                this.loading.set(true);
                const duration = await this._db.getDuration(fileToUpload);
                this.audioLengthSeconds.set(duration);
                this.loading.set(false);
            }
        });
    }

    protected isValid = computed(() => {
        return this.gameId() !== null && this.fileToUpload() !== null;
    });

    public async submit(): Promise<void> {
        this.loading.set(true);
        const audioId = uuid();
        const forwardId = audioId + '_forward';
        const backwardId = audioId + '_backward';
        this.progress.set(0);

        try {
            this.progress.set(5);
            const forwardFile = await this._db.getPreviewFile(
                this.fileToUpload()!,
                this.audioStartPoint(),
            );

            this.progress.set(20);
            const backwardFile =
                await this._db.getReversedAudioFile(forwardFile);

            this.progress.set(40);
            await this.uploadFile(forwardFile, forwardId);
            this.progress.set(60);
            await this.uploadFile(backwardFile, backwardId);

            this.progress.set(80);
            await this.addQuestion({
                gameId: this.gameId()!,
                soundForwards: forwardId,
                soundBackwards: backwardId,
            });

            this.progress.set(100);
            this.dialog.close();
        } finally {
            this.progress.set(0);
            this.loading.set(false);
        }
    }
}
