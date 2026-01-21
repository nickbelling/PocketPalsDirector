import { Injectable } from '@angular/core';
import { BaseGameDatabase } from '../base/database';
import {
    DA_VIDEO_GAME_CODE_BASE_PATH,
    DA_VIDEO_GAME_CODE_STATE_DEFAULT,
    DaVideoGameCodeQuestion,
    DaVideoGameCodeState,
} from './model';

@Injectable({
    providedIn: 'root',
})
export class DaVideoGameCodeDatabase extends BaseGameDatabase<
    DaVideoGameCodeState,
    DaVideoGameCodeQuestion
> {
    constructor() {
        super(DA_VIDEO_GAME_CODE_BASE_PATH, DA_VIDEO_GAME_CODE_STATE_DEFAULT);
    }

    public override getQuestionString(
        question: DaVideoGameCodeQuestion,
    ): string {
        return question.title;
    }
}
