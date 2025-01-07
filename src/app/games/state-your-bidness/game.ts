import { Component, computed, inject } from '@angular/core';
import { fadeInOutAnimation } from '../../common/animations';
import { SoundService } from '../../common/files';
import { CommonGameModule } from '../base/game';
import { BaseGame } from '../base/game/base-game';
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
    private _sounds = inject(SoundService);

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
    protected muted = computed(() => !this._sounds.soundEnabled());
}
