import { inject, Injectable } from '@angular/core';
import { Entity } from '../../common/firestore';
import { VideogameDatabaseService } from '../../common/video-games';
import { BaseGameDatabase } from '../base/database';
import {
    FAKE_NEWS_BASE_PATH,
    FAKE_NEWS_STATE_DEFAULT,
    FakeNewsFactCheckersQuestion,
    FakeNewsFactCheckersState,
} from './model';

@Injectable({
    providedIn: 'root',
})
export class FakeNewsFactCheckersDatabase extends BaseGameDatabase<
    FakeNewsFactCheckersState,
    FakeNewsFactCheckersQuestion
> {
    private _vgdb = inject(VideogameDatabaseService);

    constructor() {
        super(FAKE_NEWS_BASE_PATH, FAKE_NEWS_STATE_DEFAULT);
    }

    public override getQuestionString(
        question: Entity<FakeNewsFactCheckersQuestion>,
    ): string {
        return question.subject;
    }
}
