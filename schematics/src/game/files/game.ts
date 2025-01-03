import { Component, inject } from '@angular/core';
import { BaseGame, CommonGameModule } from '../base/game';
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
    protected data: <%= classify(name) %>Database;

    constructor() {
        const database = inject(<%= classify(name) %>Database);
        super(database);
        this.data = database;
    }
}
