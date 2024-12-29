export interface <%= classify(name) %>State {
    currentQuestion: string | null;
}

export const <%= underscore(name) %>_STATE_DEFAULT: <%= classify(name) %>State = {
    currentQuestion: null
};

export interface <%= classify(name) %>Question {}
