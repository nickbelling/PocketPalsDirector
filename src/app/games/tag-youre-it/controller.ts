import { Component, inject } from '@angular/core';
import { Entity } from '../../common/firestore';
import { BaseController, CommonControllerModule } from '../base/controller';
import { TagYoureItDatabase } from './database';
import {
    TAG_YOURE_IT_STATE_DEFAULT,
    TagYoureItQuestion,
    TagYoureItState,
} from './model';
import { TagYoureItQuestionEditDialog } from './question-edit';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './controller.html',
})
export class TagYoureItController extends BaseController<
    TagYoureItState,
    TagYoureItQuestion
> {
    protected data: TagYoureItDatabase;

    constructor() {
        const database = inject(TagYoureItDatabase);
        super(database);
        this.data = database;
    }

    public async setQuestion(
        question?: Entity<TagYoureItQuestion>,
    ): Promise<void> {
        await this.setState({
            ...TAG_YOURE_IT_STATE_DEFAULT,
            currentQuestion: question?.id || null,
        });
    }

    public addQuestion(): void {
        this.editQuestion();
    }

    public editQuestion(question?: TagYoureItQuestion): void {
        this._dialog.open(TagYoureItQuestionEditDialog, {
            data: question,
        });
    }
}
