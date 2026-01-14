import { Injectable } from '@angular/core';
import { Entity } from '../../common/firestore';
import { BaseGameDatabase } from '../base/database';
import {
    EMOJIONAL_DAMAGE_BASE_PATH,
    EMOJIONAL_DAMAGE_STATE_DEFAULT,
    EmojionalDamageQuestion,
    EmojionalDamageState,
} from './model';

@Injectable({
    providedIn: 'root',
})
export class EmojionalDamageDatabase extends BaseGameDatabase<
    EmojionalDamageState,
    EmojionalDamageQuestion
> {
    constructor() {
        super(EMOJIONAL_DAMAGE_BASE_PATH, EMOJIONAL_DAMAGE_STATE_DEFAULT);
    }

    public override getQuestionString(
        question: Entity<EmojionalDamageQuestion>,
    ): string {
        return `${question.answer}: ${question.prompt}`;
    }
}
