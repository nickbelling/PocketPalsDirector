import {
    computed,
    inject,
    Injectable,
    InjectionToken,
    Provider,
    Signal,
    signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocumentReference, serverTimestamp, setDoc } from 'firebase/firestore';
import {
    BaseFirestoreDataStore,
    subscribeToDocument,
} from '../../common/firestore';
import {
    BuzzerPlayer,
    BUZZERS_PLAYERS_COLLECTION_PATH,
    BuzzerState,
    DEFAULT_BUZZER_PLAYER,
} from './model';
import { BuzzerStateDataStore } from './state-data';
import { BuzzerTeamsDataStore } from './teams-data';

/** The injection token for the current player's ID. */
export const BUZZER_PLAYER_ID_TOKEN = new InjectionToken<string>(
    'BUZZER_PLAYER_ID_TOKEN',
);

/**
 * Gets the player ID from the route's ':playerId' property and sets it as the
 * BUZZER_PLAYER_ID_TOKEN, for injection.
 */
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
export class BuzzerPlayerDataStore extends BaseFirestoreDataStore {
    private _playerId = inject<string>(BUZZER_PLAYER_ID_TOKEN);
    private _stateData = inject(BuzzerStateDataStore);
    private _teamsData = inject(BuzzerTeamsDataStore);

    public readonly state: Signal<BuzzerState> = this._stateData.state;
    public readonly player = signal<BuzzerPlayer>(DEFAULT_BUZZER_PLAYER);
    public readonly playerTeamId = computed(() => this.player().teamId);
    public readonly team = computed(() => {
        const teamId = this.playerTeamId();
        const teams = this._teamsData.teams();

        return teams.find((t) => t.id === teamId);
    });

    private _playerRef: DocumentReference<BuzzerPlayer>;

    constructor() {
        super();

        this._playerRef = subscribeToDocument<BuzzerPlayer>(
            `${BUZZERS_PLAYERS_COLLECTION_PATH}/${this._playerId}`,
            (data) => {
                this.player.set(data || DEFAULT_BUZZER_PLAYER);
            },
        );
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
