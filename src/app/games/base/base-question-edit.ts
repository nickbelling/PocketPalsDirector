import { computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Entity, SimpleDialogService } from '../../common';
import {
    BaseGameDatabase,
    GameQuestionLike,
    GameStateLike,
} from './base-database';

export class BaseQuestionEditDialog<TQuestion extends GameQuestionLike> {
    protected db: BaseGameDatabase<GameStateLike, TQuestion>;
    protected dialog = inject(MatDialogRef<BaseQuestionEditDialog<TQuestion>>);
    protected question = inject<Entity<TQuestion> | undefined>(MAT_DIALOG_DATA);
    protected confirm = inject(SimpleDialogService);

    protected loading = signal<boolean>(false);
    protected editing: boolean = this.question !== undefined;
    protected firebaseId = computed(() => this.question?.firebaseId);

    constructor(db: BaseGameDatabase<GameStateLike, TQuestion>) {
        this.db = db;
    }

    protected async addQuestion(question: TQuestion): Promise<void> {
        await this.db.addQuestion(question);
    }

    protected async editQuestion(
        question: TQuestion | Partial<TQuestion>,
    ): Promise<void> {
        const firebaseId = this.firebaseId();
        if (firebaseId) {
            await this.db.editQuestion(firebaseId, question);
        } else {
            throw new Error('Dialog not in edit mode.');
        }
    }

    protected async uploadFile(
        file: File,
        subPath: string,
        onProgress?: (progress: number) => void,
    ): Promise<string> {
        return await this.db.uploadFile(file, subPath, onProgress);
    }

    protected async deleteFile(
        path: string,
        isFullPath?: boolean,
    ): Promise<void> {
        await this.db.deleteFile(path, isFullPath);
    }
}
