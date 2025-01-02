import { Component, computed, inject, signal } from '@angular/core';
import {
    BaseQuestionEditDialog,
    CommonControllerModule,
} from '../base/controller';
import { RankyPankyDatabase } from './database';
import { RankyPankyQuestion } from './model';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './question-edit.html',
})
export class RankyPankyQuestionEditDialog extends BaseQuestionEditDialog<RankyPankyQuestion> {
    protected questionName = signal<string>('');
    protected questionDescription = signal<string>('');
    protected questionTopLabel = signal<string>('');
    protected questionBottomLabel = signal<string>('');
    protected questionItemSuffix = signal<string>('');

    constructor() {
        super(inject(RankyPankyDatabase));

        if (this.question) {
            this.questionName.set(this.question.name || '');
            this.questionDescription.set(this.question.description || '');
            this.questionTopLabel.set(this.question.topLabel || '');
            this.questionBottomLabel.set(this.question.bottomLabel || '');
            this.questionItemSuffix.set(this.question.itemSuffix || '');
        }
    }

    protected isValid = computed(() => {
        return (
            this.questionName().trim().length > 0 &&
            this.questionDescription().trim().length > 0 &&
            this.questionTopLabel().trim().length > 0 &&
            this.questionBottomLabel().trim().length > 0
        );
    });

    public async submit(): Promise<void> {
        this.loading.set(true);

        try {
            if (this.editing) {
                await this.editQuestion({
                    name: this.questionName(),
                    description: this.questionDescription(),
                    topLabel: this.questionTopLabel(),
                    bottomLabel: this.questionBottomLabel(),
                    itemSuffix: this.questionItemSuffix(),
                });
            } else {
                await this.addQuestion({
                    name: this.questionName(),
                    description: this.questionDescription(),
                    topLabel: this.questionTopLabel(),
                    bottomLabel: this.questionBottomLabel(),
                    itemSuffix: this.questionItemSuffix(),
                    items: [],
                });
            }
        } finally {
            this.loading.set(false);
        }
    }
}
