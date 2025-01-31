import { Injectable } from '@angular/core';
import { Entity } from '../../common/firestore';
import { BaseGameDatabase } from '../base/database';
import {
    STATE_YOUR_BUSINESS_STATE_DEFAULT,
    StateYourBidnessQuestion,
    StateYourBidnessState,
} from './model';

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

    public override getQuestionString(
        question: Entity<StateYourBidnessQuestion>,
    ): string {
        return `${question.name} (${question.items.length})`;
    }
}
