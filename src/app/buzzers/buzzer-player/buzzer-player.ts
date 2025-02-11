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
import { AudioService } from '../../common/audio';
import {
    BuzzerPlayerDataStore,
    providePlayerIdToken,
} from '../data/player-data';

export type BuzzerButtonState = 'disabled' | 'locked' | 'buzzed' | 'active';

/** The screen that displays the "buzz in" button for a player. */
@Component({
    imports: [CommonModule, MatButtonModule, MatSlideToggleModule],
    templateUrl: './buzzer-player.html',
    styleUrl: './buzzer-player.scss',
    providers: [providePlayerIdToken(), BuzzerPlayerDataStore],
})
export class BuzzerPlayerButton {
    private _data = inject(BuzzerPlayerDataStore);
    private _title = inject(Title);
    private _audio = inject(AudioService);

    /**
     * Used to detect whether or not the buzzer went from "can't buzz" to
     * "can buzz" and vice-versa.
     */
    private _previousReadyState = false;

    /** User option to play a sound or not when the buzzer becomes ready. */
    protected playSounds = signal<boolean>(true);

    /** The current global state of the buzzers. */
    protected state = this._data.state;

    /** The current player's information. */
    protected player = this._data.player;

    /** The current player's team information. */
    protected team = this._data.team;

    /** True if the buzzers are currently enabled globally. */
    protected buzzersEnabled = computed<boolean>(
        () => this.state().buzzersEnabled,
    );

    /** True if this player is currently buzzed in. */
    protected buzzedIn = computed<boolean>(
        () => this.player().buzzTimestamp !== null,
    );

    /** True if this player is currently locked out. */
    protected lockedOut = computed(() => this.player().lockedOut);

    /**
     * True if this player can currently buzz in. This is a linkedSignal so that
     * the button can be immediately disabled client-side when they click it, in
     * order to prevent accidental double-submission.
     */
    protected canBuzz = linkedSignal(() => {
        const buzzersEnabled = this.buzzersEnabled();
        const buzzedIn = this.buzzedIn();
        const lockedOut = this.lockedOut();

        return buzzersEnabled && !buzzedIn && !lockedOut;
    });

    /**
     * Calculates the current "state" of the buzzer in order to display an
     * explanation message to the user as to WHY they can't buzz in if they
     * currently can't.
     */
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
        // Set page title
        effect(() => {
            const player = this.player();
            this._title.setTitle(`Pocket Pals Buzzer: ${player.name}`);
        });

        // Play a helpful sound effect to indicate to the user that they can
        // buzz in when they're ready to do so.
        effect(() => {
            const canBuzz = this.canBuzz();

            if (this._previousReadyState === false && canBuzz === true) {
                // Went from cannot buzz to buzz, play sound
                if (this.playSounds()) {
                    this._audio.playAudio('audio/ready.mp3');
                }
            }

            this._previousReadyState = canBuzz;
        });
    }

    /** Buzzes this player in. */
    public async buzz(): Promise<void> {
        // Immediately set "canBuzz" to false, so that the user can't
        // double-click the button
        this.canBuzz.set(false);
        await this._data.buzz();
    }
}
