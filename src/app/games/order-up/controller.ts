import { Component, inject } from '@angular/core';
import { Entity } from '../../common/firestore';
import { BaseController, CommonControllerModule } from '../base/controller';
import { OrderUpDatabase } from './database';
import { ORDER_UP_STATE_DEFAULT, OrderUpQuestion, OrderUpState } from './model';
import { OrderUpQuestionEditDialog } from './question-edit';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './controller.html',
})
export class OrderUpController extends BaseController<
    OrderUpState,
    OrderUpQuestion
> {
    protected data: OrderUpDatabase;

    constructor() {
        const database = inject(OrderUpDatabase);
        super(database);
        this.data = database;
    }

    public async setQuestion(questionId: string): Promise<void> {
        await this.setState({
            ...ORDER_UP_STATE_DEFAULT,
            currentQuestion: questionId,
        });
    }

    public addQuestion(): void {
        this._dialog.open(OrderUpQuestionEditDialog, {
            width: '800px',
            maxWidth: '800px',
            height: '700px',
            maxHeight: '700px',
        });
    }

    public editQuestion(question: Entity<OrderUpQuestion>): void {
        this._dialog.open(OrderUpQuestionEditDialog, {
            data: question,
            width: '800px',
            maxWidth: '800px',
            height: '700px',
            maxHeight: '700px',
        });
    }

    public confirmDeleteQuestion(question: Entity<OrderUpQuestion>): void {
        this._confirm.open(
            'deleteCancel',
            'Delete question',
            `Are you sure you want to delete '${question.id}'?`,
            {
                onDelete: async () => {
                    await this.deleteQuestion(question);
                },
            },
        );
    }
}
