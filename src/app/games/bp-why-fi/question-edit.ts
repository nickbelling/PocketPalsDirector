import { Component, computed, inject, signal } from '@angular/core';
import { isNotEmpty } from '../../common/utils';
import {
    BaseQuestionEditDialog,
    CommonControllerModule,
} from '../base/controller';
import { BpWhyFiDatabase } from './database';
import { BpWhyFiQuestion } from './model';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './question-edit.html',
})
export class BpWhyFiQuestionEditDialog extends BaseQuestionEditDialog<BpWhyFiQuestion> {
    private readonly _db: BpWhyFiDatabase;

    protected readonly gameId = signal<string>('');
    protected readonly prompt = signal<string>('');
    protected readonly hintYear = signal<string>('');
    protected readonly hintGenre = signal<string>('');

    protected readonly isValid = computed(
        () =>
            isNotEmpty(this.gameId) &&
            isNotEmpty(this.prompt) &&
            isNotEmpty(this.hintYear) &&
            isNotEmpty(this.hintGenre),
    );

    constructor() {
        const db = inject(BpWhyFiDatabase);
        super(db);
        this._db = db;

        if (this.editing) {
            this.gameId.set(this.question?.gameId ?? '');
            this.prompt.set(this.question?.prompt ?? '');
            this.hintYear.set(this.question?.hintYear ?? '');
            this.hintGenre.set(this.question?.hintGenre ?? '');
        }
    }

    public async submit(): Promise<void> {
        this.loading.set(true);

        try {
            const question: BpWhyFiQuestion = {
                gameId: this.gameId(),
                prompt: this.prompt(),
                hintYear: this.hintYear(),
                hintGenre: this.hintGenre(),
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
