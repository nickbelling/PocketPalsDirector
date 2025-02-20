export const SCREENSHOT_IN_THE_DARK_BASE_PATH = 'games/screenshot-in-the-dark';

export interface ScreenshotInTheDarkState {
    /** The current question ID. Null if no question selected. */
    currentQuestion: string | null;

    /**
     * True if this question is currently playing the audio track that moves
     * through the screenshots.
     */
    isPlaying: boolean;

    /** True if the answer is showing. */
    isShowingAnswer: boolean;
}

export const SCREENSHOT_IN_THE_DARK_STATE_DEFAULT: ScreenshotInTheDarkState = {
    currentQuestion: null,
    isPlaying: false,
    isShowingAnswer: false,
};

export interface ScreenshotInTheDarkQuestion {
    /** The VGDB game ID for the game these screenshots are from. */
    gameId: string;

    /**
     * The ID of the game as it appears in guessthe.game - used to fetch and
     * store the screenshots.
     */
    guessTheGameId: number;

    /** True if the final screenshot is actually a video instead of an image. */
    finalIsVideo: boolean;
}
