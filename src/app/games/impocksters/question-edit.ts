import { Component, computed, inject, signal } from '@angular/core';
import { v4 } from 'uuid';
import {
    BaseQuestionEditDialog,
    CommonControllerModule,
} from '../base/controller';
import { isNotEmpty, isNotNull, resizeImage } from './../../common/utils';
import { ImpockstersDatabase } from './database';
import { ImpocksterOriginType, ImpockstersQuestion } from './model';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './question-edit.html',
})
export class ImpockstersQuestionEditDialog extends BaseQuestionEditDialog<ImpockstersQuestion> {
    private _db: ImpockstersDatabase;

    protected name = signal<string>('');
    protected from = signal<string>('');
    protected fromType = signal<ImpocksterOriginType>('series');
    protected imageFile = signal<File | null>(null);
    protected forbiddenTerms = signal<string>('');
    protected isValid = computed(
        () =>
            isNotEmpty(this.name) &&
            isNotEmpty(this.from) &&
            isNotEmpty(this.fromType) &&
            isNotEmpty(this.forbiddenTerms) &&
            isNotNull(this.imageFile),
    );

    constructor() {
        const db = inject(ImpockstersDatabase);
        super(db);
        this._db = db;
    }

    public async submit(): Promise<void> {
        this.loading.set(true);

        try {
            if (this.editing) {
            } else {
                this.progress.start(3);
                this.progress.set(1, 'Resizing image...');
                const file = this.imageFile();
                const resizedImage = await resizeImage(file!, 500, 500);
                const imageId = v4();

                this.progress.set(2, 'Uploading image...');
                await this.uploadFile(resizedImage, imageId);

                this.progress.set(3, 'Adding question...');
                await this.addQuestion({
                    name: this.name(),
                    fromType: this.fromType(),
                    from: this.from(),
                    imageId: imageId,
                    forbiddenTerms: this.forbiddenTerms().trim().split('\n'),
                });
                this.progress.finish();
            }
            this.dialog.close();
        } finally {
            this.progress.reset();
            this.loading.set(false);
        }
    }
}
