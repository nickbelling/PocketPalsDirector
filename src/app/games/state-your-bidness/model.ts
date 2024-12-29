export interface StateYourBidnessState {
    currentQuestion: string | null;
    committedTo: number;
    guessedAnswers: string[];
    showRemainingAnswers: boolean;
    questionsDone: string[];
}

export const STATE_YOUR_BUSINESS_STATE_DEFAULT: StateYourBidnessState = {
    currentQuestion: null,
    committedTo: 0,
    guessedAnswers: [],
    showRemainingAnswers: false,
    questionsDone: [],
};

export interface StateYourBidnessQuestion {
    name: string;
    description: string;
    items: string[];
}
