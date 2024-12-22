import { Component, computed, inject } from '@angular/core';
import { fadeInOutAnimation } from '../../common';
import { CommonGameModule } from '../common-game.module';
import { RankyPankyDatabase } from './database';

@Component({
    imports: [CommonGameModule],
    templateUrl: './game.html',
    styleUrl: './game.scss',
    host: { class: 'pocket-pals-game size-1920x1080' },
    animations: [fadeInOutAnimation(1000)],
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

    protected currentGuessedItems = computed(() => {
        const question = this.selectedQuestion();
        const state = this.gameState();

        if (question) {
            const itemsOriginalOrder = question.items;
            if (
                state.currentGuessedOrder.length === itemsOriginalOrder.length
            ) {
                return state.currentGuessedOrder.map(
                    (index) =>
                        itemsOriginalOrder.find(
                            (item) => item.index === index,
                        )!,
                );
            } else {
                return itemsOriginalOrder;
            }
        } else {
            return [];
        }
    });

    protected answers = computed(() => {
        const question = this.selectedQuestion();

        if (question) {
            const sorted = [...question.items].sort(
                (a, b) => b.value - a.value,
            );
            return sorted;
        } else {
            return [];
        }
    });
}
