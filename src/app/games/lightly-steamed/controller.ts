import { Component, inject } from '@angular/core';
import { Entity } from '../../common/firestore';
import { BaseController, CommonControllerModule } from '../base/controller';
import { LightlySteamedDatabase } from './database';
import docs from './index.md';
import {
    LIGHTLY_STEAMED_STATE_DEFAULT,
    LightlySteamedQuestion,
    LightlySteamedState,
} from './model';
import { LightlySteamedQuestionEditDialog } from './question-edit';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './controller.html',
})
export class LightlySteamedController extends BaseController<
    LightlySteamedState,
    LightlySteamedQuestion
> {
    protected data: LightlySteamedDatabase;
    protected docs = docs;

    constructor() {
        const database = inject(LightlySteamedDatabase);
        super(database);
        this.data = database;
    }

    public async setQuestion(
        question?: Entity<LightlySteamedQuestion>,
    ): Promise<void> {
        await this.setState({
            ...LIGHTLY_STEAMED_STATE_DEFAULT,
            currentQuestion: question?.id || null,
        });
    }

    public addQuestion(): void {
        this._dialog.open(LightlySteamedQuestionEditDialog);
    }

    public editQuestion(question: Entity<LightlySteamedQuestion>): void {
        this._dialog.open(LightlySteamedQuestionEditDialog, {
            autoFocus: false,
            data: question,
        });
    }

    public async setReview(index: number): Promise<void> {
        await this.setState({
            currentReview: index,
            currentSentence: 0,
            showingAnswer: false,
        });
    }

    public async revealNextSentence(): Promise<void> {
        const state = this.state();
        await this.setState({
            currentSentence: state.currentSentence + 1,
        });
    }

    public async showAnswer(): Promise<void> {
        await this.setState({
            showingAnswer: true,
        });
    }
}
