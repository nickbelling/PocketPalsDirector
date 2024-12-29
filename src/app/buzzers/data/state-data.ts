import { Injectable, signal } from '@angular/core';
import { DocumentData, DocumentReference, setDoc } from 'firebase/firestore';
import { subscribeToDocument } from '../../common';
import {
    BUZZERS_STATE_DOC_PATH,
    BuzzerState,
    DEFAULT_BUZZER_STATE,
} from '../model';

@Injectable({
    providedIn: 'root',
})
export class BuzzerStateDataStore {
    public state = signal<BuzzerState>(DEFAULT_BUZZER_STATE);
    private _stateRef: DocumentReference<BuzzerState, DocumentData>;

    constructor() {
        this._stateRef = subscribeToDocument<BuzzerState>(
            BUZZERS_STATE_DOC_PATH,
            (data) => {
                this.state.set(data || DEFAULT_BUZZER_STATE);
            },
        );
    }

    public async setState(
        state: BuzzerState | Partial<BuzzerState>,
    ): Promise<void> {
        await setDoc(this._stateRef, state, { merge: true });
    }

    public async enableBuzzers(): Promise<void> {
        await this.setState({ buzzersEnabled: true });
    }

    public async disableBuzzers(): Promise<void> {
        await this.setState({ buzzersEnabled: false });
    }
}
