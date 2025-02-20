export const VIDEOGAME_CENTIPEDE_BASE_PATH = 'games/videogame-centipede';

export interface VideogameCentipedeState {
    /** The current question ID. Null if no question showing. */
    currentQuestion: string | null;

    /** True if the answer is also showing. */
    showingAnswer: boolean;
}

export const VIDEOGAME_CENTIPEDE_STATE_DEFAULT: VideogameCentipedeState = {
    currentQuestion: null,
    showingAnswer: false,
};

export interface VideogameCentipedeQuestion {
    /**
     * (Director only) The prompt - a description of two mashed up video game
     * titles.
     */
    prompt: string;

    /** The correct answer. */
    answer: string;
}
