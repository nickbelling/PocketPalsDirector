import {
    computed,
    DestroyRef,
    effect,
    inject,
    Injectable,
    signal,
    untracked,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { BuzzerDevice } from '../../buzzers/buzzer-devices/buzzer-device';
import { BuzzerDeviceService } from '../../buzzers/buzzer-devices/buzzer-device-service';
import { BuzzerDeviceButton } from '../../buzzers/buzzer-devices/model';
import { BuzzerDirectorDataStore } from '../../buzzers/data';
import { BuzzerPlayer, BuzzerState } from '../../buzzers/data/model';
import { Entity } from '../../common/firestore';

interface PlayerIdBuzzerLink {
    playerId: string;
    buzzer: BuzzerDevice;
    buttonPressedSubscription: Subscription;
}

interface PlayerBuzzerLink {
    buzzer: BuzzerDevice;
    player?: Entity<BuzzerPlayer>;
}

/** Service that manages which players are connected to which buzzer devices. */
@Injectable({
    providedIn: 'root',
})
export class BuzzerPlayerService {
    private _players = inject(BuzzerDirectorDataStore);
    private _devices = inject(BuzzerDeviceService);
    private _playerIdBuzzerLinks = signal<PlayerIdBuzzerLink[]>([]);

    /** A list of players not assigned to a buzzer. */
    public readonly unassignedPlayers = computed(() => {
        const players = this._players.players();
        const links = this._playerIdBuzzerLinks();

        return players.filter((p) => !links.some((l) => l.playerId === p.id));
    });

    /**
     * A list of all buzzer devices, alongside the player objects they are
     * associated with.
     */
    public readonly playerBuzzerMap = computed<PlayerBuzzerLink[]>(() => {
        const buzzers = this._devices.buzzers();
        const players = this._players.players();
        const links = this._playerIdBuzzerLinks();

        return buzzers.map((buzzer) => {
            const link = links.find((m) => m.buzzer === buzzer);

            return {
                buzzer: buzzer,
                player: players.find((p) => p.id === link?.playerId),
            };
        });
    });

    /** @constructor */
    constructor() {
        // When something changes about the players, turn the appropriate buzzer
        // lights on or off.
        effect(() => {
            const state = this._players.state();
            const playerBuzzers = this.playerBuzzerMap();

            for (const playerBuzzer of playerBuzzers) {
                const player = playerBuzzer.player;
                const buzzer = playerBuzzer.buzzer;

                untracked(() => {
                    if (player) {
                        buzzer.setLight(this._playerCanBuzz(state, player));
                    } else {
                        buzzer.setLight(false);
                    }
                });
            }
        });

        // When the buzzers are removed (e.g. a device disconnects), unassign
        // the players.
        effect(() => {
            const buzzers = this._devices.buzzers();

            untracked(() => {
                const links = this._playerIdBuzzerLinks();

                // Get all the links where there isn't a matching buzzer anymore
                const removedLinks = links.filter(
                    (l) => !buzzers.some((b) => l.buzzer === b),
                );

                // Clean up the links
                for (const removedLink of removedLinks) {
                    removedLink.buttonPressedSubscription.unsubscribe();
                }

                this._playerIdBuzzerLinks.update((links) => {
                    return links.filter((l) => !removedLinks.includes(l));
                });
            });
        });

        inject(DestroyRef).onDestroy(() => {
            for (const link of this._playerIdBuzzerLinks()) {
                link.buttonPressedSubscription.unsubscribe();
            }
        });
    }

    /** Associates the given player with the given buzzer device. */
    public associatePlayerWithBuzzer(
        player: Entity<BuzzerPlayer>,
        buzzer: BuzzerDevice,
    ): void {
        this._playerIdBuzzerLinks.update((existingList) => {
            const existingLink = existingList.find(
                (m) => m.playerId === player.id || m.buzzer === buzzer,
            );

            if (!existingLink) {
                existingList.push({
                    playerId: player.id,
                    buzzer: buzzer,
                    buttonPressedSubscription: buzzer.buttonPressed.subscribe(
                        (button) => this._buttonPressed(buzzer, button),
                    ),
                });
            } else {
                existingLink.buttonPressedSubscription.unsubscribe();
                existingLink.playerId = player.id;
                existingLink.buzzer = buzzer;
                existingLink.buttonPressedSubscription =
                    buzzer.buttonPressed.subscribe((button) =>
                        this._buttonPressed(buzzer, button),
                    );
            }

            return [...existingList];
        });
    }

    /** Returns true if the given player can buzz. */
    private _playerCanBuzz(
        state: BuzzerState,
        player: Entity<BuzzerPlayer>,
    ): boolean {
        return (
            state.buzzersEnabled &&
            player.buzzTimestamp === null &&
            !player.lockedOut
        );
    }

    /** Fired when a button is pressed on a buzzer device. */
    private async _buttonPressed(
        buzzer: BuzzerDevice,
        button: BuzzerDeviceButton,
    ): Promise<void> {
        if (button === 'red') {
            const state = this._players.state();
            const player = this._getPlayerForBuzzer(buzzer);

            if (player) {
                // Immediately turn off the light
                buzzer.setLight(false);

                if (this._playerCanBuzz(state, player)) {
                    // Buzz in the player
                    await this._players.buzzInPlayer(player.id);
                }
            }
        }
    }

    /** Gets the player associated with the given buzzer device. */
    private _getPlayerForBuzzer(
        buzzer: BuzzerDevice,
    ): Entity<BuzzerPlayer> | undefined {
        const playerBuzzers = this.playerBuzzerMap();
        return playerBuzzers.find((x) => x.buzzer === buzzer)?.player;
    }
}
