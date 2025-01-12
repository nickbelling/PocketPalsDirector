import { Component, computed, inject, linkedSignal } from '@angular/core';
import { Entity } from '../../common/firestore';
import { BaseController, CommonControllerModule } from '../base/controller';
import { BeatItDatabase } from './database';
import { BeatItQuestion, BeatItState } from './model';
import { BeatItQuestionEditDialog } from './question-edit';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './controller.html',
})
export class BeatItController extends BaseController<
    BeatItState,
    BeatItQuestion
> {
    protected data: BeatItDatabase;
    protected guess = linkedSignal<number>(() => this.state().currentGuess);

    protected score = computed(() => {
        const state = this.state();
        const question = this.currentQuestion();

        if (state && question) {
            const guess = state.currentGuess;
            const answer = question.hours;
            const percentage = Math.abs(guess - answer) / answer;

            if (percentage <= 0.05) return 5;
            else if (percentage <= 0.1) return 4;
            else if (percentage <= 0.2) return 3;
            else if (percentage <= 0.3) return 2;
            else if (percentage <= 0.4) return 1;
            else return 0;
        } else {
            return 0;
        }
    });

    constructor() {
        const database = inject(BeatItDatabase);
        super(database);
        this.data = database;
    }

    public async setQuestion(questionId: string): Promise<void> {
        const state = this.state();
        if (questionId !== null && !state.questionsDone.includes(questionId)) {
            await this.setState({
                questionsDone: [...state.questionsDone, questionId],
            });
        }

        await this.setState({
            currentQuestion: questionId,
            currentGuess: 0,
            opposingTeamGuess: null,
            showingAnswer: false,
        });
    }

    public addQuestion(): void {
        this._dialog.open(BeatItQuestionEditDialog);
    }

    public confirmDeleteQuestion(question: Entity<BeatItQuestion>): void {
        this._confirm.open(
            'deleteCancel',
            'Delete question',
            `Are you sure you want to delete '${question.gameId}'?`,
            {
                onDelete: async () => {
                    await this.deleteQuestion(question);
                },
            },
        );
    }

    public async setGuess(guess: number): Promise<void> {
        await this.setState({
            currentGuess: guess,
        });
    }

    public async setHigherLower(higher: boolean): Promise<void> {
        await this.setState({
            opposingTeamGuess: higher,
        });
    }

    public async showAnswer(): Promise<void> {
        await this.setState({
            showingAnswer: true,
        });
    }
}
