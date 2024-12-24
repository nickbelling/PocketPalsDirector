import { Injectable, signal } from '@angular/core';
import {
    Entity,
    subscribeToCollection,
    subscribeToDocument,
} from '../../common';
import {
    BuzzerPlayer,
    BUZZERS_PLAYERS_COLLECTION_PATH,
    BUZZERS_STATE_DOC_PATH,
    BuzzerState,
    DEFAULT_BUZZER_STATE,
} from '../model';

@Injectable({
    providedIn: 'root',
})
export class BuzzerDisplayDataStore {
    public readonly state = signal<BuzzerState>(DEFAULT_BUZZER_STATE);
    public readonly players = signal<Entity<BuzzerPlayer>[]>([]);

    constructor() {
        subscribeToDocument<BuzzerState>(BUZZERS_STATE_DOC_PATH, (data) => {
            this.state.set(data || DEFAULT_BUZZER_STATE);
        });

        subscribeToCollection<BuzzerPlayer>(
            BUZZERS_PLAYERS_COLLECTION_PATH,
            (data) => {
                this.players.set(data);
            },
        );
    }
}
