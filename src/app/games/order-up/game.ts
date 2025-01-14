import { Component, inject } from '@angular/core';
import { BaseGame, CommonGameModule } from '../base/game';
import { OrderUpDatabase } from './database';
import { ORDER_UP_BASE_PATH, OrderUpQuestion, OrderUpState } from './model';

@Component({
    imports: [CommonGameModule],
    templateUrl: './game.html',
    styleUrl: './game.scss',
    host: { class: 'pocket-pals-game' },
})
export class OrderUpGame extends BaseGame<OrderUpState, OrderUpQuestion> {
    protected data: OrderUpDatabase = inject(OrderUpDatabase);
    protected baseUrl = `${ORDER_UP_BASE_PATH}/`;

    constructor() {
        super(inject(OrderUpDatabase));
    }

    protected sortedRevealedItems = this.data.sortedRevealedItems;
    protected sortedRevealedIndexes = this.data.sortedRevealedIndexes;
    protected displayedItems = this.data.displayedItems;
}
