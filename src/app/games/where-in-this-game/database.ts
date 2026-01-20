import { inject, Injectable } from '@angular/core';
import { VideogameDatabaseService } from '../../common/video-games';
import { BaseGameDatabase } from '../base/database';
import {
    WHERE_IN_THIS_GAME_BASE_PATH,
    WHERE_IN_THIS_GAME_STATE_DEFAULT,
    WhereInThisGameQuestion,
    WhereInThisGameState,
} from './model';

@Injectable({
    providedIn: 'root',
})
export class WhereInThisGameDatabase extends BaseGameDatabase<
    WhereInThisGameState,
    WhereInThisGameQuestion
> {
    private readonly _vgdb = inject(VideogameDatabaseService);

    constructor() {
        super(WHERE_IN_THIS_GAME_BASE_PATH, WHERE_IN_THIS_GAME_STATE_DEFAULT);
    }

    public override getQuestionString(
        question: WhereInThisGameQuestion,
    ): string {
        return this._vgdb.getGameName(question.gameId);
    }
}
