import { Component, computed, effect, inject, viewChild } from '@angular/core';
import { fadeInOutAnimation } from '../../common/animations';
import { AudioVisualizer } from '../../common/audio';
import { SoundService } from '../../common/files';
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
    private _sounds = inject(SoundService);
    private _db: AvoidingTheDmcaDatabase;
    private _backwards = viewChild<AudioVisualizer>('backwards');
    private _forwards = viewChild<AudioVisualizer>('forwards');

    protected baseUrl = 'games/avoiding-the-dmca/';
    protected muted = computed(() => !this._sounds.soundEnabled());

    constructor() {
        const db = inject(AvoidingTheDmcaDatabase);
        super(db);
        this._db = db;

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
