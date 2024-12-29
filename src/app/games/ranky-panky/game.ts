import { Component, computed, inject } from '@angular/core';
import { fadeInOutAnimation } from '../../common/animations';
import { CommonGameModule } from '../../common/common.module';
import { BaseGame } from '../base/base-game';
import { RankyPankyDatabase } from './database';
import { RankyPankyQuestion, RankyPankyState } from './model';

@Component({
    imports: [CommonGameModule],
    templateUrl: './game.html',
    styleUrl: './game.scss',
    host: { class: 'pocket-pals-game size-1920x1080' },
    animations: [fadeInOutAnimation(1000)],
})
export class RankyPankyGame extends BaseGame<
    RankyPankyState,
    RankyPankyQuestion
> {
    constructor() {
        super(inject(RankyPankyDatabase));
    }

    protected currentGuessedItems = computed(() => {
        const question = this.currentQuestion();
        const state = this.gameState();

        if (question) {
            const itemsOriginalOrder = question.items;
            if (
                state.currentGuessedOrder.length === itemsOriginalOrder.length
            ) {
                return state.currentGuessedOrder.map(
                    (index) =>
                        itemsOriginalOrder.find(
                            (item) => item.index === index,
                        )!,
                );
            } else {
                return itemsOriginalOrder;
            }
        } else {
            return [];
        }
    });

    protected answers = computed(() => {
        const question = this.currentQuestion();

        if (question) {
            const sorted = [...question.items].sort(
                (a, b) => b.value - a.value,
            );
            return sorted;
        } else {
            return [];
        }
    });
}
