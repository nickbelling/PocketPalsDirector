import { Component, computed, inject, linkedSignal } from '@angular/core';
import { Entity } from '../../common/firestore';
import { BaseController, CommonControllerModule } from '../base/controller';
import { StateYourBidnessDatabase } from './database';
import { StateYourBidnessQuestion, StateYourBidnessState } from './model';
import { StateYourBidnessQuestionEditDialog } from './question-edit';
import docs from './README.md';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './controller.html',
})
export class StateYourBidnessController extends BaseController<
    StateYourBidnessState,
    StateYourBidnessQuestion
> {
    protected docs = docs;

    constructor() {
        super(inject(StateYourBidnessDatabase));
    }

    protected committedTo = linkedSignal<number>(
        () => this.state().committedTo,
    );

    protected showingRemainingAnswers = linkedSignal<boolean>(
        () => this.state().showRemainingAnswers,
    );

    protected possibleItems = computed(() => {
        const selectedQuestion = this.currentQuestion();
        return selectedQuestion?.items.length || 0;
    });

    protected guessedAnswerCount = computed(
        () => this.state().guessedAnswers.length,
    );

    public addQuestion(): void {
        this.editQuestion();
    }

    public editQuestion(question?: Entity<StateYourBidnessQuestion>): void {
        this._dialog.open(StateYourBidnessQuestionEditDialog, {
            data: question,
        });
    }

    public async setQuestion(
        question?: Entity<StateYourBidnessQuestion>,
    ): Promise<void> {
        const state = this.state();
        if (question?.id && !state.questionsDone.includes(question.id)) {
            await this.setState({
                questionsDone: [...state.questionsDone, question.id],
            });
        }

        await this.setState({
            currentQuestion: question?.id || null,
            committedTo: 0,
            mainTimerRunning: false,
            secondaryTimerRunning: false,
            guessedAnswers: [],
            showRemainingAnswers: false,
        });
    }

    public async setCommittedTo(committedTo: number): Promise<void> {
        const state = this.state();
        if (state.committedTo !== committedTo) {
            await this.setState({
                committedTo: committedTo,
            });
        }
    }

    public async setGuess(answer: string): Promise<void> {
        const state = this.state();
        if (!state.guessedAnswers.includes(answer)) {
            await this.setState({
                guessedAnswers: [...state.guessedAnswers, answer],
            });
        }
    }

    public async toggleShowRemainingAnswers(): Promise<void> {
        const state = this.state();
        await this.setState({
            showRemainingAnswers: !state.showRemainingAnswers,
        });
    }

    public async toggleMainTimer(): Promise<void> {
        const state = this.state();
        await this.setState({
            mainTimerRunning: !state.mainTimerRunning,
        });
    }

    public async toggleSecondaryTimer(): Promise<void> {
        const state = this.state();
        await this.setState({
            secondaryTimerRunning: !state.secondaryTimerRunning,
        });
    }
}
