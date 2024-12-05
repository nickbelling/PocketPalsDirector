import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule, JsonPipe } from '@angular/common';
import { StateYourBidnessService } from './games/state-your-bidness/database.service';

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    providers: [StateYourBidnessService],
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
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
