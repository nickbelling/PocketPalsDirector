import { Component, effect, inject, signal } from '@angular/core';
import { fadeInOutAnimation } from '../../common/animations';
import { ImageService } from '../../common/files';
import { BaseGame, CommonGameModule } from '../base/game';
import { OrderUpDatabase } from './database';
import { ORDER_UP_BASE_PATH, OrderUpQuestion, OrderUpState } from './model';

@Component({
    imports: [CommonGameModule],
    templateUrl: './game.html',
    styleUrl: './game.scss',
    host: { class: 'pocket-pals-game' },
    animations: [fadeInOutAnimation()],
})
export class OrderUpGame extends BaseGame<OrderUpState, OrderUpQuestion> {
    private _images = inject(ImageService);
    protected data: OrderUpDatabase = inject(OrderUpDatabase);
    protected baseUrl = `${ORDER_UP_BASE_PATH}/`;

    protected imagesPreloaded = signal<boolean>(false);

    constructor() {
        super(inject(OrderUpDatabase));

        effect(async () => {
            const currentQuestion = this.currentQuestion();

            if (currentQuestion) {
                this.imagesPreloaded.set(false);
                const imagePreloads = currentQuestion.items.map((i) =>
                    this._images.preloadStorageImage(
                        `${ORDER_UP_BASE_PATH}/${i.imageId}`,
                    ),
                );

                await Promise.all(imagePreloads);
                this.imagesPreloaded.set(true);
            }
        });
    }

    protected sortedRevealedItems = this.data.sortedRevealedItems;
    protected sortedRevealedIndexes = this.data.sortedRevealedIndexes;
    protected displayedItems = this.data.displayedItems;
}
