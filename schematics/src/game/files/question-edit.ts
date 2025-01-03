import { Component, computed, inject, signal } from '@angular/core';
import {
    BaseQuestionEditDialog,
    CommonControllerModule,
} from '../base/controller';
import { <%= classify(name) %>Database } from './database';
import { <%= classify(name) %>Question } from './model';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './question-edit.html',
})
export class <%= classify(name) %>QuestionEditDialog extends BaseQuestionEditDialog<<%= classify(name) %>Question> {
    private _db: <%= classify(name) %>Database;

    protected name = signal<string>('');
    protected isValid = computed(() => this.name().trim().length > 0);

    constructor() {
        const db = inject(<%= classify(name) %>Database);
        super(db);
        this._db = db;
    }

    public async submit(): Promise<void> {
        this.loading.set(true);

        try {
            if (this.editing) {
            } else {
            }
            this.dialog.close();
        } finally {
            this.loading.set(false);
        }
    }
}
