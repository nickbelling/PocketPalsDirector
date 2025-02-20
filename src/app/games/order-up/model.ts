export const ORDER_UP_BASE_PATH = 'games/order-up';

export interface OrderUpState {
    /**
     * The current question ID. Null if no question selected. If null, the
     * category list is being displayed.
     */
    currentQuestion: string | null;

    /**
     * The IDs of questions which have been done. Used to grey out categories
     * in the category list.
     */
    questionsDone: string[];

    /**
     * For the current question, the reveal order of the item indexes inside it.
     * Randomly shuffled at the point in time the question is chosen.
     */
    currentQuestionRevealOrder: number[];

    /**
     * The amount of items in the reveal order whose official position has been
     * revealed.
     */
    revealedCount: number;

    /**
     * The current position in the array of the currently "pending" item (i.e.
     * the next item to be revealed).
    ) */
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
    /** The name of this question/category. */
    name: string;

    /** Description of this question (director reference only). */
    description: string;

    /**
     * The items for this question, in their correct order. Note that because
     * the value might be anything - a number, a date, etc - the order must be
     * manually set.
     */
    items: OrderUpQuestionItem[];
}

export interface OrderUpQuestionItem {
    /** The item's official "order". */
    order: number;

    /** The displayed name of the item. */
    name: string;

    /** The "value" of the item. */
    value: string;

    /** The relative path to this item's image in storage. */
    imageId: string;
}
