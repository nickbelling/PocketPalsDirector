export const TAG_YOURE_IT_BASE_PATH = 'games/tag-youre-it';

export interface TagYoureItState {
    /**
     * The current question ID. Null if no question selected.
     */
    currentQuestion: string | null;

    /**
     * The number of cards which have been revealed from the set the player is
     * able to manipulate.
     */
    revealedTags: number;
}

export const TAG_YOURE_IT_STATE_DEFAULT: TagYoureItState = {
    currentQuestion: null,
    revealedTags: 0,
};

export interface TagYoureItQuestion {
    /** The VGDB game ID for the game these tags are from. */
    gameId: string;

    /** The app ID of the game as it appears on Steam. */
    steamAppId: number;

    /** The Steam user tags. */
    tags: string[];
}
