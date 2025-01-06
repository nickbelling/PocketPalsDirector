export const VIDEOGAME_CENTIPEDE_BASE_PATH = 'games/videogame-centipede';

export interface VideogameCentipedeState {
    currentQuestion: string | null;
    showingAnswer: boolean;
}

export const VIDEOGAME_CENTIPEDE_STATE_DEFAULT: VideogameCentipedeState = {
    currentQuestion: null,
    showingAnswer: false,
};

export interface VideogameCentipedeQuestion {
    prompt: string;
    answer: string;
}
