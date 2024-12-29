import { Timestamp } from 'firebase/firestore';

export const BUZZERS_STATE_DOC_PATH = 'buzzer/state';
export const BUZZERS_PLAYERS_COLLECTION_PATH = 'buzzer/state/players';
export const BUZZERS_TEAMS_COLLECTION_PATH = 'buzzer/state/teams';
export const BUZZERS_STORAGE_IMAGES_PATH = 'buzzer/images';
export const BUZZERS_STORAGE_SOUNDS_PATH = 'buzzer/sounds';

export interface BuzzerState {
    buzzersEnabled: boolean;
    correctLocksNextQuestion: boolean;
    incorrectLocksThisQuestion: boolean;
}

export interface BuzzerPlayer {
    name: string;
    createdAt: Timestamp;
    buzzTimestamp: Timestamp | null;
    lockedOut: boolean;
    image: string | null;
    soundEffect: string | null;
    teamId: string | null;
}

export interface BuzzerTeam {
    name: string;
    color: string;
    createdAt: Timestamp;
}

export const DEFAULT_BUZZER_STATE: BuzzerState = {
    buzzersEnabled: false,
    correctLocksNextQuestion: true,
    incorrectLocksThisQuestion: true,
};

export const DEFAULT_BUZZER_PLAYER: BuzzerPlayer = {
    name: 'Default',
    createdAt: Timestamp.now(),
    buzzTimestamp: null,
    lockedOut: false,
    image: null,
    soundEffect: null,
    teamId: null,
};

export const DEFAULT_BUZZER_TEAM: BuzzerTeam = {
    name: '',
    color: '#FFFFFF',
    createdAt: Timestamp.now(),
};
