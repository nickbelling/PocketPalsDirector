export const RANKY_PANKY_BASE_PATH = 'games/ranky-panky';

export interface RankyPankyState {
    /**
     * The current question ID. Null if no question selected. If null, the
     * question/category list is currently being displayed.
     */
    currentQuestion: string | null;

    /**
     * The IDs of questions which have been done. Used to grey out completed
     * categories in the category list.
     */
    questionsDone: string[];

    /**
     * The number of cards which have been revealed from the set the player is
     * able to manipulate.
     */
    revealedCards: number;

    /** The player-guessed order of the items in the current question. */
    currentGuessedOrder: number[];

    /** The number of answers which have been revealed. */
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
    /** This question's category name. */
    name: string;

    /** (Director only) Description of this category. */
    description: string;

    /** The items, in *reveal* order, for this question. */
    items: RankyPankyQuestionItem[];

    /** The "top" scale label (e.g. "Hot"/"Most"/"Best"). */
    topLabel: string;

    /** The "bottom" scale label (e.g. "Not"/"Least"/"Worst"). */
    bottomLabel: string;

    /** Suffix to apply to each item's value (e.g. " cm"/" mi"/" bn"). */
    itemSuffix: string | null;
}

export interface RankyPankyQuestionItem {
    /** The order index for this item. */
    index: number;

    /** The name as displayed on the top-row card, under the image. */
    name: string;

    /** The answer displayed on the bottom-row card after reveal, under the image. */
    value: number;

    /** The relative path to this item's image in storage. */
    uploadedFilePath: string;
}
