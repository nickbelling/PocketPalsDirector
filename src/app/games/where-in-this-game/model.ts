export const WHERE_IN_THIS_GAME_BASE_PATH = 'games/where-in-this-game';

export interface WhereInThisGameState {
    /** The current question being shown. */
    currentQuestion: string | null;

    /** The current location being shown for the current question (as an index
     * to the "locations" array). */
    currentLocation: number | null;

    /** A map of the current guesses. The key for the map is the player's ID,
     * the number is the index in the array of the */
    currentGuesses: Record<string, number>;

    /** True if the answer for the current question is currently visible. */
    showingAnswer: boolean;
}

export const WHERE_IN_THIS_GAME_STATE_DEFAULT: WhereInThisGameState = {
    currentQuestion: null,
    currentLocation: null,
    currentGuesses: {},
    showingAnswer: false,
};

export interface WhereInThisGameQuestion {
    /** The game this question relates to. */
    gameId: string;

    /** The relative path to this question's map image in storage. */
    mapImageId: string;

    /** The number of columns used for this map. */
    columns: number;

    /** The number of rows used for this map. */
    rows: number;

    /** The locations available for this map. */
    locations: WhereInThisGameQuestionLocation[];
}

export interface WhereInThisGameQuestionLocation {
    /** The name of the location. */
    name: string;

    /** The map reference number of the location, based on the number of columns
     * and rows visible on the map. For example, if the map has 5 columns and
     * rows, then A1-E1 would be 1-5, A2-E2 would be 6-10, etc. */
    locationReference: number;

    /** The relative path to this location's screenshot image in storage. */
    locationImageId: string;
}
