import { Injectable } from '@angular/core';
import { Entity } from '../../common/firestore';
import { BaseGameDatabase } from '../base/database';
import {
    RANKY_PANKY_STATE_DEFAULT,
    RankyPankyQuestion,
    RankyPankyState,
} from './model';

@Injectable({
    providedIn: 'root',
})
export class RankyPankyDatabase extends BaseGameDatabase<
    RankyPankyState,
    RankyPankyQuestion
> {
    constructor() {
        super('games/ranky-panky', RANKY_PANKY_STATE_DEFAULT);
    }

    public override getQuestionString(
        question: Entity<RankyPankyQuestion>,
    ): string {
        return question.name;
    }

    protected override async afterDeleteQuestion(
        question: Entity<RankyPankyQuestion>,
    ): Promise<void> {
        // Delete the images associated with this question
        for (const item of question.items) {
            await this.deleteFile(item.uploadedFilePath, false);
        }
    }
}
