import { CommonModule } from '@angular/common';
import { Component, effect, inject, linkedSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Title } from '@angular/platform-browser';
import {
    BuzzerPlayerDataStore,
    providePlayerIdToken,
} from '../data/player-data';

@Component({
    imports: [CommonModule, MatButtonModule],
    templateUrl: './buzzer-player.html',
    styleUrl: './buzzer-player.scss',
    providers: [providePlayerIdToken(), BuzzerPlayerDataStore],
})
export class BuzzerPlayerButton {
    private _data = inject(BuzzerPlayerDataStore);
    private _title = inject(Title);

    protected state = this._data.state;
    protected player = this._data.player;
    protected team = this._data.team;

    protected canBuzz = linkedSignal(() => {
        const state = this.state();
        const player = this.player();

        return (
            state.buzzersEnabled &&
            player.buzzTimestamp === null &&
            !player.lockedOut
        );
    });

    constructor() {
        effect(() => {
            const player = this.player();
            this._title.setTitle(`Pocket Pals Buzzer: ${player.name}`);
        });
    }

    public async buzz(): Promise<void> {
        // Immediately set "canBuzz" to false, so that the user can't
        // double-click the button
        this.canBuzz.set(false);

        await this._data.buzz();
    }
}
