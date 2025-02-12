import { Component, computed, inject, signal } from '@angular/core';
import {
    BaseQuestionEditDialog,
    CommonControllerModule,
} from '../base/controller';
import { VideogameCentipedeDatabase } from './database';
import { VideogameCentipedeQuestion } from './model';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './question-edit.html',
})
export class VideogameCentipedeQuestionEditDialog extends BaseQuestionEditDialog<VideogameCentipedeQuestion> {
    protected prompt = signal<string>('');
    protected answer = signal<string>('');
    protected isValid = computed(
        () =>
            this.prompt().trim().length > 0 && this.answer().trim().length > 0,
    );

    constructor() {
        super(inject(VideogameCentipedeDatabase));
    }

    public async submit(): Promise<void> {
        this.loading.set(true);

        try {
            this.addQuestion({
                answer: this.answer(),
                prompt: this.prompt(),
            });
            this.dialog.close();
        } finally {
            this.loading.set(false);
        }
    }
}
