import { Component, computed, effect, inject, signal } from '@angular/core';
import { fadeInOutAnimation } from '../../common/animations';
import { ImageService, SoundService } from '../../common/files';
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
    private _sounds = inject(SoundService);
    private _images = inject(ImageService);
    protected data: ImpockstersDatabase;

    protected imageSrc = signal<string | null>(null);
    protected muted = computed(() => !this._sounds.soundEnabled());

    constructor() {
        const database = inject(ImpockstersDatabase);
        super(database);
        this.data = database;

        effect(async () => {
            const question = this.currentQuestion();

            this.imageSrc.set(null);

            if (question) {
                const imageSrc = await this._images.preloadStorageImage(
                    `${IMPOCKSTERS_BASE_PATH}/${question.imageId}`,
                );

                this.imageSrc.set(imageSrc);
            }
        });
    }
}
