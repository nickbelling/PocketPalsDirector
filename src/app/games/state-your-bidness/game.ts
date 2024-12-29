import { Component, computed, inject } from '@angular/core';
import { CommonGameModule } from '..';
import { fadeInOutAnimation } from '../../common/animations';
import { BaseGame } from '../base/base-game';
import { StateYourBidnessDatabase } from './database';
import { StateYourBidnessQuestion, StateYourBidnessState } from './model';

@Component({
    imports: [CommonGameModule],
    templateUrl: './game.html',
    styleUrl: './game.scss',
    host: { class: 'pocket-pals-game size-1920x1080' },
    animations: [fadeInOutAnimation(1000)],
})
export class StateYourBidnessGame extends BaseGame<
    StateYourBidnessState,
    StateYourBidnessQuestion
> {
    constructor() {
        super(inject(StateYourBidnessDatabase));
    }

    protected committedTo = computed(() => this.gameState().committedTo);
    protected answers = computed(() => this.currentQuestion()?.items || []);
    protected possibleAnswersCount = computed(() => this.answers().length);
    protected guessedAnswers = computed(() => this.gameState().guessedAnswers);
    protected guessedAnswerCount = computed(() => this.guessedAnswers().length);
    protected unguessedAnswerCount = computed(
        () =>
            this.possibleAnswersCount() -
            Math.max(this.committedTo(), this.guessedAnswers().length),
    );
}
