export interface StateYourBidnessState {
    /** The current question ID. Null if no question selected. */
    currentQuestion: string | null;

    /**
     * The number of items in the current question the players have committed to.
     */
    committedTo: number;

    /** True if the main (2 minute) timer is running. */
    mainTimerRunning: boolean;

    /** True if the secondary (30 second) timer is running. */
    secondaryTimerRunning: boolean;

    /** The correctly guessed answers. */
    guessedAnswers: string[];

    /** True if the remaining answers should be showing. */
    showRemainingAnswers: boolean;

    /**
     * Stores the IDs of completed questions for greying out in a category list.
     * Unused for now, might restore the category list in future.
     */
    questionsDone: string[];
}

export const STATE_YOUR_BUSINESS_STATE_DEFAULT: StateYourBidnessState = {
    currentQuestion: null,
    committedTo: 0,
    mainTimerRunning: false,
    secondaryTimerRunning: false,
    guessedAnswers: [],
    showRemainingAnswers: false,
    questionsDone: [],
};

export interface StateYourBidnessQuestion {
    /** The title/name of this question. */
    name: string;

    /** A more verbose description of the items in this question. */
    description: string;

    /** The list of items available for guessing in this question. */
    items: string[];
}
