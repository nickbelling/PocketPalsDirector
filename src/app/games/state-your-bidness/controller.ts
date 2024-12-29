import { Component, computed, inject, linkedSignal } from '@angular/core';
import { Entity } from '../../common';
import { CommonControllerModule } from '../../common/common.module';
import { BaseController } from '../base/base-controller';
import { StateYourBidnessDatabase } from './database';
import { StateYourBidnessQuestion, StateYourBidnessState } from './model';
import { StateYourBidnessQuestionEditDialog } from './question-edit';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './controller.html',
})
export class StateYourBidnessController extends BaseController<
    StateYourBidnessState,
    StateYourBidnessQuestion
> {
    constructor() {
        super(inject(StateYourBidnessDatabase));
    }

    protected committedTo = linkedSignal<number>(
        () => this.gameState().committedTo,
    );

    protected showingRemainingAnswers = linkedSignal<boolean>(
        () => this.gameState().showRemainingAnswers,
    );

    protected possibleItems = computed(() => {
        const selectedQuestion = this.currentQuestion();
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

    public async confirmDeleteQuestion(
        question: Entity<StateYourBidnessQuestion>,
    ): Promise<void> {
        await this._confirm.open(
            'deleteCancel',
            'Delete question',
            `Are you sure you want to delete "${question.name}"?`,
            {
                onDelete: async () => {
                    await this.deleteQuestion(question);
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
                await this.setState({
                    questionsDone: [...state.questionsDone, questionId],
                });
            }

            await this.setState({
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
            await this.setState({
                committedTo: committedTo,
            });
        }
    }

    public async setGuess(answer: string): Promise<void> {
        const state = this.gameState();
        if (!state.guessedAnswers.includes(answer)) {
            await this.setState({
                guessedAnswers: [...state.guessedAnswers, answer],
            });
        }
    }

    public async toggleShowRemainingAnswers(): Promise<void> {
        const state = this.gameState();
        await this.setState({
            showRemainingAnswers: !state.showRemainingAnswers,
        });
    }
}
