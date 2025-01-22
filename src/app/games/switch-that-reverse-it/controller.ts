import { Component, inject } from '@angular/core';
import { Entity } from '../../common/firestore';
import { BaseController, CommonControllerModule } from '../base/controller';
import { SwitchThatReverseItDatabase } from './database';
import {
    SWITCH_THAT_REVERSE_IT_STATE_DEFAULT,
    SwitchThatReverseItQuestion,
    SwitchThatReverseItState,
} from './model';
import { SwitchThatReverseItQuestionEditDialog } from './question-edit';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './controller.html',
})
export class SwitchThatReverseItController extends BaseController<
    SwitchThatReverseItState,
    SwitchThatReverseItQuestion
> {
    protected data: SwitchThatReverseItDatabase;

    constructor() {
        const database = inject(SwitchThatReverseItDatabase);
        super(database);
        this.data = database;
    }

    public async setQuestion(
        question?: Entity<SwitchThatReverseItQuestion>,
    ): Promise<void> {
        await this.setState({
            ...SWITCH_THAT_REVERSE_IT_STATE_DEFAULT,
            currentQuestion: question?.id || null,
        });
    }

    public addQuestion(): void {
        this._dialog.open(SwitchThatReverseItQuestionEditDialog);
    }

    public confirmDeleteQuestion(
        question: Entity<SwitchThatReverseItQuestion>,
    ): void {
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

    public async revealAnswer(): Promise<void> {
        await this.setState({
            showingAnswer: true,
        });
    }
}
