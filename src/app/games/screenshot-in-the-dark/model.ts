export const SCREENSHOT_IN_THE_DARK_BASE_PATH = 'games/screenshot-in-the-dark';

export interface ScreenshotInTheDarkState {
    currentQuestion: string | null;
    isPlaying: boolean;
    isShowingAnswer: boolean;
}

export const SCREENSHOT_IN_THE_DARK_STATE_DEFAULT: ScreenshotInTheDarkState = {
    currentQuestion: null,
    isPlaying: false,
    isShowingAnswer: false,
};

export interface ScreenshotInTheDarkQuestion {
    gameId: string;
    guessTheGameId: number;
    finalIsVideo: boolean;
}
