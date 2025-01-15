export const SWITCH_THAT_REVERSE_IT_BASE_PATH = 'games/switch-that-reverse-it';

export interface SwitchThatReverseItState {
    currentQuestion: string | null;
    showingAnswer: boolean;
}

export const SWITCH_THAT_REVERSE_IT_STATE_DEFAULT: SwitchThatReverseItState = {
    currentQuestion: null,
    showingAnswer: false,
};

export interface SwitchThatReverseItQuestion {
    prompt: string;
    answer: string;
}
