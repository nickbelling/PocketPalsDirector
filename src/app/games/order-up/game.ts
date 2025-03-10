import { Component, effect, inject, linkedSignal } from '@angular/core';
import { fadeInOutAnimation } from '../../common/animations';
import { resolveStorageUrl } from '../../common/firestore';
import { downloadUrlAsBlob } from '../../common/utils';
import { BaseGame, CommonGameModule } from '../base/game';
import { OrderUpDatabase } from './database';
import {
    ORDER_UP_BASE_PATH,
    OrderUpQuestion,
    OrderUpQuestionItem,
    OrderUpState,
} from './model';

interface OrderUpQuestionItemWithImage extends OrderUpQuestionItem {
    imageSrc: Blob | null;
}

@Component({
    imports: [CommonGameModule],
    templateUrl: './game.html',
    styleUrl: './game.scss',
    host: { class: 'pocket-pals-game' },
    animations: [fadeInOutAnimation()],
})
export class OrderUpGame extends BaseGame<OrderUpState, OrderUpQuestion> {
    private _resolvedImages: Record<string, Blob | null> = {};

    protected data: OrderUpDatabase = inject(OrderUpDatabase);
    protected baseUrl = `${ORDER_UP_BASE_PATH}/`;

    protected displayedItemsWithImages = linkedSignal<
        OrderUpQuestionItemWithImage[] | undefined
    >(() => {
        // Reset the items if the question ever changes
        const question = this.currentQuestion();

        if (!question) {
            return undefined;
        }
    });

    constructor() {
        super(inject(OrderUpDatabase));

        effect(async () => {
            const displayedItems = this.displayedItems();

            if (displayedItems && displayedItems.length > 0) {
                const displayedItemsWithImages: OrderUpQuestionItemWithImage[] =
                    await Promise.all(
                        displayedItems.map(async (item) => {
                            const imageUrl = resolveStorageUrl(
                                `${ORDER_UP_BASE_PATH}/${item.imageId}`,
                            );

                            if (this._resolvedImages[imageUrl] === undefined) {
                                this._resolvedImages[imageUrl] =
                                    await downloadUrlAsBlob(imageUrl).catch(
                                        () => null,
                                    );
                            }

                            return {
                                ...item,
                                imageSrc: this._resolvedImages[imageUrl],
                            };
                        }),
                    );

                this.displayedItemsWithImages.set(displayedItemsWithImages);
            } else {
                this.displayedItemsWithImages.set(undefined);
            }
        });
    }

    protected sortedRevealedItems = this.data.sortedRevealedItems;
    protected sortedRevealedIndexes = this.data.sortedRevealedIndexes;
    protected displayedItems = this.data.displayedItems;
}
