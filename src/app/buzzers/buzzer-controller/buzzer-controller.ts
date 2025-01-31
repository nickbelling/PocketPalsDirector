import { Component, computed, inject, signal } from '@angular/core';
import { Entity } from '../../common/firestore';
import { ToastService } from '../../common/toast';
import { CommonControllerModule } from '../../games/base/controller';
import { BuzzerDirectorDataStore } from '../data/director-data';
import { BuzzerPlayer, BuzzerState, BuzzerTeam } from '../data/model';

@Component({
    selector: 'buzzer-controller',
    imports: [CommonControllerModule],
    templateUrl: './buzzer-controller.html',
    styleUrl: './buzzer-controller.scss',
})
export class BuzzerController {
    private _data = inject(BuzzerDirectorDataStore);
    private _toast = inject(ToastService);

    protected state = this._data.state;
    protected players = this._data.players;
    protected teams = this._data.teams;

    protected buzzerBaseUrl = `${window.location.origin}/buzzer/`;
    protected optionsOpen = signal<boolean>(false);

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
            try {
                if (value) {
                    await this._data.enableBuzzers();
                } else {
                    await this._data.disableBuzzers();
                }
            } catch (error) {
                this._toast.error(
                    'Failed to change the global buzzer state.',
                    error,
                );
            }
        }
    }

    public async setCorrectLocksNextQuestion(value: boolean): Promise<void> {
        if (this.state().correctLocksNextQuestion !== value) {
            await this._setState({
                correctLocksNextQuestion: value,
            });
        }
    }

    public async setIncorrectLocksThisQuestion(value: boolean): Promise<void> {
        if (this.state().incorrectLocksThisQuestion !== value) {
            await this._setState({
                incorrectLocksThisQuestion: value,
            });
        }
    }

    public async setIncorrectLocksTeamThisQuestion(
        value: boolean,
    ): Promise<void> {
        if (this.state().incorrectLocksTeamThisQuestion !== value) {
            await this._setState({
                incorrectLocksTeamThisQuestion: value,
            });
        }
    }

    public async buzzIn(playerId: string): Promise<void> {
        try {
            await this._data.buzzInPlayer(playerId);
        } catch (error) {
            this._toast.error('Failed to buzz in player.', error);
        }
    }

    public async resetBuzzer(playerId: string): Promise<void> {
        try {
            await this._data.resetPlayerBuzzer(playerId);
        } catch (error) {
            this._toast.error('Failed to reset player buzzer.', error);
        }
    }

    public async resetAllBuzzers(): Promise<void> {
        try {
            await this._data.resetAllPlayerBuzzers();
        } catch (error) {
            this._toast.error('Failed to reset player buzzers.', error);
        }
    }

    public async toggleLock(playerId: string, locked: boolean): Promise<void> {
        try {
            if (locked) {
                await this._data.unlockPlayer(playerId);
            } else {
                await this._data.lockPlayer(playerId);
            }
        } catch (error) {
            this._toast.error('Failed to toggle player lock state.', error);
        }
    }

    public async unlockAll(): Promise<void> {
        try {
            await this._data.unlockAllPlayers();
        } catch (error) {
            this._toast.error('Failed to unlock all players.', error);
        }
    }

    public async markCorrect(player: Entity<BuzzerPlayer>): Promise<void> {
        try {
            await this._data.markCorrect(player.id);
        } catch (error) {
            this._toast.error('Failed to mark player as correct.', error);
        }
    }

    public async markIncorrect(player: Entity<BuzzerPlayer>): Promise<void> {
        try {
            await this._data.markIncorrect(player.id);
        } catch (error) {
            this._toast.error('Failed to mark player as incorrect.', error);
        }
    }

    public getTeam(
        player: BuzzerPlayer,
        teams: Entity<BuzzerTeam>[],
    ): Entity<BuzzerTeam> | undefined {
        return teams.find((t) => t.id === player.teamId);
    }

    private async _setState(
        state: BuzzerState | Partial<BuzzerState>,
    ): Promise<void> {
        try {
            await this._data.setState(state);
        } catch (error) {
            this._toast.error('Failed to update the buzzer options.', error);
        }
    }
}
