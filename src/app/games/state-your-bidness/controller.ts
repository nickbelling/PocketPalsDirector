import { Component, inject, signal } from '@angular/core';
import { StateYourBidnessService } from './database';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'state-your-bidness-controller',
    templateUrl: './controller.html',
    imports: [CommonModule, FormsModule],
    providers: [StateYourBidnessService],
})
export class StateYourBidnessController {
    private _db = inject(StateYourBidnessService);
    protected gameState = this._db.state;
    protected gameQuestions = this._db.questions;

    protected newQuestionName = signal<string>('');
    protected newQuestionAnswers = signal<string>('');

    public async change(): Promise<void> {
        const state = this.gameState();
        state.guessedAnswers.push('abc');
        state.committedTo = state.committedTo + 1;
        await this._db.setState(state);
    }

    public async reset(): Promise<void> {
        await this._db.resetState();
    }

    public async add(): Promise<void> {
        const newQuestionName = this.newQuestionName();
        const newQuestionAnswers = this.newQuestionAnswers();

        const answers = newQuestionAnswers.trim().split('\n');

        await this._db.addQuestion({
            name: newQuestionName,
            items: answers,
        });
    }
}
