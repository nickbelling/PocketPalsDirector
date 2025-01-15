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

    protected progress = signal<number>(0);
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
                this.progress.set(25);
                const file = this.imageFile();
                const resizedImage = await resizeImage(file!, 500, 500);
                const imageId = v4();

                this.progress.set(50);
                await this.uploadFile(resizedImage, imageId);

                this.progress.set(75);
                await this.addQuestion({
                    name: this.name(),
                    fromType: this.fromType(),
                    from: this.from(),
                    imageId: imageId,
                    forbiddenTerms: this.forbiddenTerms().trim().split('\n'),
                });
            }
            this.dialog.close();
        } finally {
            this.loading.set(false);
        }
    }
}
