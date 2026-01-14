export const EMOJIONAL_DAMAGE_BASE_PATH = 'games/emojional-damage';

export interface EmojionalDamageState {
    /** The current question ID. Null if no question showing. */
    currentQuestion: string | null;

    /** True if the answer is also showing. */
    showingAnswer: boolean;
}

export const EMOJIONAL_DAMAGE_STATE_DEFAULT: EmojionalDamageState = {
    currentQuestion: null,
    showingAnswer: false,
};

export interface EmojionalDamageQuestion {
    /** The question's prompt (the emojis which make up the prompt). */
    prompt: string;

    /** The question's answer (the real game name). */
    answer: string;

    /** Any additional explanation that may be required (e.g. literal sounding out) */
    explanation: string | null;
}
