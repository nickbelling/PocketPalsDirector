import {
    Component,
    computed,
    effect,
    inject,
    signal,
    viewChild,
} from '@angular/core';
import { fadeInOutAnimation } from '../../common/animations';
import { AudioService, AudioVisualizer } from '../../common/audio';
import { BaseGame, CommonGameModule } from '../base/game';
import { AvoidingTheDmcaDatabase } from './database';
import { AvoidingTheDmcaQuestion, AvoidingTheDmcaState } from './model';

@Component({
    imports: [CommonGameModule],
    templateUrl: './game.html',
    styleUrl: './game.scss',
    animations: [fadeInOutAnimation()],
    host: { class: 'pocket-pals-game' },
})
export class AvoidingTheDmcaGame extends BaseGame<
    AvoidingTheDmcaState,
    AvoidingTheDmcaQuestion
> {
    private _audio = inject(AudioService);
    private _db: AvoidingTheDmcaDatabase;
    private _backwards = viewChild<AudioVisualizer>('backwards');
    private _forwards = viewChild<AudioVisualizer>('forwards');

    protected baseUrl = 'games/avoiding-the-dmca/';
    protected muted = computed(() => !this._audio.audioEnabled());

    /** True if the game card's back is currently showing. */
    protected gameBackShowing = signal<boolean>(true);

    /** True if the track card's back is currently showing. */
    protected trackBackShowing = signal<boolean>(true);

    /**
     * The current question's game ID. Setting it is dependent upon the card
     * flip animation being completed, so that it doesn't change before the card
     * flips back over. See the `effect()` below.
     */
    protected gameId = signal<string | undefined>(undefined);

    /**
     * The current question's track name. Setting it is dependent upon the card
     * flip animation being completed, so that it doesn't change before the card
     * flips back over. See the `effect()` below.
     */
    protected trackName = signal<string | undefined>(undefined);

    constructor() {
        const db = inject(AvoidingTheDmcaDatabase);
        super(db);
        this._db = db;

        // Starts or stops the backwards/forwards audio track.
        effect(() => {
            const state = this.state();
            const currentQuestion = this.currentQuestion();
            const backwards = this._backwards();
            const forwards = this._forwards();

            if (currentQuestion) {
                if (backwards) {
                    if (state.playingBackwards) {
                        backwards.play();
                    } else {
                        backwards.stop();
                    }
                }

                if (forwards) {
                    if (state.playingForwards) {
                        forwards.play();
                    } else {
                        forwards.stop();
                    }
                }
            }
        });

        // When the question changes, don't immediately change the game and
        // track name - instead, wait for the card flip animation to finish.
        effect(() => {
            const currentQuestion = this.currentQuestion();
            const gameBackShowing = this.gameBackShowing();
            const trackBackShowing = this.trackBackShowing();

            if (currentQuestion && gameBackShowing && trackBackShowing) {
                this.gameId.set(currentQuestion.gameId);
                this.trackName.set(currentQuestion.trackName);
            } else if (
                !currentQuestion &&
                gameBackShowing &&
                trackBackShowing
            ) {
                this.gameId.set(undefined);
                this.trackName.set(undefined);
            }
        });
    }

    public async onBackwardsEnded(): Promise<void> {
        await this._db.setState({
            playingBackwards: false,
        });
    }

    public async onForwardsEnded(): Promise<void> {
        await this._db.setState({
            playingForwards: false,
        });
    }
}
