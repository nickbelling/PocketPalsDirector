import { Component, inject } from '@angular/core';
import { Entity } from '../../common/firestore';
import { BaseController, CommonControllerModule } from '../base/controller';
import { EmojionalDamageDatabase } from './database';
import {
    EMOJIONAL_DAMAGE_STATE_DEFAULT,
    EmojionalDamageQuestion,
    EmojionalDamageState,
} from './model';
import { EmojionalDamageQuestionEditDialog } from './question-edit';
import docs from './README.md';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './controller.html',
})
export class EmojionalDamageController extends BaseController<
    EmojionalDamageState,
    EmojionalDamageQuestion
> {
    protected data: EmojionalDamageDatabase;
    protected docs = docs;

    constructor() {
        const database = inject(EmojionalDamageDatabase);
        super(database);
        this.data = database;
    }

    public async setQuestion(
        question?: Entity<EmojionalDamageQuestion>,
    ): Promise<void> {
        await this.setState({
            ...EMOJIONAL_DAMAGE_STATE_DEFAULT,
            currentQuestion: question?.id || null,
        });
    }

    public addQuestion(): void {
        this._dialog.open(EmojionalDamageQuestionEditDialog);
    }

    public confirmDeleteQuestion(
        question: Entity<EmojionalDamageQuestion>,
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
