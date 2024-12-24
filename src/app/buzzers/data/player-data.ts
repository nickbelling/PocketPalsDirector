import {
    computed,
    DestroyRef,
    inject,
    Injectable,
    InjectionToken,
    Provider,
    signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocumentReference, serverTimestamp, setDoc } from 'firebase/firestore';
import { subscribeToDocument } from '../../common';
import {
    BuzzerPlayer,
    BUZZERS_PLAYERS_COLLECTION_PATH,
    BUZZERS_STATE_DOC_PATH,
    BuzzerState,
    DEFAULT_BUZZER_PLAYER,
    DEFAULT_BUZZER_STATE,
} from '../model';

export const BUZZER_PLAYER_ID_TOKEN = new InjectionToken<string>(
    'BUZZER_PLAYER_ID_TOKEN',
);

export function providePlayerIdToken(): Provider {
    return {
        provide: BUZZER_PLAYER_ID_TOKEN,
        useFactory: (route: ActivatedRoute) => {
            return route.snapshot.paramMap.get('playerId') || undefined;
        },
        deps: [ActivatedRoute],
    };
}

@Injectable()
export class BuzzerPlayerDataStore {
    private _destroyRef = inject(DestroyRef);
    private _playerId = inject<string>(BUZZER_PLAYER_ID_TOKEN);

    private _connectedState = signal<boolean>(false);
    private _connectedPlayer = signal<boolean>(false);
    public readonly connected = computed<boolean>(
        () => this._connectedState() && this._connectedPlayer(),
    );

    public readonly state = signal<BuzzerState>(DEFAULT_BUZZER_STATE);
    public readonly player = signal<BuzzerPlayer>(DEFAULT_BUZZER_PLAYER);

    private _stateRef: DocumentReference<BuzzerState>;
    private _playerRef: DocumentReference<BuzzerPlayer>;

    constructor() {
        this._stateRef = subscribeToDocument<BuzzerState>(
            BUZZERS_STATE_DOC_PATH,
            (data) => {
                this._connectedState.set(true);
                this.state.set(data || DEFAULT_BUZZER_STATE);
            },
        );

        this._playerRef = subscribeToDocument<BuzzerPlayer>(
            `${BUZZERS_PLAYERS_COLLECTION_PATH}/${this._playerId}`,
            (data) => {
                this._connectedPlayer.set(true);
                this.player.set(data || DEFAULT_BUZZER_PLAYER);
            },
        );

        this._destroyRef.onDestroy(() => {
            this._connectedState.set(false);
            this._connectedPlayer.set(false);
        });
    }

    public async buzz(): Promise<void> {
        const state = this.state();
        const player = this.player();

        if (
            state.buzzersEnabled && // globally buzzers are enabled
            !player.lockedOut && // player not locked out
            player.buzzTimestamp === null // hasn't already buzzed in
        ) {
            await setDoc(
                this._playerRef,
                { buzzTimestamp: serverTimestamp() },
                { merge: true },
            );
        } else {
            throw new Error('Could not buzz');
        }
    }
}
