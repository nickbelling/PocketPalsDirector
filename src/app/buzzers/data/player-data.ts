import {
    computed,
    effect,
    inject,
    Injectable,
    InjectionToken,
    Provider,
    signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
    doc,
    DocumentReference,
    getDoc,
    serverTimestamp,
    setDoc,
} from 'firebase/firestore';
import { FIRESTORE, getConverter, subscribeToDocument } from '../../common';
import {
    BuzzerPlayer,
    BUZZERS_PLAYERS_COLLECTION_PATH,
    BUZZERS_STATE_DOC_PATH,
    BUZZERS_TEAMS_COLLECTION_PATH,
    BuzzerState,
    BuzzerTeam,
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
    private _playerId = inject<string>(BUZZER_PLAYER_ID_TOKEN);

    public readonly state = signal<BuzzerState>(DEFAULT_BUZZER_STATE);
    public readonly player = signal<BuzzerPlayer>(DEFAULT_BUZZER_PLAYER);
    public readonly team = signal<BuzzerTeam | undefined>(undefined);

    private _stateRef: DocumentReference<BuzzerState>;
    private _playerRef: DocumentReference<BuzzerPlayer>;

    public readonly playerTeamId = computed(() => {
        const player = this.player();

        if (player) {
            return player.teamId;
        } else {
            return null;
        }
    });

    constructor() {
        this._stateRef = subscribeToDocument<BuzzerState>(
            BUZZERS_STATE_DOC_PATH,
            (data) => {
                this.state.set(data || DEFAULT_BUZZER_STATE);
            },
        );

        this._playerRef = subscribeToDocument<BuzzerPlayer>(
            `${BUZZERS_PLAYERS_COLLECTION_PATH}/${this._playerId}`,
            (data) => {
                this.player.set(data || DEFAULT_BUZZER_PLAYER);
            },
        );

        const firestore = inject(FIRESTORE);
        effect(async () => {
            const teamId = this.playerTeamId();

            if (teamId) {
                const teamRef = doc(
                    firestore,
                    `${BUZZERS_TEAMS_COLLECTION_PATH}/${teamId}`,
                ).withConverter(getConverter<BuzzerTeam>());

                const teamSnapshot = await getDoc(teamRef);

                if (teamSnapshot.exists()) {
                    this.team.set(teamSnapshot.data());
                }
            }
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
