export interface StateYourBidnessState {
    currentQuestion: string | null;
    committedTo: number;
    mainTimerRunning: boolean;
    secondaryTimerRunning: boolean;
    guessedAnswers: string[];
    showRemainingAnswers: boolean;
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
    name: string;
    description: string;
    items: string[];
}
