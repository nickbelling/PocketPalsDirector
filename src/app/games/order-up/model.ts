export const ORDER_UP_BASE_PATH = 'games/order-up';

export interface OrderUpState {
    currentQuestion: string | null;
    questionsDone: string[];
    currentQuestionRevealOrder: number[];
    revealedCount: number;
    currentPosition: number;
}

export const ORDER_UP_STATE_DEFAULT: OrderUpState = {
    currentQuestion: null,
    questionsDone: [],
    currentQuestionRevealOrder: [],
    revealedCount: 0,
    currentPosition: 0,
};

export interface OrderUpQuestion {
    name: string;
    description: string;
    /** The items for this question, in their correct order. */
    items: OrderUpQuestionItem[];
}

export interface OrderUpQuestionItem {
    order: number;
    name: string;
    value: string;
    imageId: string;
}
