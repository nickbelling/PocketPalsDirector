import { Component, computed, inject } from '@angular/core';
import { fadeInOutAnimation } from '../../common/animations';
import { AudioService } from '../../common/audio';
import { CommonGameModule } from '../base/game';
import { BaseGame } from '../base/game/base-game';
import { StateYourBidnessDatabase } from './database';
import { StateYourBidnessQuestion, StateYourBidnessState } from './model';

@Component({
    imports: [CommonGameModule],
    templateUrl: './game.html',
    styleUrl: './game.scss',
    host: { class: 'pocket-pals-game' },
    animations: [fadeInOutAnimation(1000)],
})
export class StateYourBidnessGame extends BaseGame<
    StateYourBidnessState,
    StateYourBidnessQuestion
> {
    private _audio = inject(AudioService);

    constructor() {
        super(inject(StateYourBidnessDatabase));
    }

    protected committedTo = computed(() => this.state().committedTo);
    protected answers = computed(() => this.currentQuestion()?.items || []);
    protected possibleAnswersCount = computed(() => this.answers().length);
    protected guessedAnswers = computed(() => this.state().guessedAnswers);
    protected guessedAnswerCount = computed(() => this.guessedAnswers().length);
    protected unguessedAnswerCount = computed(
        () =>
            this.possibleAnswersCount() -
            Math.max(this.committedTo(), this.guessedAnswers().length),
    );
    protected muted = computed(() => !this._audio.audioEnabled());
}
