import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, computed, inject, signal } from '@angular/core';
import { v4 } from 'uuid';
import {
    hasAtLeast,
    isNotEmpty,
    isNotNull,
    resizeImage,
} from '../../common/utils';
import {
    BaseQuestionEditDialog,
    CommonControllerModule,
} from '../base/controller';
import { OrderUpDatabase } from './database';
import { OrderUpQuestion, OrderUpQuestionItem } from './model';

interface OrderUpQuestionPendingItem {
    name: string;
    value: string;
    image: File | null;
    imageId: string | null;
}

@Component({
    imports: [CommonControllerModule],
    templateUrl: './question-edit.html',
})
export class OrderUpQuestionEditDialog extends BaseQuestionEditDialog<OrderUpQuestion> {
    private _deletedImageIds: string[] = [];

    protected name = signal<string>('');
    protected description = signal<string>('');
    protected items = signal<OrderUpQuestionPendingItem[]>([]);
    protected itemName = signal<string>('');
    protected itemValue = signal<string>('');
    protected itemImage = signal<File | null>(null);

    protected isValid = computed(
        () =>
            isNotEmpty(this.name) &&
            isNotEmpty(this.description) &&
            hasAtLeast(10, this.items),
    );

    protected itemIsValid = computed(
        () =>
            isNotEmpty(this.itemName) &&
            isNotEmpty(this.itemValue) &&
            isNotNull(this.itemImage),
    );

    constructor() {
        super(inject(OrderUpDatabase));

        if (this.question && this.editing) {
            this.name.set(this.question.name);
            this.description.set(this.question.description);
            const pendingItems: OrderUpQuestionPendingItem[] = [];

            this.question.items.forEach((item) => {
                pendingItems.push({
                    name: item.name,
                    value: item.value,
                    image: null,
                    imageId: item.imageId,
                });
            });

            this.items.set(pendingItems);
        }
    }

    public async submit(): Promise<void> {
        this.loading.set(true);

        try {
            // Set up the items that will make up this question
            const pendingItems = this.items();
            const items: OrderUpQuestionItem[] = [];

            this.progress.start(pendingItems.length + 1);

            // Upload images
            for (let i = 0; i < pendingItems.length; i++) {
                const item = pendingItems[i];

                if (item.image !== null) {
                    // Newly added image, has image file
                    this.progress.increment(`Uploading image ${i + 1}...`);
                    const resized = await resizeImage(item.image, 300, 300);
                    const imageId = v4();
                    await this.uploadFile(resized, imageId);
                    item.imageId = imageId;
                } // else existing image, nothing to upload

                items.push({
                    name: item.name,
                    value: item.value,
                    order: i,
                    imageId: item.imageId!,
                });
            }

            if (this.editing) {
                this.progress.increment('Updating question...');
                await this.editQuestion({
                    name: this.name(),
                    description: this.description(),
                    items: items,
                });

                // Delete any images from storage that have been deleted after
                // being uploaded
                for (const deletedImageId of this._deletedImageIds) {
                    await this.deleteFile(deletedImageId);
                }
            } else {
                this.progress.increment('Adding question...');
                await this.addQuestion({
                    name: this.name(),
                    description: this.description(),
                    items: items,
                });
            }

            this.progress.finish();
            this.dialog.close();
        } finally {
            this.loading.set(false);
        }
    }

    public addItem(): void {
        if (this.itemIsValid()) {
            this.items.update((current) => {
                const newItem: OrderUpQuestionPendingItem = {
                    name: this.itemName(),
                    value: this.itemValue(),
                    image: this.itemImage()!,
                    imageId: null,
                };

                return [...current, newItem];
            });

            this.itemName.set('');
            this.itemValue.set('');
            this.itemImage.set(null);
        }
    }

    public deleteItem(index: number): void {
        this.items.update((current) => {
            const array = [...current];
            const deleted = array.splice(index, 1);
            const imageId = deleted[0]?.imageId;
            if (imageId) {
                this._deletedImageIds.push(imageId);
            }
            return array;
        });
    }

    public reorder(event: CdkDragDrop<OrderUpQuestionPendingItem[]>): void {
        this.items.update((current) => {
            const old = [...current];
            moveItemInArray(old, event.previousIndex, event.currentIndex);
            return [...old];
        });
    }
}
