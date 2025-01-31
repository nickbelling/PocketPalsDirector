import { inject } from '@angular/core';
import { ToastService } from '../../../common/toast';
import { BaseGameDatabase, GameQuestionLike, GameStateLike } from '../database';
import { BaseEntityEditDialog } from './base-entity-edit';

export class BaseQuestionEditDialog<
    TQuestion extends GameQuestionLike,
> extends BaseEntityEditDialog<TQuestion> {
    private _toast = inject(ToastService);
    protected db: BaseGameDatabase<GameStateLike, TQuestion>;
    protected question = this.entity;

    constructor(db: BaseGameDatabase<GameStateLike, TQuestion>) {
        super();
        this.db = db;
    }

    protected async addQuestion(question: TQuestion): Promise<void> {
        const questionName = this.db.getQuestionString(question);

        try {
            await this.db.addQuestion(question);
            this._toast.info(`Successfully added question "${questionName}".`);
        } catch (error) {
            this._toast.error(`Failed to add question "${questionName}".`);
        }
    }

    protected async editQuestion(
        question: TQuestion | Partial<TQuestion>,
    ): Promise<void> {
        const id = this.id();
        if (id) {
            try {
                const edited = await this.db.editQuestion(id, question);
                const questionName = this.db.getQuestionString(edited);
                this._toast.info(
                    `Successfully edited question "${questionName}".`,
                );
            } catch (error) {
                this._toast.error('Failed to edit question.', error);
            }
        } else {
            this._toast.error(
                'Failed to edit question: Dialog not in edit mode.',
            );
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
        isFullPath: boolean = false,
    ): Promise<void> {
        await this.db.deleteFile(path, isFullPath);
    }
}
