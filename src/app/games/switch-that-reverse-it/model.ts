export const SWITCH_THAT_REVERSE_IT_BASE_PATH = 'games/switch-that-reverse-it';

export interface SwitchThatReverseItState {
    /** The current question ID. Null if no question showing. */
    currentQuestion: string | null;

    /** True if the answer is also showing. */
    showingAnswer: boolean;
}

export const SWITCH_THAT_REVERSE_IT_STATE_DEFAULT: SwitchThatReverseItState = {
    currentQuestion: null,
    showingAnswer: false,
};

export interface SwitchThatReverseItQuestion {
    /** The question's prompt (the reversed game name). */
    prompt: string;

    /** The question's answer (the real game name). */
    answer: string;
}
