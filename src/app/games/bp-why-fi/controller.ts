import { Component, inject } from '@angular/core';
import { Entity } from '../../common/firestore';
import { BaseController, CommonControllerModule } from '../base/controller';
import { BpWhyFiDatabase } from './database';
import {
    BP_WHY_FI_STATE_DEFAULT,
    BpWhyFiQuestion,
    BpWhyFiState,
} from './model';
import { BpWhyFiQuestionEditDialog } from './question-edit';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './controller.html',
})
export class BpWhyFiController extends BaseController<
    BpWhyFiState,
    BpWhyFiQuestion
> {
    protected data: BpWhyFiDatabase;

    constructor() {
        const database = inject(BpWhyFiDatabase);
        super(database);
        this.data = database;
    }

    public async setQuestion(
        question?: Entity<BpWhyFiQuestion>,
    ): Promise<void> {
        await this.setState({
            ...BP_WHY_FI_STATE_DEFAULT,
            currentQuestion: question?.id || null,
        });
    }

    public async showPrompt(): Promise<void> {
        await this.setState({
            showingPrompt: true,
        });
    }

    public async showHints(): Promise<void> {
        await this.setState({
            showingHints: true,
        });
    }

    public async showAnswer(): Promise<void> {
        await this.setState({
            showingAnswer: true,
        });
    }

    public addQuestion(): void {
        this.editQuestion();
    }

    public editQuestion(question?: BpWhyFiQuestion): void {
        this._dialog.open(BpWhyFiQuestionEditDialog, {
            data: question,
        });
    }
}
