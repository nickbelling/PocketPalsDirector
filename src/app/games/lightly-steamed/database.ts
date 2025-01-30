import { inject, Injectable } from '@angular/core';
import { Entity } from '../../common/firestore';
import { VideogameDatabaseService } from '../../common/video-games';
import { BaseGameDatabase } from '../base/database';
import {
    LIGHTLY_STEAMED_BASE_PATH,
    LIGHTLY_STEAMED_STATE_DEFAULT,
    LightlySteamedQuestion,
    LightlySteamedState,
} from './model';

@Injectable({
    providedIn: 'root',
})
export class LightlySteamedDatabase extends BaseGameDatabase<
    LightlySteamedState,
    LightlySteamedQuestion
> {
    private _vgdb = inject(VideogameDatabaseService);

    constructor() {
        super(LIGHTLY_STEAMED_BASE_PATH, LIGHTLY_STEAMED_STATE_DEFAULT);
    }

    protected override getQuestionString(
        question: Entity<LightlySteamedQuestion>,
    ): string {
        return this._vgdb.getGameName(question.gameId);
    }
}
