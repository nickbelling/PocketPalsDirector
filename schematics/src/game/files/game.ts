import { Component, inject } from '@angular/core';
import { CommonGameModule } from '../../common';
import { BaseGame } from '../base/base-game';
import { <%= classify(name) %>Database } from './database';
import {
    <%= classify(name) %>Question,
    <%= classify(name) %>State
} from './model';

@Component({
    imports: [CommonGameModule],
    templateUrl: './game.html',
    styleUrl: './game.scss',
    host: { class: 'pocket-pals-game size-1920x1080' },
})
export class <%= classify(name) %>Game extends BaseGame<
    <%= classify(name) %>State,
    <%= classify(name) %>Question
> {
    constructor() {
        super(inject(<%= classify(name) %>Database));
    }
}
