import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
    Component,
    computed,
    ElementRef,
    inject,
    signal,
    viewChild,
} from '@angular/core';
import { v4 as uuid } from 'uuid';
import { resizeImage } from '../../common';
import { CommonControllerModule } from '../../common/common.module';
import { BaseQuestionEditDialog } from '../base/base-question-edit';
import {
    RankyPankyDatabase,
    RankyPankyQuestion,
    RankyPankyQuestionItem,
} from './database';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './question-items-edit.html',
})
export class RankyPankyQuestionItemsEditDialog extends BaseQuestionEditDialog<RankyPankyQuestion> {
    protected questionName: string;
    protected questionItems = signal<RankyPankyQuestionItem[]>([]);

    protected itemName = signal<string>('');
    protected itemValue = signal<number>(0);
    protected fileToUpload = signal<File | null>(null);
    protected uploadProgress = signal<number>(0);
    private _fileUploadControl = viewChild<ElementRef>('fileInput');

    constructor() {
        super(inject(RankyPankyDatabase));

        this.questionName = this.question!.name;
        this.questionItems.set(this.question!.items);
    }

    protected isValid = computed(() => {
        return this.questionItems().length > 1;
    });

    protected addItemValid = computed(() => {
        return (
            this.itemName().trim().length > 0 &&
            this.itemValue() > 0 &&
            this.fileToUpload() !== null
        );
    });

    public async addItem(): Promise<void> {
        this.loading.set(true);

        const resizedImage = await resizeImage(this.fileToUpload()!, 250, 250);

        const path = await this.uploadFile(
            resizedImage,
            `${this.firebaseId}/${uuid()}`,
            (progress) => this.uploadProgress.set(progress),
        );
        const newItem: RankyPankyQuestionItem = {
            name: this.itemName(),
            value: this.itemValue(),
            index: this.questionItems().length + 1,
            uploadedFilePath: path,
        };

        this.questionItems.update((val) => [...val, newItem]);
        this.itemName.set('');
        this.itemValue.set(0);
        this.uploadProgress.set(0);
        const control = this._fileUploadControl();
        control!.nativeElement.value = null;

        await this.editQuestion({
            items: this.questionItems(),
        });

        this.loading.set(false);
    }

    public async deleteItem(index: number): Promise<void> {
        const item = this.questionItems()[index];

        this.confirm.open(
            'deleteCancel',
            'Delete item',
            `Are you sure you want to delete ${item.name}?`,
            {
                onDelete: async () => {
                    this.loading.set(true);
                    if (item.uploadedFilePath) {
                        await this.deleteFile(item.uploadedFilePath, true);
                    }

                    this.questionItems.update((old) => {
                        old.splice(index, 1);
                        return [...old];
                    });

                    await this.editQuestion({
                        items: this.questionItems(),
                    });

                    this.loading.set(false);
                },
            },
        );
    }

    public reorder(event: CdkDragDrop<RankyPankyQuestionItem[]>): void {
        this.questionItems.update((old) => {
            moveItemInArray(old, event.previousIndex, event.currentIndex);
            return [...old];
        });
    }

    public async submit(): Promise<void> {
        this.loading.set(true);
        await this.editQuestion({
            items: this.questionItems(),
        });
        this.loading.set(false);
        this.dialog.close();
    }
}
