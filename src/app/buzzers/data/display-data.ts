import { inject, Injectable, Signal } from '@angular/core';
import { Entity } from '../../common/firestore';
import { BuzzerPlayer, BuzzerState, BuzzerTeam } from './model';
import { BuzzerPlayersDataStore } from './players-data';
import { BuzzerStateDataStore } from './state-data';
import { BuzzerTeamsDataStore } from './teams-data';

/**
 * The aggregate data store service for displaying information about the current
 * state of the buzzers. For viewing only - can't edit anything.
 */
@Injectable({
    providedIn: 'root',
})
export class BuzzerDisplayDataStore {
    private _stateData = inject(BuzzerStateDataStore);
    private _playersData = inject(BuzzerPlayersDataStore);
    private _teamsData = inject(BuzzerTeamsDataStore);

    public readonly state: Signal<BuzzerState> = this._stateData.state;
    public readonly players: Signal<Entity<BuzzerPlayer>[]> =
        this._playersData.players;
    public readonly teams: Signal<Entity<BuzzerTeam>[]> = this._teamsData.teams;
}
