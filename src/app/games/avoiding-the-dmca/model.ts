export interface AvoidingTheDmcaState {
    /** The current question ID. Null if no question selected. */
    currentQuestion: string | null;

    /** True if the backwards track is currently playing. */
    playingBackwards: boolean;

    /** True if the game is being shown. */
    showingGame: boolean;

    /** True if the track name is being shown. */
    showingTrack: boolean;

    /** True if the forwards track is currently playing. */
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
    /** The VGDB game ID for this question. */
    gameId: string;

    /** The name of the track. */
    trackName: string;

    /** Relative path to the forwards audio file. */
    soundForwards: string;

    /** Relative path to the backwards audio file. */
    soundBackwards: string;
}
