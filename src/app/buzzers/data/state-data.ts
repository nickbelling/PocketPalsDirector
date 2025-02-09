import { Injectable, signal } from '@angular/core';
import { DocumentData, DocumentReference, setDoc } from 'firebase/firestore';
import { subscribeToDocument } from '../../common/firestore';
import {
    BUZZERS_STATE_DOC_PATH,
    BuzzerState,
    DEFAULT_BUZZER_STATE,
} from './model';

/**
 * The data store that represents the current global state of the buzzers.
 * Shared by the Director, Player and Display services.
 */
@Injectable({
    providedIn: 'root',
})
export class BuzzerStateDataStore {
    private _stateRef: DocumentReference<BuzzerState, DocumentData>;

    // The current global state for the buzzers.
    public state = signal<BuzzerState>(DEFAULT_BUZZER_STATE);

    constructor() {
        // Subscribe to the global BuzzerState document and set the Signal when
        // it changes.
        this._stateRef = subscribeToDocument<BuzzerState>(
            BUZZERS_STATE_DOC_PATH,
            (data) => {
                this.state.set(data || DEFAULT_BUZZER_STATE);
            },
        );
    }

    /** Sets the global buzzer state. */
    public async setState(
        state: BuzzerState | Partial<BuzzerState>,
    ): Promise<void> {
        await setDoc(this._stateRef, state, { merge: true });
    }

    /** Enables the buzzers. */
    public async enableBuzzers(): Promise<void> {
        await this.setState({ buzzersEnabled: true });
    }

    /** Disables the buzzers. */
    public async disableBuzzers(): Promise<void> {
        await this.setState({ buzzersEnabled: false });
    }
}
