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

    public async setQuestion(
        question?: Entity<ImpockstersQuestion>,
    ): Promise<void> {
        await this.setState({
            ...IMPOCKSTERS_STATE_DEFAULT,
            currentQuestion: question?.id || null,
        });
    }

    public addQuestion(): void {
        this._dialog.open(ImpockstersQuestionEditDialog);
    }

    public async toggleTimer(): Promise<void> {
        const state = this.state();
        await this.setState({
            timerRunning: !state.timerRunning,
        });
    }
}
