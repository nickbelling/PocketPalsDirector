export const BP_WHY_FI_BASE_PATH = 'games/bp-why-fi';

export interface BpWhyFiState {
    /** The currently displayed question. */
    currentQuestion: string | null;

    /** True if the prompt is visible for the current question. */
    showingPrompt: boolean;

    /** True if hints are visible for the current question. */
    showingHints: boolean;

    /** True if the answer is showing for the current question. */
    showingAnswer: boolean;
}

export const BP_WHY_FI_STATE_DEFAULT: BpWhyFiState = {
    currentQuestion: null,
    showingPrompt: false,
    showingHints: false,
    showingAnswer: false,
};

export interface BpWhyFiQuestion {
    /** The VGDB game ID. */
    gameId: string;

    /** The prompt for this question - a description of the game, explained badly. */
    prompt: string;

    /** Hint: the year of the game's release. */
    hintYear: string;

    /** Hint: the genre of the game. */
    hintGenre: string;
}
