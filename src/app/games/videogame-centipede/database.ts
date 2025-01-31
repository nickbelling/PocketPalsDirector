import { Injectable } from '@angular/core';
import { Entity } from '../../common/firestore';
import { BaseGameDatabase } from '../base/database';
import {
    VIDEOGAME_CENTIPEDE_BASE_PATH,
    VIDEOGAME_CENTIPEDE_STATE_DEFAULT,
    VideogameCentipedeQuestion,
    VideogameCentipedeState,
} from './model';

@Injectable({
    providedIn: 'root',
})
export class VideogameCentipedeDatabase extends BaseGameDatabase<
    VideogameCentipedeState,
    VideogameCentipedeQuestion
> {
    constructor() {
        super(VIDEOGAME_CENTIPEDE_BASE_PATH, VIDEOGAME_CENTIPEDE_STATE_DEFAULT);
    }

    public override getQuestionString(
        question: Entity<VideogameCentipedeQuestion>,
    ): string {
        return question.answer;
    }
}
