import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, computed, inject, signal } from '@angular/core';
import { v4 } from 'uuid';
import {
    hasAtLeast,
    isGreaterThanZero,
    isNotEmpty,
    isNotNull,
    resizeImage,
} from '../../common/utils';
import {
    BaseQuestionEditDialog,
    CommonControllerModule,
} from '../base/controller';
import { RankyPankyDatabase } from './database';
import { RankyPankyQuestion, RankyPankyQuestionItem } from './model';

interface RankyPankyPendingQuestionItem {
    name: string;
    value: number;
    image: File | null;
    imageId: string | null;
}

@Component({
    imports: [CommonControllerModule],
    templateUrl: './question-edit.html',
})
export class RankyPankyQuestionEditDialog extends BaseQuestionEditDialog<RankyPankyQuestion> {
    private _deletedImageIds: string[] = [];

    protected questionName = signal<string>('');
    protected questionDescription = signal<string>('');
    protected questionTopLabel = signal<string>('');
    protected questionBottomLabel = signal<string>('');
    protected questionItemSuffix = signal<string>('');
    protected questionItems = signal<RankyPankyPendingQuestionItem[]>([]);

    protected itemName = signal<string>('');
    protected itemValue = signal<number>(0);
    protected itemImage = signal<File | null>(null);

    constructor() {
        super(inject(RankyPankyDatabase));

        if (this.question) {
            this.questionName.set(this.question.name || '');
            this.questionDescription.set(this.question.description || '');
            this.questionTopLabel.set(this.question.topLabel || '');
            this.questionBottomLabel.set(this.question.bottomLabel || '');
            this.questionItemSuffix.set(this.question.itemSuffix || '');

            const items: RankyPankyPendingQuestionItem[] = [];
            for (const item of this.question.items) {
                items.push({
                    name: item.name,
                    value: item.value,
                    imageId: item.uploadedFilePath,
                    image: null,
                });
            }
            this.questionItems.set(items);
        }
    }

    protected isValid = computed(() => {
        return (
            isNotEmpty(this.questionName) &&
            isNotEmpty(this.questionDescription) &&
            isNotEmpty(this.questionTopLabel) &&
            isNotEmpty(this.questionBottomLabel) &&
            hasAtLeast(5, this.questionItems)
        );
    });

    protected addItemValid = computed(() => {
        return (
            isNotEmpty(this.itemName) &&
            isGreaterThanZero(this.itemValue) &&
            isNotNull(this.itemImage)
        );
    });

    public async submit(): Promise<void> {
        this.loading.set(true);

        try {
            // Set up the items that will make up this question
            const pendingItems = this.questionItems();
            const items: RankyPankyQuestionItem[] = [];

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
                    index: i,
                    uploadedFilePath: item.imageId!,
                });
            }

            if (this.editing) {
                this.progress.increment('Updating question...');
                await this.editQuestion({
                    name: this.questionName(),
                    description: this.questionDescription(),
                    topLabel: this.questionTopLabel(),
                    bottomLabel: this.questionBottomLabel(),
                    itemSuffix: this.questionItemSuffix(),
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
                    name: this.questionName(),
                    description: this.questionDescription(),
                    topLabel: this.questionTopLabel(),
                    bottomLabel: this.questionBottomLabel(),
                    itemSuffix: this.questionItemSuffix(),
                    items: items,
                });
            }

            this.progress.finish();
            this.dialog.close();
        } finally {
            this.progress.reset();
            this.loading.set(false);
        }
    }

    public addItem(): void {
        if (this.addItemValid()) {
            this.questionItems.update((current) => {
                const newItem: RankyPankyPendingQuestionItem = {
                    name: this.itemName(),
                    value: this.itemValue(),
                    image: this.itemImage()!,
                    imageId: null,
                };

                return [...current, newItem];
            });

            this.itemName.set('');
            this.itemValue.set(0);
            this.itemImage.set(null);
        }
    }

    public deleteItem(index: number): void {
        this.questionItems.update((current) => {
            const array = [...current];
            const deleted = array.splice(index, 1);
            const imageId = deleted[0]?.imageId;
            if (imageId) {
                this._deletedImageIds.push(imageId);
            }
            return array;
        });
    }

    public reorder(event: CdkDragDrop<RankyPankyPendingQuestionItem[]>): void {
        this.questionItems.update((current) => {
            const old = [...current];
            moveItemInArray(old, event.previousIndex, event.currentIndex);
            return [...old];
        });
    }
}
