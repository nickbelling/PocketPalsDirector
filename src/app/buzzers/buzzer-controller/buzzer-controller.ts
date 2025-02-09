import { Component, computed, inject, signal } from '@angular/core';
import { Entity } from '../../common/firestore';
import { ToastService } from '../../common/toast';
import { CommonControllerModule } from '../../games/base/controller';
import { BuzzerDirectorDataStore } from '../data/director-data';
import { BuzzerPlayer, BuzzerState, BuzzerTeam } from '../data/model';

/**
 * Controls used for managing the current state of the
 */
@Component({
    selector: 'buzzer-controller',
    imports: [CommonControllerModule],
    templateUrl: './buzzer-controller.html',
    styleUrl: './buzzer-controller.scss',
})
export class BuzzerController {
    private _data = inject(BuzzerDirectorDataStore);
    private _toast = inject(ToastService);

    /** The current state of the buzzer options. */
    protected readonly state = this._data.state;

    /** The current list of players. */
    protected readonly players = this._data.players;

    /** The current list of teams. */
    protected readonly teams = this._data.teams;

    /**
     * The URL used as the base of a player's buzzer. The player's ID is added
     * to this to create the URL to the actual BuzzerPlayer component in this
     * app's router.
     */
    protected readonly buzzerBaseUrl = `${window.location.origin}/buzzer/`;

    /** True if the options menu is open. */
    protected readonly optionsOpen = signal<boolean>(false);

    /** True if any players are currently buzzed in. */
    protected anyPlayersBuzzed = computed<boolean>(() =>
        this.players().some((p) => p.buzzTimestamp !== null),
    );

    /** True if any players are currently locked. */
    protected anyPlayersLocked = computed(() =>
        this.players().some((p) => p.lockedOut),
    );

    /**
     * The list of currently buzzed in players, ordered by when they buzzed in.
     */
    protected buzzedInPlayers = computed<Entity<BuzzerPlayer>[]>(() => {
        const players = this.players();
        return players
            .filter((p) => p.buzzTimestamp !== null)
            .sort(
                (a, b) =>
                    a.buzzTimestamp!.toMillis() - b.buzzTimestamp!.toMillis(),
            );
    });

    /** The list of players who have not buzzed in. */
    protected buzzedOutPlayers = computed<Entity<BuzzerPlayer>[]>(() => {
        const players = this.players();
        return players.filter((p) => p.buzzTimestamp === null);
    });

    /** Globally enables or disables all buzzers. */
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

    /**
     * Sets the global state option that causes a correct answer to lock that
     * player for the next question.
     */
    public async setCorrectLocksNextQuestion(value: boolean): Promise<void> {
        if (this.state().correctLocksNextQuestion !== value) {
            await this._setState({
                correctLocksNextQuestion: value,
            });
        }
    }

    /**
     * Sets the global state option that causes an incorrect answer to lock that
     * player for the current question.
     */
    public async setIncorrectLocksThisQuestion(value: boolean): Promise<void> {
        if (this.state().incorrectLocksThisQuestion !== value) {
            await this._setState({
                incorrectLocksThisQuestion: value,
            });
        }
    }

    /**
     * Sets the global state option that causes an incorrect answer to lock that
     * player's entire team for the current question.
     */
    public async setIncorrectLocksTeamThisQuestion(
        value: boolean,
    ): Promise<void> {
        if (this.state().incorrectLocksTeamThisQuestion !== value) {
            await this._setState({
                incorrectLocksTeamThisQuestion: value,
            });
        }
    }

    /** Buzzes in the given player. */
    public async buzzIn(playerId: string): Promise<void> {
        try {
            await this._data.buzzInPlayer(playerId);
        } catch (error) {
            this._toast.error('Failed to buzz in player.', error);
        }
    }

    /** Buzzes out the given player. */
    public async resetBuzzer(playerId: string): Promise<void> {
        try {
            await this._data.resetPlayerBuzzer(playerId);
        } catch (error) {
            this._toast.error('Failed to reset player buzzer.', error);
        }
    }

    /** Resets the buzzers for all players. */
    public async resetAllBuzzers(): Promise<void> {
        try {
            await this._data.resetAllPlayerBuzzers();
        } catch (error) {
            this._toast.error('Failed to reset player buzzers.', error);
        }
    }

    /** Sets the player's lock state. */
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

    /** Unlocks all player buzzers. */
    public async unlockAll(): Promise<void> {
        try {
            await this._data.unlockAllPlayers();
        } catch (error) {
            this._toast.error('Failed to unlock all players.', error);
        }
    }

    /**
     * Marks the given player as "correct", which has knock-on effects based on
     * the current state options.
     */
    public async markCorrect(player: Entity<BuzzerPlayer>): Promise<void> {
        try {
            await this._data.markCorrect(player.id);
        } catch (error) {
            this._toast.error('Failed to mark player as correct.', error);
        }
    }

    /**
     * Marks the given player as "incorrect", which has knock-on effects based
     * on the current state options.
     */
    public async markIncorrect(player: Entity<BuzzerPlayer>): Promise<void> {
        try {
            await this._data.markIncorrect(player.id);
        } catch (error) {
            this._toast.error('Failed to mark player as incorrect.', error);
        }
    }

    /** Gets the team information for the given player. */
    public getTeam(
        player: BuzzerPlayer,
        teams: Entity<BuzzerTeam>[],
    ): Entity<BuzzerTeam> | undefined {
        return teams.find((t) => t.id === player.teamId);
    }

    /** Sets the global buzzer state. */
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
