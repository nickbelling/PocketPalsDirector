import { Component, inject } from '@angular/core';
import { BaseGame, CommonGameModule } from '../base/game';
import { AvoidingTheDmcaDatabase } from './database';
import {
    AvoidingTheDmcaQuestion,
    AvoidingTheDmcaState
} from './model';

@Component({
    imports: [CommonGameModule],
    templateUrl: './game.html',
    styleUrl: './game.scss',
    host: { class: 'pocket-pals-game size-1920x1080' },
})
export class AvoidingTheDmcaGame extends BaseGame<
    AvoidingTheDmcaState,
    AvoidingTheDmcaQuestion
> {
    constructor() {
        super(inject(AvoidingTheDmcaDatabase));
    }
}
