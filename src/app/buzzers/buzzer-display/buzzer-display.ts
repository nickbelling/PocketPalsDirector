import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { STORAGE } from '../../app.config';
import {
    arraysAreEqual,
    fadeInAnimation,
    fadeOutAnimation,
    FitTextDirective,
    getCachedDownloadUrls,
    preloadImages,
    SlideModule,
} from '../../common';
import { CommonPipesModule } from '../../common/pipes/pipes.module';
import { BuzzerDisplayDataStore } from '../data/display-data';
import { BUZZERS_STORAGE_IMAGES_PATH } from '../model';

@Component({
    selector: 'buzzer-display',
    imports: [
        CommonModule,
        MatCardModule,
        CommonPipesModule,
        SlideModule,
        FitTextDirective,
    ],
    templateUrl: './buzzer-display.html',
    styleUrl: './buzzer-display.scss',
    animations: [fadeInAnimation(), fadeOutAnimation()],
})
export class BuzzerDisplay {
    private _data = inject(BuzzerDisplayDataStore);

    protected BUZZERS_STORAGE_IMAGES_PATH = BUZZERS_STORAGE_IMAGES_PATH;
    protected players = this._data.players;

    protected buzzedInPlayers = computed(() => {
        const players = this.players();
        return players
            .filter((p) => p.buzzTimestamp !== null)
            .sort(
                (a, b) =>
                    a.buzzTimestamp!.toMillis() - b.buzzTimestamp!.toMillis(),
            );
    });

    protected allImagePaths = computed(
        () => {
            const players = this.players();
            return players
                .filter((p) => p.image)
                .map((p) => `${BUZZERS_STORAGE_IMAGES_PATH}/${p.image}`);
        },
        {
            equal: arraysAreEqual,
        },
    );

    constructor() {
        const storage = inject(STORAGE);
        effect(async () => {
            const allImagePaths = this.allImagePaths();
            const downloadUrls = await getCachedDownloadUrls(
                storage,
                allImagePaths,
            );

            await preloadImages(downloadUrls);
        });
    }
}
