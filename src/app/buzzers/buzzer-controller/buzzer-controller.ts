import { Component, computed, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
    CommonControllerModule,
    Entity,
    SimpleDialogService,
    SimpleDialogType,
} from '../../common';
import { BuzzerDisplay } from '../buzzer-display/buzzer-display';
import { BuzzerDirectorDataStore } from '../data/director-data';
import { BuzzerPlayer } from '../model';
import { BuzzerPlayerAddDialog } from './buzzer-player-add-dialog';

@Component({
    selector: 'buzzer-controller',
    imports: [CommonControllerModule, BuzzerDisplay],
    templateUrl: './buzzer-controller.html',
})
export class BuzzerController {
    private _data = inject(BuzzerDirectorDataStore);
    private _dialog = inject(MatDialog);
    private _confirm = inject(SimpleDialogService);

    protected state = this._data.state;
    protected players = this._data.players;

    protected buzzerBaseUrl = `${window.location.origin}/buzzer/`;

    protected anyPlayersBuzzed = computed(() =>
        this.players().some((p) => p.buzzTimestamp !== null),
    );

    protected anyPlayersLocked = computed(() =>
        this.players().some((p) => p.lockedOut),
    );

    protected buzzedInPlayers = computed(() => {
        const players = this.players();
        return players
            .filter((p) => p.buzzTimestamp !== null)
            .sort(
                (a, b) =>
                    a.buzzTimestamp!.toMillis() - b.buzzTimestamp!.toMillis(),
            );
    });

    protected buzzedOutPlayers = computed(() => {
        const players = this.players();
        return players.filter((p) => p.buzzTimestamp === null);
    });

    public addPlayer(): void {
        this._dialog.open(BuzzerPlayerAddDialog);
    }

    public deletePlayer(player: Entity<BuzzerPlayer>): void {
        this._confirm.open(
            SimpleDialogType.DeleteCancel,
            'Delete player',
            `Are you sure you want to delete ${player.name}?`,
            {
                onDelete: async () => {
                    await this._data.deletePlayer(player);
                },
            },
        );
    }

    public async buzzIn(playerId: string): Promise<void> {
        await this._data.buzzInPlayer(playerId);
    }

    public async resetBuzzer(playerId: string): Promise<void> {
        await this._data.resetPlayerBuzzer(playerId);
    }

    public async resetAllBuzzers(): Promise<void> {
        await this._data.resetAllPlayerBuzzers();
    }

    public async toggleLock(playerId: string, locked: boolean): Promise<void> {
        if (locked) {
            await this._data.unlockPlayer(playerId);
        } else {
            await this._data.lockPlayer(playerId);
        }
    }

    public async unlockAll(): Promise<void> {
        await this._data.unlockAllPlayers();
    }

    public toPlayer(player: Entity<BuzzerPlayer>): Entity<BuzzerPlayer> {
        return player;
    }
}
