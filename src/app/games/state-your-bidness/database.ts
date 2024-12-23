import { Injectable } from '@angular/core';
import { BaseGameDatabase } from '../base';

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
export class StateYourBidnessDatabase extends BaseGameDatabase<
    StateYourBidnessState,
    StateYourBidnessQuestion
> {
    constructor() {
        super('games/state-your-bidness', STATE_YOUR_BUSINESS_STATE_DEFAULT);
    }
}
