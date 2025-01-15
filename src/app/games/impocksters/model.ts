export const IMPOCKSTERS_BASE_PATH = 'games/impocksters';

export interface ImpockstersState {
    currentQuestion: string | null;
    timerRunning: boolean;
}

export const IMPOCKSTERS_STATE_DEFAULT: ImpockstersState = {
    currentQuestion: null,
    timerRunning: false,
};

export type ImpocksterOriginType = 'game' | 'series';

export interface ImpockstersQuestion {
    name: string;
    from: string;
    fromType: ImpocksterOriginType;
    imageId: string;
    forbiddenTerms: string[];
}
