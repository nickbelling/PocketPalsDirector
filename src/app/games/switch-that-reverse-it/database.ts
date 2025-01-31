import { Injectable } from '@angular/core';
import { Entity } from '../../common/firestore';
import { BaseGameDatabase } from '../base/database';
import {
    SWITCH_THAT_REVERSE_IT_BASE_PATH,
    SWITCH_THAT_REVERSE_IT_STATE_DEFAULT,
    SwitchThatReverseItQuestion,
    SwitchThatReverseItState,
} from './model';

@Injectable({
    providedIn: 'root',
})
export class SwitchThatReverseItDatabase extends BaseGameDatabase<
    SwitchThatReverseItState,
    SwitchThatReverseItQuestion
> {
    constructor() {
        super(
            SWITCH_THAT_REVERSE_IT_BASE_PATH,
            SWITCH_THAT_REVERSE_IT_STATE_DEFAULT,
        );
    }

    public override getQuestionString(
        question: Entity<SwitchThatReverseItQuestion>,
    ): string {
        return `${question.prompt} (${question.answer})`;
    }
}
