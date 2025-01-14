import { Component, inject } from '@angular/core';
import { BaseGame, CommonGameModule } from '../base/game';
import { OrderUpDatabase } from './database';
import {
    OrderUpQuestion,
    OrderUpState
} from './model';

@Component({
    imports: [CommonGameModule],
    templateUrl: './game.html',
    styleUrl: './game.scss',
    host: { class: 'pocket-pals-game' },
})
export class OrderUpGame extends BaseGame<
    OrderUpState,
    OrderUpQuestion
> {
    protected data: OrderUpDatabase;

    constructor() {
        const database = inject(OrderUpDatabase);
        super(database);
        this.data = database;
    }
}
