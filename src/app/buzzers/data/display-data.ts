import { inject, Injectable, Signal } from '@angular/core';
import { Entity } from '../../common';
import { BuzzerPlayer, BuzzerState, BuzzerTeam } from '../model';
import { BuzzerPlayersDataStore } from './players-data';
import { BuzzerStateDataStore } from './state-data';
import { BuzzerTeamsDataStore } from './teams-data';

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
