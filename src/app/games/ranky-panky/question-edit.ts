import { Component, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonControllerModule } from '../common-game.module';
import { Entity } from '../database';
import { RankyPankyDatabase, RankyPankyQuestion } from './database';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './question-edit.html',
})
export class RankyPankyQuestionEditDialog {
    private _db = inject(RankyPankyDatabase);
    private _dialog = inject(MatDialogRef<RankyPankyQuestionEditDialog>);
    private _data = inject<Entity<RankyPankyQuestion>>(MAT_DIALOG_DATA);

    protected loading = signal<boolean>(false);
    protected editing: boolean = false;

    protected questionName = signal<string>('');
    protected questionDescription = signal<string>('');

    constructor() {
        if (this._data) {
            this.editing = true;
            this.questionName.set(this._data.name || '');
            this.questionDescription.set(this._data.description || '');
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
                await this._db.editQuestion(this._data.firebaseId, {
                    name: this.questionName(),
                    description: this.questionDescription(),
                });
            } else {
                await this._db.addQuestion({
                    name: this.questionName(),
                    description: this.questionDescription(),
                    items: [],
                });
            }
        } finally {
            this.loading.set(false);
        }

        this._dialog.close();
    }
}
