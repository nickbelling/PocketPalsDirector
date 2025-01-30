import { inject, Injectable } from '@angular/core';
import { Entity } from '../../common/firestore';
import { VideogameDatabaseService } from '../../common/video-games';
import { BaseGameDatabase } from '../base/database';
import {
    BEAT_IT_BASE_PATH,
    BEAT_IT_STATE_DEFAULT,
    BeatItQuestion,
    BeatItState,
} from './model';

@Injectable({
    providedIn: 'root',
})
export class BeatItDatabase extends BaseGameDatabase<
    BeatItState,
    BeatItQuestion
> {
    private _vgdb = inject(VideogameDatabaseService);

    constructor() {
        super(BEAT_IT_BASE_PATH, BEAT_IT_STATE_DEFAULT);
    }

    protected override getQuestionString(
        question: Entity<BeatItQuestion>,
    ): string {
        return `${this._vgdb.getGameName(question.gameId)} (${question.hours})`;
    }
}
