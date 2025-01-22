import { Component, inject } from '@angular/core';
import { fadeInOutAnimation } from '../../common/animations';
import { BaseGame, CommonGameModule } from '../base/game';
import { BeatItDatabase } from './database';
import { BeatItQuestion, BeatItState } from './model';

@Component({
    imports: [CommonGameModule],
    templateUrl: './game.html',
    styleUrl: './game.scss',
    host: { class: 'pocket-pals-game' },
    animations: [fadeInOutAnimation()],
})
export class BeatItGame extends BaseGame<BeatItState, BeatItQuestion> {
    protected data: BeatItDatabase;

    constructor() {
        const database = inject(BeatItDatabase);
        super(database);
        this.data = database;
    }
}
