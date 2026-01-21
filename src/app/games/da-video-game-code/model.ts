export const DA_VIDEO_GAME_CODE_BASE_PATH = 'games/da-video-game-code';

export interface DaVideoGameCodeState {
    currentQuestion: string | null;
    showingClues: number;
    showingCategory: boolean;
}

export const DA_VIDEO_GAME_CODE_STATE_DEFAULT: DaVideoGameCodeState = {
    currentQuestion: null,
    showingClues: 0,
    showingCategory: false,
};

export interface DaVideoGameCodeQuestion {
    title: string;
    notes: string;
    clues: DaVideoGameCodeQuestionClue[];
}

export interface DaVideoGameCodeQuestionClue {
    title: string;
    imageId: string;
}
