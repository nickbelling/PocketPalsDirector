export const IMPOCKSTERS_BASE_PATH = 'games/impocksters';

export interface ImpockstersState {
    /** The current question ID. Null if no question selected. */
    currentQuestion: string | null;

    /** True if the timer is currently being shown. */
    timerRunning: boolean;
}

export const IMPOCKSTERS_STATE_DEFAULT: ImpockstersState = {
    currentQuestion: null,
    timerRunning: false,
};

export type ImpocksterOriginType = 'game' | 'series';

export interface ImpockstersQuestion {
    /** The name of the character. */
    name: string;

    /** The game or series this character is from. */
    from: string;

    /** Whether or not the character is from a game or a series. */
    fromType: ImpocksterOriginType;

    /** The relative image path in storage. */
    imageId: string;

    /** The forbidden terms that cannot be said when guessing the character. */
    forbiddenTerms: string[];
}
