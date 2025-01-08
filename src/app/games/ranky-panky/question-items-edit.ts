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
import { resizeImage } from '../../common/utils';
import {
    BaseQuestionEditDialog,
    CommonControllerModule,
} from '../base/controller';
import { RankyPankyDatabase } from './database';
import { RankyPankyQuestion, RankyPankyQuestionItem } from './model';

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
    protected clipboardHasImage = signal<boolean>(false);
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
            `${this.id}/${uuid()}`,
            (progress) => this.uploadProgress.set(progress),
        );
        const newItem: RankyPankyQuestionItem = {
            name: this.itemName(),
            value: this.itemValue(),
            index: Math.max(0, ...this.questionItems().map((i) => i.index)) + 1,
            uploadedFilePath: path,
        };

        this.questionItems.update((val) => [...val, newItem]);
        this.itemName.set('');
        this.itemValue.set(0);
        this.uploadProgress.set(0);
        const control = this._fileUploadControl();
        control!.nativeElement.value = null;
        this.fileToUpload.set(null);

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

    public async gotFocus(): Promise<void> {
        const clipboardHasImage = await this._clipboardHasImage();
        this.clipboardHasImage.set(clipboardHasImage);
    }

    public async pasteImage(): Promise<void> {
        if (this.clipboardHasImage()) {
            const clipboardItems = await navigator.clipboard.read();
            for (const item of clipboardItems) {
                if (
                    item.types.includes('image/png') ||
                    item.types.includes('image/jpeg')
                ) {
                    const imageBlob =
                        (await item.getType('image/png')) ||
                        (await item.getType('image/jpeg'));
                    const fileName =
                        'Pasted' +
                        (imageBlob.type === 'image/png' ? '.png' : '.jpg');
                    const file = new File([imageBlob], fileName, {
                        type: imageBlob.type,
                    });

                    this.fileToUpload.set(file);
                    break;
                }
            }
        }
    }

    private async _clipboardHasImage(): Promise<boolean> {
        try {
            const clipboardItems = await navigator.clipboard.read();
            for (const item of clipboardItems) {
                if (
                    item.types.includes('image/png') ||
                    item.types.includes('image/jpeg')
                ) {
                    return true;
                }
            }
        } catch {
            console.log('No permissions granted for reading clipboard.');
        }

        return false;
    }
}
