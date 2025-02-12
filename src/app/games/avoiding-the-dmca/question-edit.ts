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
    private _vgDb = inject(VideogameDatabaseService);
    private _db: AvoidingTheDmcaDatabase = this.db as AvoidingTheDmcaDatabase;

    protected gameId = signal<string | null>(null);
    protected trackName = signal<string>('');
    protected fileToUpload = signal<File | null>(null);
    protected audioStartPoint = signal<number>(0);
    protected audioLengthSeconds = signal<number>(0);
    protected games = this._vgDb.games;

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
        return (
            this.gameId() !== null &&
            this.trackName().trim().length > 0 &&
            this.fileToUpload() !== null
        );
    });

    public async submit(): Promise<void> {
        this.loading.set(true);
        const gameId = this.gameId()!;
        const trackName = this.trackName();
        const audioId = uuid();
        const forwardId = audioId + '_forward';
        const backwardId = audioId + '_backward';
        this.progress.start(5);

        try {
            this.progress.set(1, 'Trimming audio to 30 seconds...');
            const forwardFile = await this._db.getPreviewFile(
                this.fileToUpload()!,
                this.audioStartPoint(),
            );

            this.progress.set(2, 'Reversing audio...');
            const backwardFile =
                await this._db.getReversedAudioFile(forwardFile);

            this.progress.set(3, 'Uploading forwards audio file...');
            await this.uploadFile(forwardFile, forwardId);
            this.progress.set(4, 'Uploading backwards audio file...');
            await this.uploadFile(backwardFile, backwardId);

            this.progress.set(5, 'Adding question...');
            await this.addQuestion({
                gameId: gameId,
                trackName: trackName,
                soundForwards: forwardId,
                soundBackwards: backwardId,
            });

            this.progress.finish();
            this.dialog.close();
        } finally {
            this.progress.reset();
            this.loading.set(false);
        }
    }
}
