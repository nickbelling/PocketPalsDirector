import { Component, computed, inject, signal } from '@angular/core';
import { StateYourBidnessQuestion, StateYourBidnessService } from './database';
import { CommonControllerModule } from '../common-game.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Entity } from '../base-database.service';

@Component({
    templateUrl: './question-edit.html',
    imports: [CommonControllerModule],
})
export class StateYourBidnessQuestionEditDialog {
    private _db = inject(StateYourBidnessService);
    private _dialog = inject(MatDialogRef<StateYourBidnessQuestionEditDialog>);
    private _data = inject<Entity<StateYourBidnessQuestion>>(MAT_DIALOG_DATA);

    protected questionName = signal<string>('');
    protected questionDescription = signal<string>('');
    protected questionAnswers = signal<string>('');
    protected loading = signal<boolean>(false);
    protected editing: boolean = false;

    constructor() {
        if (this._data) {
            this.editing = true;
            this.questionName.set(this._data.name || '');
            this.questionDescription.set(this._data.description || '');
            this.questionAnswers.set(this._data.items.join('\n'));
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
                await this._db.editQuestion(this._data.firebaseId, question);
            } else {
                await this._db.addQuestion(question);
            }
        } finally {
            this.loading.set(false);
        }

        this._dialog.close();
    }
}
