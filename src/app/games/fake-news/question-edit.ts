import { Component, computed, inject, signal } from '@angular/core';
import { isNotEmpty } from '../../common/utils';
import {
    BaseQuestionEditDialog,
    CommonControllerModule,
} from '../base/controller';
import { FakeNewsFactCheckersDatabase } from './database';
import { FakeNewsFactCheckersQuestion } from './model';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './question-edit.html',
})
export class FakeNewsFactCheckersQuestionEditDialog extends BaseQuestionEditDialog<FakeNewsFactCheckersQuestion> {
    private _db: FakeNewsFactCheckersDatabase;

    protected subject = signal<string>('');
    protected prompt = signal<string>('');
    protected correction = signal<string>('');
    protected isValid = computed(
        () =>
            isNotEmpty(this.subject) &&
            isNotEmpty(this.prompt) &&
            isNotEmpty(this.correction),
    );

    constructor() {
        const db = inject(FakeNewsFactCheckersDatabase);
        super(db);
        this._db = db;

        if (this.editing) {
            this.subject.set(this.question?.subject || '');
            this.prompt.set(this.question?.prompt || '');
            this.correction.set(this.question?.correction || '');
        }
    }

    public async submit(): Promise<void> {
        this.loading.set(true);

        try {
            const question: FakeNewsFactCheckersQuestion = {
                subject: this.subject(),
                prompt: this.prompt(),
                correction: this.correction(),
            };

            if (this.editing) {
                await this.editQuestion(question);
            } else {
                await this.addQuestion(question);
            }
            this.dialog.close();
        } finally {
            this.loading.set(false);
        }
    }
}
