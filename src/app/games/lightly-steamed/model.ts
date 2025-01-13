export const LIGHTLY_STEAMED_BASE_PATH = 'games/lightly-steamed';

export interface LightlySteamedState {
    currentQuestion: string | null;
    currentReview: number;
    currentSentence: number;
}

export const LIGHTLY_STEAMED_STATE_DEFAULT: LightlySteamedState = {
    currentQuestion: null,
    currentReview: 0,
    currentSentence: 0,
};

export interface LightlySteamedQuestion {
    gameId: string;
    reviews: LightlySteamedQuestionReview[];
}

export interface LightlySteamedQuestionReview {
    username: string;
    hoursPlayed: number;
    isPositive: boolean;
    review: string;
}
