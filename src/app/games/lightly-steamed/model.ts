export const LIGHTLY_STEAMED_BASE_PATH = 'games/lightly-steamed';

export interface LightlySteamedState {
    /** The current question ID. Null if no question selected. */
    currentQuestion: string | null;

    /** The currently displayed review (1-5). 0 shows no review. */
    currentReview: number;

    /** The amount of sentences from the review currently being shown. */
    currentSentence: number;

    /** True if the answer is showing. */
    showingAnswer: boolean;
}

export const LIGHTLY_STEAMED_STATE_DEFAULT: LightlySteamedState = {
    currentQuestion: null,
    currentReview: 0,
    currentSentence: 0,
    showingAnswer: false,
};

export interface LightlySteamedQuestion {
    /** The VGDB game ID this question relates to. */
    gameId: string;

    /** The reviews for this game, in order of obscurity. */
    reviews: LightlySteamedQuestionReview[];
}

export interface LightlySteamedQuestionReview {
    /** The username of the user who posted this review. */
    username: string;

    /** The number of hours played. */
    hoursPlayed: number;

    /** True if the review is positive. False is a negative review. */
    isPositive: boolean;

    /** The text of the review itself. */
    review: string;
}
