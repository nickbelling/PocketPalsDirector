import { Component, computed, inject, signal } from '@angular/core';
import { Entity } from '../../common/firestore';
import { CommonControllerModule } from '../../games/base/controller';
import { BuzzerDirectorDataStore } from '../data/director-data';
import { BuzzerPlayer, BuzzerTeam } from '../data/model';

@Component({
    selector: 'buzzer-controller',
    imports: [CommonControllerModule],
    templateUrl: './buzzer-controller.html',
    styleUrl: './buzzer-controller.scss',
})
export class BuzzerController {
    private _data = inject(BuzzerDirectorDataStore);

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

    public async setIncorrectLocksTeamThisQuestion(
        value: boolean,
    ): Promise<void> {
        if (this.state().incorrectLocksTeamThisQuestion !== value) {
            await this._data.setState({
                incorrectLocksTeamThisQuestion: value,
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
        await this._data.markCorrect(player.id);
    }

    public async markIncorrect(player: Entity<BuzzerPlayer>): Promise<void> {
        await this._data.markIncorrect(player.id);
    }

    public getTeam(
        player: BuzzerPlayer,
        teams: Entity<BuzzerTeam>[],
    ): Entity<BuzzerTeam> | undefined {
        return teams.find((t) => t.id === player.teamId);
    }
}
