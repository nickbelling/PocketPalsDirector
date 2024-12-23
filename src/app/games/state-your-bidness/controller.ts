import { Component, computed, inject, linkedSignal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SimpleDialogService, SimpleDialogType } from '../../common';
import { CommonControllerModule } from '../../common/common.module';
import { Entity } from '../database';
import { StateYourBidnessDatabase, StateYourBidnessQuestion } from './database';
import { StateYourBidnessQuestionEditDialog } from './question-edit';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './controller.html',
})
export class StateYourBidnessController {
    private _db = inject(StateYourBidnessDatabase);
    private _dialog = inject(MatDialog);
    private _confirm = inject(SimpleDialogService);

    protected gameState = this._db.state;
    protected gameQuestions = this._db.questions;

    protected selectedQuestionId = computed(
        () => this.gameState().currentQuestion,
    );

    protected committedTo = linkedSignal<number>(
        () => this.gameState().committedTo,
    );

    protected showingRemainingAnswers = linkedSignal<boolean>(
        () => this.gameState().showRemainingAnswers,
    );

    protected selectedQuestion = computed(() => {
        const id = this.selectedQuestionId();
        const questions = this.gameQuestions();
        return questions.find((q) => q.firebaseId === id);
    });

    protected possibleItems = computed(() => {
        const selectedQuestion = this.selectedQuestion();
        return selectedQuestion?.items.length || 0;
    });

    protected guessedAnswerCount = computed(
        () => this.gameState().guessedAnswers.length,
    );

    public addQuestion(): void {
        this.editQuestion();
    }

    public editQuestion(question?: Entity<StateYourBidnessQuestion>): void {
        this._dialog.open(StateYourBidnessQuestionEditDialog, {
            data: question,
        });
    }

    public async deleteQuestion(
        question: Entity<StateYourBidnessQuestion>,
    ): Promise<void> {
        await this._confirm.open(
            SimpleDialogType.DeleteCancel,
            'Delete question',
            `Are you sure you want to delete "${question.name}"?`,
            {
                onDelete: async () => {
                    await this._db.deleteQuestion(question);
                },
            },
        );
    }

    public async setQuestion(questionId: string | null): Promise<void> {
        const state = this.gameState();
        if (state.currentQuestion !== questionId) {
            if (
                questionId !== null &&
                !state.questionsDone.includes(questionId)
            ) {
                await this._db.setState({
                    questionsDone: [...state.questionsDone, questionId],
                });
            }

            await this._db.setState({
                currentQuestion: questionId,
                committedTo: 0,
                guessedAnswers: [],
                showRemainingAnswers: false,
            });
        }
    }

    public async setCommittedTo(committedTo: number): Promise<void> {
        const state = this.gameState();
        if (state.committedTo !== committedTo) {
            await this._db.setState({
                committedTo: committedTo,
            });
        }
    }

    public async setGuess(answer: string): Promise<void> {
        const state = this.gameState();
        if (!state.guessedAnswers.includes(answer)) {
            await this._db.setState({
                guessedAnswers: [...state.guessedAnswers, answer],
            });
        }
    }

    public async toggleShowRemainingAnswers(): Promise<void> {
        const state = this.gameState();
        await this._db.setState({
            showRemainingAnswers: !state.showRemainingAnswers,
        });
    }

    public async reset(): Promise<void> {
        await this._confirm.open(
            SimpleDialogType.YesNo,
            'Reset game',
            `Are you sure you want to reset this game? This will return the
            game to a fresh state, but won't delete any questions.`,
            {
                onYes: async () => {
                    await this._db.resetState();
                },
            },
        );
    }
}
