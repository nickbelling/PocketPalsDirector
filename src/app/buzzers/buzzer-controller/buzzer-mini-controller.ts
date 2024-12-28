import { Component, computed, inject } from '@angular/core';
import { CommonControllerModule, Entity } from '../../common';
import { BuzzerTeamPipe } from '../buzzer-team.pipe';
import { BuzzerDirectorDataStore } from '../data/director-data';
import { BuzzerPlayer } from '../model';

@Component({
    selector: 'buzzer-mini-controller',
    imports: [CommonControllerModule, BuzzerTeamPipe],
    templateUrl: './buzzer-mini-controller.html',
    styleUrl: './buzzer-mini-controller.scss',
})
export class BuzzerMiniController {
    private _data = inject(BuzzerDirectorDataStore);

    protected state = this._data.state;
    protected players = this._data.players;
    protected teams = this._data.teams;

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

    public async setBuzzersEnabled(value: boolean): Promise<void> {
        if (this.state().buzzersEnabled !== value) {
            if (value) {
                await this._data.enableBuzzers();
            } else {
                await this._data.disableBuzzers();
            }
        }
    }

    public async setCorrectLocksNextQuestion(value: boolean): Promise<void> {
        if (this.state().correctLocksNextQuestion !== value) {
            await this._data.setState({
                correctLocksNextQuestion: value,
            });
        }
    }

    public async setIncorrectLocksThisQuestion(value: boolean): Promise<void> {
        if (this.state().incorrectLocksThisQuestion !== value) {
            await this._data.setState({
                incorrectLocksThisQuestion: value,
            });
        }
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

    public async markCorrect(player: Entity<BuzzerPlayer>): Promise<void> {
        await this._data.markCorrect(player.firebaseId);
    }

    public async markIncorrect(player: Entity<BuzzerPlayer>): Promise<void> {
        await this._data.markIncorrect(player.firebaseId);
    }
}
