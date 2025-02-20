export const BEAT_IT_BASE_PATH = 'games/beat-it';

export interface BeatItState {
    /** The current question ID. Null if no question selected. */
    currentQuestion: string | null;

    /** The IDs of completed questions (used to grey them out in the category list). */
    questionsDone: string[];

    /** The current guess (in hours). */
    currentGuess: number;

    /** The opposing team's "above"/"below" guess. Null if unset. True if "above". */
    opposingTeamGuess: boolean | null;

    /** True if the answer is being show. */
    showingAnswer: boolean;
}

export const BEAT_IT_STATE_DEFAULT: BeatItState = {
    currentQuestion: null,
    questionsDone: [],
    currentGuess: 0,
    opposingTeamGuess: null,
    showingAnswer: false,
};

export interface BeatItQuestion {
    /** The VGDB game ID for this question. */
    gameId: string;

    /** The canon number of hours this game takes according to HowLongToBeat. */
    hours: number;
}
