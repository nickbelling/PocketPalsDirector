import { Component, computed, inject, signal } from '@angular/core';
import { isNotEmpty } from '../../common/utils';
import {
    BaseQuestionEditDialog,
    CommonControllerModule,
} from '../base/controller';
import { SwiperEliteDatabase } from './database';
import { SwiperEliteQuestion, SwiperEliteQuestionCard } from './model';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './question-edit.html',
})
export class SwiperEliteQuestionEditDialog extends BaseQuestionEditDialog<SwiperEliteQuestion> {
    protected readonly title = signal<string>('');
    protected readonly description = signal<string>('');
    protected readonly categoryLeft = signal<string>('');
    protected readonly categoryRight = signal<string>('');
    protected readonly categoryLeftItems = signal<string>('');
    protected readonly categoryRightItems = signal<string>('');

    protected isValid = computed(
        () =>
            isNotEmpty(this.title) &&
            isNotEmpty(this.categoryLeft) &&
            isNotEmpty(this.categoryRight) &&
            (isNotEmpty(this.categoryLeftItems) ||
                isNotEmpty(this.categoryRightItems)),
    );

    constructor() {
        const db = inject(SwiperEliteDatabase);
        super(db);

        if (this.editing) {
            this.title.set(this.question?.title ?? '');
            this.description.set(this.question?.description ?? '');
            this.categoryLeft.set(this.question?.categoryLeft ?? '');
            this.categoryRight.set(this.question?.categoryRight ?? '');

            for (const item of this.question?.items ?? []) {
                if (item.isInRightCategory) {
                    this.categoryRightItems.update(
                        (existing) => `${existing}\n${item.title}`,
                    );
                } else {
                    this.categoryLeftItems.update(
                        (existing) => `${existing}\n${item.title}`,
                    );
                }
            }
        }
    }

    public async submit(): Promise<void> {
        this.loading.set(true);

        try {
            const items: SwiperEliteQuestionCard[] = [
                ...this.categoryLeftItems()
                    .split('\n')
                    .filter((item) => item.length)
                    .map(
                        (item) =>
                            ({
                                isInRightCategory: false,
                                title: item,
                            }) satisfies SwiperEliteQuestionCard,
                    ),
                ...this.categoryRightItems()
                    .split('\n')
                    .filter((item) => item.length)
                    .map(
                        (item) =>
                            ({
                                isInRightCategory: true,
                                title: item,
                            }) satisfies SwiperEliteQuestionCard,
                    ),
            ];

            const question: SwiperEliteQuestion = {
                title: this.title(),
                description: this.description(),
                categoryLeft: this.categoryLeft(),
                categoryRight: this.categoryRight(),
                items,
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
