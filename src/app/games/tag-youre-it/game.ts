import { Component, inject } from '@angular/core';
import { BaseGame, CommonGameModule } from '../base/game';
import { TagYoureItDatabase } from './database';
import { TagYoureItQuestion, TagYoureItState } from './model';

@Component({
    imports: [CommonGameModule],
    templateUrl: './game.html',
    styleUrl: './game.scss',
    host: { class: 'pocket-pals-game' },
})
export class TagYoureItGame extends BaseGame<
    TagYoureItState,
    TagYoureItQuestion
> {
    protected data: TagYoureItDatabase;

    constructor() {
        const database = inject(TagYoureItDatabase);
        super(database);
        this.data = database;
    }
}
