import { computed, Injectable } from '@angular/core';
import { BaseGameDatabase } from '../database';

export interface RankyPankyState {
    currentQuestion: string | null;
    questionsDone: string[];
    revealedCards: number;
    currentGuessedOrder: number[];
    revealedAnswers: number;
}

const RANKY_PANKY_STATE_DEFAULT: RankyPankyState = {
    currentQuestion: null,
    questionsDone: [],
    revealedCards: 0,
    currentGuessedOrder: [],
    revealedAnswers: 0,
};

export interface RankyPankyQuestion {
    name: string;
    description: string;
    items: RankyPankyQuestionItem[];
}

export interface RankyPankyQuestionItem {
    index: number;
    name: string;
    value: number;
    uploadedFilePath: string;
}

@Injectable({
    providedIn: 'root',
})
export class RankyPankyDatabase extends BaseGameDatabase<
    RankyPankyState,
    RankyPankyQuestion
> {
    constructor() {
        super('games/ranky-panky', RANKY_PANKY_STATE_DEFAULT);
    }

    protected currentQuestion = computed(() => {
        const state = this.state();
        const questions = this.questions();

        if (state.currentQuestion) {
            return questions.find(
                (q) => q.firebaseId === state.currentQuestion,
            );
        } else {
            return undefined;
        }
    });
}
