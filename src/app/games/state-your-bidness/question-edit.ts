import { Component, computed, inject, signal } from '@angular/core';
import {
    BaseQuestionEditDialog,
    CommonControllerModule,
} from '../base/controller';
import { StateYourBidnessDatabase } from './database';
import { StateYourBidnessQuestion } from './model';

@Component({
    templateUrl: './question-edit.html',
    imports: [CommonControllerModule],
})
export class StateYourBidnessQuestionEditDialog extends BaseQuestionEditDialog<StateYourBidnessQuestion> {
    protected questionName = signal<string>('');
    protected questionDescription = signal<string>('');
    protected questionAnswers = signal<string>('');

    constructor() {
        super(inject(StateYourBidnessDatabase));

        if (this.question) {
            this.questionName.set(this.question.name || '');
            this.questionDescription.set(this.question.description || '');
            this.questionAnswers.set(this.question.items.join('\n'));
        }
    }

    protected isValid = computed(() => {
        return (
            this.questionName().trim().length > 0 &&
            this.questionDescription().trim().length > 0 &&
            this.questionAnswers().trim().length > 0
        );
    });

    public async submit(): Promise<void> {
        this.loading.set(true);
        const answers = this.questionAnswers().trim().split('\n');
        const question: StateYourBidnessQuestion = {
            name: this.questionName(),
            description: this.questionDescription(),
            items: answers,
        };

        try {
            if (this.editing) {
                await this.editQuestion(question);
            } else {
                await this.addQuestion(question);
            }
        } finally {
            this.loading.set(false);
        }

        this.dialog.close();
    }
}
