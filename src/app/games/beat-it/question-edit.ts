import { Component, computed, inject, signal } from '@angular/core';
import {
    BaseQuestionEditDialog,
    CommonControllerModule,
} from '../base/controller';
import { BeatItDatabase } from './database';
import { BeatItQuestion } from './model';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './question-edit.html',
})
export class BeatItQuestionEditDialog extends BaseQuestionEditDialog<BeatItQuestion> {
    private _db: BeatItDatabase;

    protected gameId = signal<string | null>(null);
    protected hours = signal<number>(0);
    protected isValid = computed(() => this.gameId() && this.hours() > 0);

    constructor() {
        const db = inject(BeatItDatabase);
        super(db);
        this._db = db;
    }

    public async submit(): Promise<void> {
        this.loading.set(true);

        try {
            await this.addQuestion({
                gameId: this.gameId()!,
                hours: this.hours(),
            });
            this.dialog.close();
        } finally {
            this.loading.set(false);
        }
    }
}
