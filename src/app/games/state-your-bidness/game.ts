import { Component, computed, inject } from '@angular/core';
import { StateYourBidnessService } from './database';
import { CommonGameModule } from '../common-game.module';

@Component({
    imports: [CommonGameModule],
    providers: [StateYourBidnessService],
    templateUrl: './game.html',
    styleUrl: './game.scss',
    host: { class: 'pocket-pals-game' },
})
export class StateYourBidnessGame {
    private _db = inject(StateYourBidnessService);

    protected gameState = this._db.state;
    protected gameQuestions = this._db.questions;

    protected currentQuestionId = computed(
        () => this.gameState().currentQuestion
    );

    protected currentQuestion = computed(() => {
        const questionId = this.currentQuestionId();
        const questions = this.gameQuestions();

        return questions.find((q) => q.firebaseId === questionId);
    });

    protected committedTo = computed(() => this.gameState().committedTo);
    protected answers = computed(() => this.currentQuestion()?.items || []);
    protected possibleAnswersCount = computed(() => this.answers().length);
    protected guessedAnswers = computed(() => this.gameState().guessedAnswers);
    protected guessedAnswerCount = computed(() => this.guessedAnswers().length);
    protected unguessedAnswerCount = computed(
        () =>
            this.possibleAnswersCount() -
            Math.max(this.committedTo(), this.guessedAnswers().length)
    );
}
