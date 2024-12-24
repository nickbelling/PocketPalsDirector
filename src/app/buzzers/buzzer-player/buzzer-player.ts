import { CommonModule } from '@angular/common';
import { Component, inject, linkedSignal } from '@angular/core';
import {
    BuzzerPlayerDataStore,
    providePlayerIdToken,
} from '../data/player-data';

@Component({
    imports: [CommonModule],
    templateUrl: './buzzer-player.html',
    providers: [providePlayerIdToken(), BuzzerPlayerDataStore],
})
export class BuzzerPlayerButton {
    private _data = inject(BuzzerPlayerDataStore);

    protected state = this._data.state;
    protected player = this._data.player;

    protected canBuzz = linkedSignal(() => {
        const state = this.state();
        const player = this.player();

        return (
            state.buzzersEnabled &&
            player.buzzTimestamp === null &&
            !player.lockedOut
        );
    });

    public async buzz(): Promise<void> {
        // Immediately set "canBuzz" to false, so that the user can't
        // double-click the button
        this.canBuzz.set(false);

        await this._data.buzz();
    }
}
