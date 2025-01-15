import { Component, inject } from '@angular/core';
import { Entity } from '../../common/firestore';
import { BaseController, CommonControllerModule } from '../base/controller';
import { ImpockstersDatabase } from './database';
import {
    IMPOCKSTERS_STATE_DEFAULT,
    ImpockstersQuestion,
    ImpockstersState,
} from './model';
import { ImpockstersQuestionEditDialog } from './question-edit';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './controller.html',
})
export class ImpockstersController extends BaseController<
    ImpockstersState,
    ImpockstersQuestion
> {
    protected data: ImpockstersDatabase;

    constructor() {
        const database = inject(ImpockstersDatabase);
        super(database);
        this.data = database;
    }

    public async setQuestion(questionId: string): Promise<void> {
        await this.setState({
            ...IMPOCKSTERS_STATE_DEFAULT,
            currentQuestion: questionId,
        });
    }

    public addQuestion(): void {
        this._dialog.open(ImpockstersQuestionEditDialog);
    }

    public confirmDeleteQuestion(question: Entity<ImpockstersQuestion>): void {
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

    public async toggleTimer(): Promise<void> {
        const state = this.state();
        await this.setState({
            timerRunning: !state.timerRunning,
        });
    }
}
