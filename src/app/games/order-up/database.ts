import { computed, Injectable } from '@angular/core';
import { Entity } from '../../common/firestore';
import { BaseGameDatabase } from '../base/database';
import {
    ORDER_UP_BASE_PATH,
    ORDER_UP_STATE_DEFAULT,
    OrderUpQuestion,
    OrderUpState,
} from './model';

@Injectable({
    providedIn: 'root',
})
export class OrderUpDatabase extends BaseGameDatabase<
    OrderUpState,
    OrderUpQuestion
> {
    constructor() {
        super(ORDER_UP_BASE_PATH, ORDER_UP_STATE_DEFAULT);
    }

    public override getQuestionString(
        question: Entity<OrderUpQuestion>,
    ): string {
        return question.name;
    }

    protected override async afterDeleteQuestion(
        question: Entity<OrderUpQuestion>,
    ): Promise<void> {
        // Delete the images associated with this question
        for (const item of question.items) {
            await this.deleteFile(item.imageId);
        }
    }

    /**
     * Based on the "currentQuestionRevealOrder" in the state object, orders the
     * item objects for the current question in that order.
     */
    public readonly revealOrderedItems = computed(() => {
        const state = this.state();
        const question = this.currentQuestion();

        if (question) {
            // "currentQuestionRevealOrder" is an array like [3, 1, 0, 4, 2].
            // We'll map() that array to the items with that "order", and then
            // filter() out any undefined ones (there shouldn't be any, but
            // doing so will keep the typing system happy)
            return state.currentQuestionRevealOrder
                .map((index) =>
                    question?.items.find((item) => item.order === index),
                )
                .filter((item) => item !== undefined);
        } else {
            return [];
        }
    });

    /** The "revealed" items in their sorted order. */
    public readonly sortedRevealedItems = computed(() => {
        const state = this.state();
        const revealOrderedItems = this.revealOrderedItems();

        return revealOrderedItems
            .slice(0, state.revealedCount)
            .sort((a, b) => a.order - b.order);
    });

    /** The "revealed" item indexes. */
    public readonly sortedRevealedIndexes = computed(() => {
        return this.sortedRevealedItems().map((i) => i.order);
    });

    /**
     * The next item in the reveal order that has not yet currently been sorted
     * into place.
     */
    public readonly nextItem = computed(() => {
        const state = this.state();
        const revealOrderedItems = this.revealOrderedItems();

        return revealOrderedItems[state.revealedCount];
    });

    /**
     * The currently displayed items, with the "next" item in its currently
     * pending position.
     */
    public readonly displayedItems = computed(() => {
        const state = this.state();
        const sortedRevealedItems = this.sortedRevealedItems();
        const nextItem = this.nextItem();

        if (nextItem) {
            return [
                ...sortedRevealedItems.slice(0, state.currentPosition),
                nextItem,
                ...sortedRevealedItems.slice(state.currentPosition),
            ];
        } else {
            return sortedRevealedItems;
        }
    });
}
