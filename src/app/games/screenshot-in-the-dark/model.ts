export const SCREENSHOT_IN_THE_DARK_BASE_PATH = 'games/screenshot-in-the-dark';

export interface ScreenshotInTheDarkState {
    currentQuestion: string | null;
}

export const SCREENSHOT_IN_THE_DARK_STATE_DEFAULT: ScreenshotInTheDarkState = {
    currentQuestion: null
};

export interface ScreenshotInTheDarkQuestion {}
