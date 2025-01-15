import {
    animate,
    query,
    stagger,
    style,
    transition,
    trigger,
} from '@angular/animations';
import { Component, computed, inject } from '@angular/core';
import { fadeInOutAnimation } from '../../common/animations';
import { BaseGame, CommonGameModule } from '../base/game';
import { SwitchThatReverseItDatabase } from './database';
import { SwitchThatReverseItQuestion, SwitchThatReverseItState } from './model';

@Component({
    imports: [CommonGameModule],
    templateUrl: './game.html',
    styleUrl: './game.scss',
    host: { class: 'pocket-pals-game' },
    animations: [
        fadeInOutAnimation(),
        trigger('fadeInPrompt', [
            transition('* => *', [
                // each time the binding value changes
                query(
                    ':enter',
                    [
                        style({ opacity: 0 }),
                        stagger('50ms', [
                            animate('0.3s', style({ opacity: 1 })),
                        ]),
                    ],
                    { optional: true },
                ),
            ]),
        ]),
    ],
})
export class SwitchThatReverseItGame extends BaseGame<
    SwitchThatReverseItState,
    SwitchThatReverseItQuestion
> {
    protected data: SwitchThatReverseItDatabase;
    private _lastId: number = 0;

    constructor() {
        const database = inject(SwitchThatReverseItDatabase);
        super(database);
        this.data = database;
    }

    protected promptCharacters = computed(() => {
        const question = this.currentQuestion();

        if (question) {
            this._lastId++;
            return question.prompt.split('').map((char, index) => {
                return {
                    character: char,
                    index: `${this._lastId}_${index}`,
                };
            });
        } else {
            return [];
        }
    });
}
