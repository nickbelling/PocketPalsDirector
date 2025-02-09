import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { fadeOutAnimation, growInOutXAnimation } from '../../common/animations';
import { Player } from '../../common/components/player';
import { SoundService } from '../../common/files';
import { CommonFirebaseModule, Entity } from '../../common/firestore';
import { CommonPipesModule } from '../../common/pipes/pipes.module';
import { SlideModule } from '../../common/slide';
import { arraysAreEqual, downloadUrlAsBlob } from '../../common/utils';
import { BuzzerDisplayDataStore } from '../data/display-data';
import {
    BuzzerPlayer,
    BUZZERS_STORAGE_IMAGES_PATH,
    BUZZERS_STORAGE_SOUNDS_PATH,
    BuzzerTeam,
} from '../data/model';

/**
 * Displays the currently-buzzed in players, in the order they buzzed in.
 * Also plays the player's chosen sound effect when the buzz in (if they have a
 * sound effect set).
 */
@Component({
    selector: 'buzzer-display',
    imports: [
        CommonModule,
        MatCardModule,
        CommonFirebaseModule,
        CommonPipesModule,
        SlideModule,
        Player,
    ],
    templateUrl: './buzzer-display.html',
    styleUrl: './buzzer-display.scss',
    animations: [fadeOutAnimation(), growInOutXAnimation('100px')],
})
export class BuzzerDisplay {
    private _data = inject(BuzzerDisplayDataStore);
    private _sound = inject(SoundService);

    /**
     * A Set representing the previously-known list of buzzed-in player IDs.
     * Used to determine if a new one has been added, so that we can play their
     * sound effect.
     */
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
                .filter((p) => p.soundEffect !== null)
                .map((p) => `${BUZZERS_STORAGE_SOUNDS_PATH}/${p.soundEffect}`);
        },
        {
            equal: arraysAreEqual,
        },
    );

    constructor() {
        // Preload all images
        effect(async () => {
            const allImagePaths = this.allImagePaths();

            const imagePreloadPromises = allImagePaths.map((p) =>
                downloadUrlAsBlob(p),
            );

            await Promise.all(imagePreloadPromises);
        });

        // Preload all sound effects
        effect(async () => {
            const allSoundPaths = this.allSoundPaths();

            const soundPreloadPromises = allSoundPaths.map((p) =>
                downloadUrlAsBlob(p),
            );

            await Promise.all(soundPreloadPromises);
        });

        // Play sound effect whenever a new player buzzes in
        effect(async () => {
            const buzzedInPlayers = this.buzzedInPlayers();

            // The _previousBuzzedInPlayerIds Set holds our last-known set of
            // player IDs, and this effect is called when the buzzedInPlayers
            // list changes. Therefore, whatever player IDs are in the
            // buzzedInPlayers list but NOT in the Set have just been added to
            // the list, meaning we should play their sound effect.
            buzzedInPlayers.forEach(async (player) => {
                if (!this._previousBuzzedInPlayerIds.has(player.id)) {
                    if (player.soundEffect) {
                        await this._sound.playStorageSound(
                            `${BUZZERS_STORAGE_SOUNDS_PATH}/${player.soundEffect}`,
                        );
                    }
                }
            });

            // Update the "previous" set with the now-known set of player IDs.
            this._previousBuzzedInPlayerIds = new Set(
                buzzedInPlayers.map((p) => p.id),
            );
        });
    }

    /**
     * Given a player and the list of teams, gets the CSS color for their team.
     */
    public getTeamColor(
        player: BuzzerPlayer,
        teams: Entity<BuzzerTeam>[],
    ): string | undefined {
        return teams.find((t) => t.id === player.teamId)?.color;
    }
}
