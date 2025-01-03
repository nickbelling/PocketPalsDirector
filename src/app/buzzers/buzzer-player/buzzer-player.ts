import { CommonModule } from '@angular/common';
import {
    Component,
    computed,
    effect,
    inject,
    linkedSignal,
    signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Title } from '@angular/platform-browser';
import { SoundService } from '../../common/files';
import {
    BuzzerPlayerDataStore,
    providePlayerIdToken,
} from '../data/player-data';

export type BuzzerButtonState = 'disabled' | 'locked' | 'buzzed' | 'active';

@Component({
    imports: [CommonModule, MatButtonModule, MatSlideToggleModule],
    templateUrl: './buzzer-player.html',
    styleUrl: './buzzer-player.scss',
    providers: [providePlayerIdToken(), BuzzerPlayerDataStore],
})
export class BuzzerPlayerButton {
    private _data = inject(BuzzerPlayerDataStore);
    private _title = inject(Title);
    private _sounds = inject(SoundService);
    private _previousReadyState = false;

    protected playSounds = signal<boolean>(true);

    protected state = this._data.state;
    protected player = this._data.player;
    protected team = this._data.team;

    protected buzzersEnabled = computed(() => this.state().buzzersEnabled);
    protected buzzedIn = computed(() => this.player().buzzTimestamp !== null);
    protected lockedOut = computed(() => this.player().lockedOut);

    protected canBuzz = linkedSignal(() => {
        const buzzersEnabled = this.buzzersEnabled();
        const buzzedIn = this.buzzedIn();
        const lockedOut = this.lockedOut();

        return buzzersEnabled && !buzzedIn && !lockedOut;
    });

    protected buzzerState = computed<BuzzerButtonState>(() => {
        const state = this.state();
        const player = this.player();

        if (!state.buzzersEnabled) {
            return 'disabled';
        } else if (player.lockedOut) {
            return 'locked';
        } else if (player.buzzTimestamp !== null) {
            return 'buzzed';
        } else {
            return 'active';
        }
    });

    constructor() {
        effect(() => {
            const player = this.player();
            this._title.setTitle(`Pocket Pals Buzzer: ${player.name}`);
        });

        effect(() => {
            const canBuzz = this.canBuzz();

            if (this._previousReadyState === false && canBuzz === true) {
                // Went from cannot buzz to buzz, play sound
                if (this.playSounds()) {
                    this._sounds.playSound('audio/ready.mp3');
                }
            }

            this._previousReadyState = canBuzz;
        });
    }

    public async buzz(): Promise<void> {
        // Immediately set "canBuzz" to false, so that the user can't
        // double-click the button
        this.canBuzz.set(false);
        await this._data.buzz();
    }
}
