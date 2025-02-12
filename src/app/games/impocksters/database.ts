import { Injectable } from '@angular/core';
import { Entity } from '../../common/firestore';
import { BaseGameDatabase } from '../base/database';
import {
    IMPOCKSTERS_BASE_PATH,
    IMPOCKSTERS_STATE_DEFAULT,
    ImpockstersQuestion,
    ImpockstersState,
} from './model';

@Injectable({
    providedIn: 'root',
})
export class ImpockstersDatabase extends BaseGameDatabase<
    ImpockstersState,
    ImpockstersQuestion
> {
    constructor() {
        super(IMPOCKSTERS_BASE_PATH, IMPOCKSTERS_STATE_DEFAULT);
    }

    public override getQuestionString(
        question: Entity<ImpockstersQuestion>,
    ): string {
        return `${question.name} (${question.from})`;
    }

    protected override async afterDeleteQuestion(
        question: Entity<ImpockstersQuestion>,
    ): Promise<void> {
        await this.deleteFile(question.imageId);
    }
}
