import { Timestamp } from 'firebase/firestore';

export const BUZZERS_STATE_DOC_PATH = 'buzzer/state';
export const BUZZERS_PLAYERS_COLLECTION_PATH = 'buzzer/state/players';
export const BUZZERS_TEAMS_COLLECTION_PATH = 'buzzer/state/teams';
export const BUZZERS_STORAGE_IMAGES_PATH = 'buzzer/images';
export const BUZZERS_STORAGE_SOUNDS_PATH = 'buzzer/sounds';

/** The global state of all the buzzers. */
export interface BuzzerState {
    /** True if the buzzers are enabled. If false, no one can buzz in. */
    buzzersEnabled: boolean;

    /**
     * True if marking a player as "correct" should lock that player and unlock
     * any currently-locked players.
     */
    correctLocksNextQuestion: boolean;

    /**
     * True if marking a player as "incorrect" should lock that player until
     * another player has been marked as "correct".
     */
    incorrectLocksThisQuestion: boolean;

    /**
     * True if marking a player as "incorrect" should lock that player and every
     * other player on their team until another player has been marked as
     * "correct".
     */
    incorrectLocksTeamThisQuestion: boolean;
}

/** Represents a single buzzer player. */
export interface BuzzerPlayer {
    /** Display name of the player. */
    name: string;

    /** Timestamp of the player's database creation. */
    createdAt: Timestamp;

    /**
     * The point in time the player buzzed in - should be set to the Firebase
     * `serverTimestamp()` in order to be fair.
     *
     * The only field directly editable by a non-authed user (the player).
     */
    buzzTimestamp: Timestamp | null;

    /** True if the player is currently locked out of being able to buzz. */
    lockedOut: boolean;

    /** The player's custom image. If null, displays a generic image. */
    image: string | null;

    /** The player's custom sound effect. If null, does not play a sound. */
    soundEffect: string | null;

    /**
     * The ID of the BuzzerTeam this player is a member of. If null, this player
     * is not a member of a team.
     */
    teamId: string | null;
}

/** Represents a team that players can be a member of. */
export interface BuzzerTeam {
    /** The team name. */
    name: string;

    /** A CSS string representing the team's color. */
    color: string;

    /** Timestamp of the team's database creation. */
    createdAt: Timestamp;
}

export const DEFAULT_BUZZER_STATE: BuzzerState = {
    buzzersEnabled: false,
    correctLocksNextQuestion: true,
    incorrectLocksThisQuestion: true,
    incorrectLocksTeamThisQuestion: false,
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
