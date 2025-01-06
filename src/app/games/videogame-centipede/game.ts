import { Component, inject } from '@angular/core';
import { fadeInOutAnimation } from '../../common/animations';
import { BaseGame, CommonGameModule } from '../base/game';
import { VideogameCentipedeDatabase } from './database';
import { VideogameCentipedeQuestion, VideogameCentipedeState } from './model';

@Component({
    imports: [CommonGameModule],
    templateUrl: './game.html',
    styleUrl: './game.scss',
    host: { class: 'pocket-pals-game' },
    animations: [fadeInOutAnimation()],
})
export class VideogameCentipedeGame extends BaseGame<
    VideogameCentipedeState,
    VideogameCentipedeQuestion
> {
    protected data: VideogameCentipedeDatabase;

    constructor() {
        const database = inject(VideogameCentipedeDatabase);
        super(database);
        this.data = database;
    }
}
