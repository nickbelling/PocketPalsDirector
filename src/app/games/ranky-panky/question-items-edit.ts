import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
    Component,
    computed,
    ElementRef,
    inject,
    signal,
    viewChild,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { v4 as uuid } from 'uuid';
import {
    resizeImage,
    SimpleDialogService,
    SimpleDialogType,
} from '../../common';
import { CommonControllerModule } from '../../common/common.module';
import { Entity } from '../database';
import {
    RankyPankyDatabase,
    RankyPankyQuestion,
    RankyPankyQuestionItem,
} from './database';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './question-items-edit.html',
})
export class RankyPankyQuestionItemsEditDialog {
    private _db = inject(RankyPankyDatabase);
    private _dialog = inject(MatDialogRef<RankyPankyQuestionItemsEditDialog>);
    private _data = inject<Entity<RankyPankyQuestion>>(MAT_DIALOG_DATA);
    private _confirm = inject(SimpleDialogService);

    protected loading = signal<boolean>(false);
    protected questionId: string;
    protected questionName: string;
    protected questionItems = signal<RankyPankyQuestionItem[]>([]);

    protected itemName = signal<string>('');
    protected itemValue = signal<number>(0);
    protected uploadFile = signal<File | null>(null);
    protected uploadProgress = signal<number>(0);
    private _fileUploadControl = viewChild<ElementRef>('fileInput');

    constructor() {
        this.questionId = this._data.firebaseId;
        this.questionName = this._data.name;
        this.questionItems.set(this._data.items);
    }

    protected isValid = computed(() => {
        return this.questionItems().length > 1;
    });

    protected addItemValid = computed(() => {
        return (
            this.itemName().trim().length > 0 &&
            this.itemValue() > 0 &&
            this.uploadFile() !== null
        );
    });

    public async addItem(): Promise<void> {
        this.loading.set(true);

        const resizedImage = await resizeImage(this.uploadFile()!, 250, 250);

        const path = await this._db.uploadFile(
            resizedImage,
            `${this.questionId}/${uuid()}`,
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

        await this._db.editQuestion(this.questionId, {
            items: this.questionItems(),
        });

        this.loading.set(false);
    }

    public async deleteItem(index: number): Promise<void> {
        const item = this.questionItems()[index];

        this._confirm.open(
            SimpleDialogType.YesNo,
            'Delete item',
            `Are you sure you want to delete ${item.name}?`,
            {
                onYes: async () => {
                    this.loading.set(true);
                    if (item.uploadedFilePath) {
                        await this._db.deleteFile(item.uploadedFilePath, true);
                    }

                    this.questionItems.update((old) => {
                        old.splice(index, 1);
                        return [...old];
                    });

                    await this._db.editQuestion(this.questionId, {
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
        await this._db.editQuestion(this.questionId, {
            items: this.questionItems(),
        });
        this.loading.set(false);
        this._dialog.close();
    }
}
