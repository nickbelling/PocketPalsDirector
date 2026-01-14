export const FAKE_NEWS_BASE_PATH = 'games/fake-news';

export interface FakeNewsFactCheckersState {
    /** The current question ID. Null if no question selected. */
    currentQuestion: string | null;

    /** The amount of sentences from the prompt currently being shown. */
    currentSentence: number;
}

export const FAKE_NEWS_STATE_DEFAULT: FakeNewsFactCheckersState = {
    currentQuestion: null,
    currentSentence: 0,
};

export interface FakeNewsFactCheckersQuestion {
    /** The subject of the prompt (e.g. "Bioshock (2007)"). */
    subject: string;

    /** The text of the prompt itself. */
    prompt: string;

    /** The correction to be made to the prompt. */
    correction: string;
}
