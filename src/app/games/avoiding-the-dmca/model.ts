export interface AvoidingTheDmcaState {
    currentQuestion: string | null;
    playing: boolean;
}

export const AVOIDING_THE_DMCA_STATE_DEFAULT: AvoidingTheDmcaState = {
    currentQuestion: null,
    playing: false,
};

export interface AvoidingTheDmcaQuestion {
    gameId: string;
    soundForwards: string;
    soundBackwards: string;
}
