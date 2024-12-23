import { Component, computed, inject, signal } from '@angular/core';
import { CommonControllerModule } from '../../common/common.module';
import { BaseQuestionEditDialog } from '../base/base-question-edit';
import { RankyPankyDatabase, RankyPankyQuestion } from './database';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './question-edit.html',
})
export class RankyPankyQuestionEditDialog extends BaseQuestionEditDialog<RankyPankyQuestion> {
    protected questionName = signal<string>('');
    protected questionDescription = signal<string>('');

    constructor() {
        super(inject(RankyPankyDatabase));

        if (this.question) {
            this.questionName.set(this.question.name || '');
            this.questionDescription.set(this.question.description || '');
        }
    }

    protected isValid = computed(() => {
        return (
            this.questionName().trim().length > 0 &&
            this.questionDescription().trim().length > 0
        );
    });

    public async submit(): Promise<void> {
        this.loading.set(true);

        try {
            if (this.editing) {
                await this.editQuestion({
                    name: this.questionName(),
                    description: this.questionDescription(),
                });
            } else {
                await this.addQuestion({
                    name: this.questionName(),
                    description: this.questionDescription(),
                    items: [],
                });
            }
        } finally {
            this.loading.set(false);
        }
    }
}
