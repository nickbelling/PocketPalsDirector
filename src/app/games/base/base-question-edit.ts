import {
    BaseGameDatabase,
    GameQuestionLike,
    GameStateLike,
} from './base-database';
import { BaseEntityEditDialog } from './base-entity-edit';

export class BaseQuestionEditDialog<
    TQuestion extends GameQuestionLike,
> extends BaseEntityEditDialog<TQuestion> {
    protected db: BaseGameDatabase<GameStateLike, TQuestion>;
    protected question = this.entity;

    constructor(db: BaseGameDatabase<GameStateLike, TQuestion>) {
        super();
        this.db = db;
    }

    protected async addQuestion(question: TQuestion): Promise<void> {
        await this.db.addQuestion(question);
    }

    protected async editQuestion(
        question: TQuestion | Partial<TQuestion>,
    ): Promise<void> {
        const id = this.id();
        if (id) {
            await this.db.editQuestion(id, question);
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
