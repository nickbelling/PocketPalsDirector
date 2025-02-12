import { inject } from '@angular/core';
import { ProgressMonitor } from '../../../common/components/progress';
import { ToastService } from '../../../common/toast';
import { BaseGameDatabase, GameQuestionLike, GameStateLike } from '../database';
import { BaseEntityEditDialog } from './base-entity-edit';

/**
 * Base class for a dialog component for editing a game question.
 * Abstracts away as much of the common stuff as possible.
 */
export class BaseQuestionEditDialog<
    TQuestion extends GameQuestionLike,
> extends BaseEntityEditDialog<TQuestion> {
    protected _toast = inject(ToastService);

    public readonly db: BaseGameDatabase<GameStateLike, TQuestion>;
    public readonly question = this.entity;
    public readonly progress = new ProgressMonitor();

    constructor(db: BaseGameDatabase<GameStateLike, TQuestion>) {
        super();
        this.db = db;
    }

    /** Adds the given question to the database. */
    protected async addQuestion(question: TQuestion): Promise<void> {
        const questionName = this.db.getQuestionString(question);

        try {
            await this.db.addQuestion(question);
            this._toast.info(`Successfully added question "${questionName}".`);
        } catch (error) {
            this._toast.error(`Failed to add question "${questionName}".`);
        }
    }

    /** Updates the given question in the database. */
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

    /** Uploads the given file to this game's Firebase Storage subpath. */
    protected async uploadFile(
        file: File,
        subPath: string,
        onProgress?: (progress: number) => void,
    ): Promise<string> {
        return await this.db.uploadFile(file, subPath, onProgress);
    }

    /** Deletes the given file from this game's Firebase Storage subpath. */
    protected async deleteFile(subPath: string): Promise<void> {
        await this.db.deleteFile(subPath);
    }
}
