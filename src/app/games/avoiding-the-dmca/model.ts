export interface AvoidingTheDmcaState {
    currentQuestion: string | null;
    playingBackwards: boolean;
    showingGame: boolean;
    showingTrack: boolean;
    playingForwards: boolean;
}

export const AVOIDING_THE_DMCA_STATE_DEFAULT: AvoidingTheDmcaState = {
    currentQuestion: null,
    playingBackwards: false,
    showingGame: false,
    showingTrack: false,
    playingForwards: false,
};

export interface AvoidingTheDmcaQuestion {
    gameId: string;
    trackName: string;
    soundForwards: string;
    soundBackwards: string;
}
