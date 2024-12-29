export interface RankyPankyState {
    currentQuestion: string | null;
    questionsDone: string[];
    revealedCards: number;
    currentGuessedOrder: number[];
    revealedAnswers: number;
}

export const RANKY_PANKY_STATE_DEFAULT: RankyPankyState = {
    currentQuestion: null,
    questionsDone: [],
    revealedCards: 0,
    currentGuessedOrder: [],
    revealedAnswers: 0,
};

export interface RankyPankyQuestion {
    name: string;
    description: string;
    items: RankyPankyQuestionItem[];
}

export interface RankyPankyQuestionItem {
    index: number;
    name: string;
    value: number;
    uploadedFilePath: string;
}
