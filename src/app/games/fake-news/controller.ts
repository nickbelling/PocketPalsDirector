import { Component, inject } from '@angular/core';
import { Entity } from '../../common/firestore';
import { BaseController, CommonControllerModule } from '../base/controller';
import docs from './README.md';
import { FakeNewsFactCheckersDatabase } from './database';
import {
    FAKE_NEWS_STATE_DEFAULT,
    FakeNewsFactCheckersQuestion,
    FakeNewsFactCheckersState,
} from './model';
import { FakeNewsFactCheckersQuestionEditDialog } from './question-edit';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './controller.html',
})
export class FakeNewsFactCheckersController extends BaseController<
    FakeNewsFactCheckersState,
    FakeNewsFactCheckersQuestion
> {
    protected data: FakeNewsFactCheckersDatabase;
    protected docs = docs;

    constructor() {
        const database = inject(FakeNewsFactCheckersDatabase);
        super(database);
        this.data = database;
    }

    public async setQuestion(
        question?: Entity<FakeNewsFactCheckersQuestion>,
    ): Promise<void> {
        await this.setState({
            ...FAKE_NEWS_STATE_DEFAULT,
            currentQuestion: question?.id || null,
        });
    }

    public addQuestion(): void {
        this._dialog.open(FakeNewsFactCheckersQuestionEditDialog);
    }

    public editQuestion(question: Entity<FakeNewsFactCheckersQuestion>): void {
        this._dialog.open(FakeNewsFactCheckersQuestionEditDialog, {
            autoFocus: false,
            data: question,
        });
    }

    public async revealNextSentence(): Promise<void> {
        const state = this.state();
        await this.setState({
            currentSentence: state.currentSentence + 1,
        });
    }
}
