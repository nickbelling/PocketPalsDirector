import { Component, computed, inject } from '@angular/core';
import { fadeInOutAnimation, fadeOutAnimation } from '../../common/animations';
import { BaseGame, CommonGameModule } from '../base/game';
import { EmojionalDamageDatabase } from './database';
import { EmojionalDamageQuestion, EmojionalDamageState } from './model';

const SEGMENTER = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

@Component({
    imports: [CommonGameModule],
    templateUrl: './game.html',
    styleUrl: './game.scss',
    host: { class: 'pocket-pals-game' },
    animations: [fadeOutAnimation(), fadeInOutAnimation()],
})
export class EmojionalDamageGame extends BaseGame<
    EmojionalDamageState,
    EmojionalDamageQuestion
> {
    protected data: EmojionalDamageDatabase;
    private _lastId: number = 0;

    constructor() {
        const database = inject(EmojionalDamageDatabase);
        super(database);
        this.data = database;
    }

    protected promptCharacters = computed(() => {
        const question = this.currentQuestion();

        if (question) {
            this._lastId++;

            const segments = Array.from(
                SEGMENTER.segment(question.prompt),
                (s) => s.segment,
            );
            const emoji = segments.map((character, index) => ({
                character,
                index: `${this._lastId}_${index}`,
                delay: character === '\n' ? 0 : index,
            }));
            console.log(emoji);
            return emoji;
        } else {
            return [];
        }
    });
}
