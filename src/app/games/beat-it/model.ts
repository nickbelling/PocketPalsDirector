export const BEAT_IT_BASE_PATH = 'games/beat-it';

export interface BeatItState {
    currentQuestion: string | null;
    questionsDone: string[];
    currentGuess: number;
    opposingTeamGuess: boolean | null;
    showingAnswer: boolean;
}

export const BEAT_IT_STATE_DEFAULT: BeatItState = {
    currentQuestion: null,
    questionsDone: [],
    currentGuess: 0,
    opposingTeamGuess: null,
    showingAnswer: false,
};

export interface BeatItQuestion {
    gameId: string;
    hours: number;
}
