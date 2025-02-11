import { Component, computed, effect, inject, signal } from '@angular/core';
import { fadeInOutAnimation } from '../../common/animations';
import { AudioService } from '../../common/audio';
import { resolveStorageUrl } from '../../common/firestore';
import { downloadUrlAsBlob } from '../../common/utils';
import { BaseGame, CommonGameModule } from '../base/game';
import { ImpockstersDatabase } from './database';
import {
    IMPOCKSTERS_BASE_PATH,
    ImpockstersQuestion,
    ImpockstersState,
} from './model';

@Component({
    imports: [CommonGameModule],
    templateUrl: './game.html',
    styleUrl: './game.scss',
    host: { class: 'pocket-pals-game' },
    animations: [fadeInOutAnimation()],
})
export class ImpockstersGame extends BaseGame<
    ImpockstersState,
    ImpockstersQuestion
> {
    private _audio = inject(AudioService);
    protected data: ImpockstersDatabase;

    protected imageSrc = signal<Blob | null>(null);
    protected muted = computed(() => !this._audio.audioEnabled());

    constructor() {
        const database = inject(ImpockstersDatabase);
        super(database);
        this.data = database;

        effect(async () => {
            const question = this.currentQuestion();

            this.imageSrc.set(null);

            if (question) {
                const downloadUrl = resolveStorageUrl(
                    `${IMPOCKSTERS_BASE_PATH}/${question.imageId}`,
                );
                const imageSrc = await downloadUrlAsBlob(downloadUrl);
                this.imageSrc.set(imageSrc);
            }
        });
    }
}
