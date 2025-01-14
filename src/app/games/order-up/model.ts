export const ORDER_UP_BASE_PATH = 'games/order-up';

export interface OrderUpState {
    currentQuestion: string | null;
}

export const ORDER_UP_STATE_DEFAULT: OrderUpState = {
    currentQuestion: null,
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
