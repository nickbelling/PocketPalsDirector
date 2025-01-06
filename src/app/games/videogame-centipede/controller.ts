import { Component, inject } from '@angular/core';
import { Entity } from '../../common/firestore';
import { BaseController, CommonControllerModule } from '../base/controller';
import { VideogameCentipedeDatabase } from './database';
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

    constructor() {
        const database = inject(VideogameCentipedeDatabase);
        super(database);
        this.data = database;
    }

    public addQuestion(): void {
        this._dialog.open(VideogameCentipedeQuestionEditDialog);
    }

    public async confirmDeleteQuestion(
        question: Entity<VideogameCentipedeQuestion>,
    ): Promise<void> {
        await this._confirm.open(
            'deleteCancel',
            'Delete question',
            `Are you sure you want to delete "${question.answer}"?`,
            {
                onDelete: async () => {
                    await this.deleteQuestion(question);
                },
            },
        );
    }

    public async setQuestion(questionId: string): Promise<void> {
        await this.setState({
            currentQuestion: questionId,
            showingAnswer: false,
        });
    }

    public async showAnswer(): Promise<void> {
        await this.setState({
            showingAnswer: true,
        });
    }
}
