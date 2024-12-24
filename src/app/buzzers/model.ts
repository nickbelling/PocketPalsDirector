import { Timestamp } from 'firebase/firestore';

export const BUZZERS_STATE_DOC_PATH = 'buzzer/state';
export const BUZZERS_PLAYERS_COLLECTION_PATH = 'buzzer/state/players';

export interface BuzzerState {
    buzzersEnabled: boolean;
}

export interface BuzzerPlayer {
    name: string;
    createdAt: Timestamp;
    buzzTimestamp: Timestamp | null;
    lockedOut: boolean;
    soundEffect: string | null;
}

export const DEFAULT_BUZZER_STATE: BuzzerState = {
    buzzersEnabled: true,
};

export const DEFAULT_BUZZER_PLAYER: BuzzerPlayer = {
    name: 'Default',
    createdAt: Timestamp.now(),
    buzzTimestamp: null,
    lockedOut: false,
    soundEffect: null,
};
