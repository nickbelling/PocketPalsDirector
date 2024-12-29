import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { fadeOutAnimation, growInOutXAnimation } from '../../common/animations';
import { Player } from '../../common/components/player';
import { SoundService } from '../../common/files';
import { Entity, getCachedDownloadUrls, STORAGE } from '../../common/firestore';
import { FirebaseUploadedFileUrlPipe } from '../../common/firestore/firebase-file-url.pipe';
import { CommonPipesModule } from '../../common/pipes/pipes.module';
import { SlideModule } from '../../common/slide';
import {
    arraysAreEqual,
    preloadAudio,
    preloadImages,
} from '../../common/utils';
import { BuzzerDisplayDataStore } from '../data/display-data';
import {
    BuzzerPlayer,
    BUZZERS_STORAGE_IMAGES_PATH,
    BUZZERS_STORAGE_SOUNDS_PATH,
    BuzzerTeam,
} from '../data/model';

@Component({
    selector: 'buzzer-display',
    imports: [
        CommonModule,
        MatCardModule,
        CommonPipesModule,
        SlideModule,
        Player,
        FirebaseUploadedFileUrlPipe,
    ],
    templateUrl: './buzzer-display.html',
    styleUrl: './buzzer-display.scss',
    animations: [fadeOutAnimation(), growInOutXAnimation('100px')],
})
export class BuzzerDisplay {
    private _data = inject(BuzzerDisplayDataStore);
    private _sound = inject(SoundService);
    private _previousBuzzedInPlayerIds: Set<string> = new Set<string>();

    protected BUZZERS_STORAGE_IMAGES_PATH = BUZZERS_STORAGE_IMAGES_PATH;
    protected players = this._data.players;
    protected teams = this._data.teams;

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

    protected allSoundPaths = computed(
        () => {
            const players = this.players();
            return players
                .filter((p) => p.soundEffect)
                .map((p) => `${BUZZERS_STORAGE_SOUNDS_PATH}/${p.soundEffect}`);
        },
        {
            equal: arraysAreEqual,
        },
    );

    constructor() {
        const storage = inject(STORAGE);

        // Preload all image paths
        effect(async () => {
            const allImagePaths = this.allImagePaths();
            const downloadUrls = await getCachedDownloadUrls(
                storage,
                allImagePaths,
            );

            await preloadImages(downloadUrls);
        });

        effect(async () => {
            const allSoundPaths = this.allSoundPaths();
            const downloadUrls = await getCachedDownloadUrls(
                storage,
                allSoundPaths,
            );

            await preloadAudio(downloadUrls);
        });

        // Play sound effect whenever a new player buzzes in
        effect(async () => {
            const buzzedInPlayers = this.buzzedInPlayers();

            buzzedInPlayers.forEach(async (player) => {
                if (!this._previousBuzzedInPlayerIds.has(player.id)) {
                    await this._sound.playStorageSound(
                        `${BUZZERS_STORAGE_SOUNDS_PATH}/${player.soundEffect}`,
                    );
                }
            });

            this._previousBuzzedInPlayerIds = new Set(
                buzzedInPlayers.map((p) => p.id),
            );
        });
    }

    public getTeamColor(
        player: BuzzerPlayer,
        teams: Entity<BuzzerTeam>[],
    ): string | undefined {
        return teams.find((t) => t.id === player.teamId)?.color;
    }
}
