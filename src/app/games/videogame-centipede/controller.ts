import { Component, inject } from '@angular/core';
import { Entity } from '../../common/firestore';
import { BaseController, CommonControllerModule } from '../base/controller';
import { VideogameCentipedeDatabase } from './database';
import docs from './index.md';
import { VideogameCentipedeQuestion, VideogameCentipedeState } from './model';
import { VideogameCentipedeQuestionEditDialog } from './question-edit';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './controller.html',
})
export class VideogameCentipedeController extends BaseController<
    VideogameCentipedeState,
    VideogameCentipedeQuestion
> {
    protected data: VideogameCentipedeDatabase;
    protected docs = docs;

    constructor() {
        const database = inject(VideogameCentipedeDatabase);
        super(database);
        this.data = database;
    }

    public addQuestion(): void {
        this._dialog.open(VideogameCentipedeQuestionEditDialog);
    }

    public async setQuestion(
        question?: Entity<VideogameCentipedeQuestion>,
    ): Promise<void> {
        await this.setState({
            currentQuestion: question?.id || null,
            showingAnswer: false,
        });
    }

    public async showAnswer(): Promise<void> {
        await this.setState({
            showingAnswer: true,
        });
    }
}
