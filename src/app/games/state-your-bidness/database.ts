import { computed, Injectable } from '@angular/core';
import { BaseGameDatabaseService } from '../base-database.service';

export interface StateYourBidnessState {
    currentQuestion: string | null;
    committedTo: number;
    guessedAnswers: string[];
    showRemainingAnswers: boolean;
    questionsDone: string[];
}

const STATE_YOUR_BUSINESS_STATE_DEFAULT: StateYourBidnessState = {
    currentQuestion: null,
    committedTo: 0,
    guessedAnswers: [],
    showRemainingAnswers: false,
    questionsDone: [],
};

export interface StateYourBidnessQuestion {
    name: string;
    description: string;
    items: string[];
}

@Injectable({
    providedIn: 'root',
})
export class StateYourBidnessService extends BaseGameDatabaseService<
    StateYourBidnessState,
    StateYourBidnessQuestion
> {
    constructor() {
        super('games/state-your-bidness', STATE_YOUR_BUSINESS_STATE_DEFAULT);
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
