import { Component, computed, inject } from '@angular/core';
import { CommonGameModule } from '../common-game.module';
import { RankyPankyDatabase } from './database';

@Component({
    imports: [CommonGameModule],
    templateUrl: './game.html',
    host: { class: 'pocket-pals-game size-1920x1080' },
})
export class RankyPankyGame {
    protected _db = inject(RankyPankyDatabase);

    protected gameState = this._db.state;
    protected gameQuestions = this._db.questions;

    protected selectedQuestionId = computed(
        () => this.gameState().currentQuestion,
    );

    protected selectedQuestion = computed(() => {
        const id = this.selectedQuestionId();
        const questions = this.gameQuestions();
        return questions.find((q) => q.firebaseId === id);
    });
}
