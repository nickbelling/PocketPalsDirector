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
    Entity,
    subscribeToDocument,
} from '../../common/firestore';
import {
    BuzzerPlayer,
    BUZZERS_PLAYERS_COLLECTION_PATH,
    BuzzerState,
    BuzzerTeam,
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

/**
 * The data store service for a single player's buzzer state. Can read
 * information about the global state, the team and the player themselves, but
 * is only capable of actually being able to set the current timestamp on that
 * player's buzzer.
 *
 * Requires the `BUZZER_PLAYER_ID_TOKEN` to be set. This means the component
 * using this service needs to include `providePlayerIdToken()` in its
 * `providers` array.
 */
@Injectable()
export class BuzzerPlayerDataStore extends BaseFirestoreDataStore {
    private _playerId = inject<string>(BUZZER_PLAYER_ID_TOKEN);
    private _stateData = inject(BuzzerStateDataStore);
    private _teamsData = inject(BuzzerTeamsDataStore);
    private _playerRef: DocumentReference<BuzzerPlayer>;

    public readonly state: Signal<BuzzerState> = this._stateData.state;
    public readonly player = signal<BuzzerPlayer>(DEFAULT_BUZZER_PLAYER);

    /** The ID of the current player's team (may be null). */
    public readonly playerTeamId = computed<string | null>(
        () => this.player().teamId,
    );

    /**
     * Represents the current player's team, computed from the `playerTeamId`
     * and the list of teams.
     */
    public readonly team = computed<Entity<BuzzerTeam> | undefined>(() => {
        const teamId = this.playerTeamId();
        const teams = this._teamsData.teams();

        return teams.find((t) => t.id === teamId);
    });

    constructor() {
        super();

        // Subscribe to updates about the current player
        this._playerRef = subscribeToDocument<BuzzerPlayer>(
            `${BUZZERS_PLAYERS_COLLECTION_PATH}/${this._playerId}`,
            (data) => {
                this.player.set(data || DEFAULT_BUZZER_PLAYER);
            },
        );
    }

    /**
     * Buzzes the current player in by setting their `buzzTimestamp` to the
     * current server time.
     */
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
            throw new Error('Could not buzz.');
        }
    }
}
