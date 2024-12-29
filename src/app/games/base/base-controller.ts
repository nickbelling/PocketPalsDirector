import { inject, Signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../../common/dialog';
import { Entity } from '../../common/firestore';
import {
    BaseGameDatabase,
    GameQuestionLike,
    GameStateLike,
} from './base-database';

export abstract class BaseController<
    TState extends GameStateLike,
    TQuestion extends GameQuestionLike,
> {
    protected _dialog = inject(MatDialog);
    protected _confirm = inject(ConfirmDialog);
    private _db: BaseGameDatabase<TState, TQuestion>;

    public readonly gameState: Signal<TState>;
    public readonly gameQuestions: Signal<Entity<TQuestion>[]>;
    public readonly currentQuestionId: Signal<string | null>;
    public readonly currentQuestion: Signal<Entity<TQuestion> | undefined>;

    constructor(db: BaseGameDatabase<TState, TQuestion>) {
        this._db = db;
        this.gameState = db.state;
        this.gameQuestions = db.questions;
        this.currentQuestionId = db.currentQuestionId;
        this.currentQuestion = db.currentQuestion;
    }

    public async reset(): Promise<void> {
        await this._confirm.open(
            'yesNo',
            'Reset game',
            `Are you sure you want to reset this game? This will return the
            game to a fresh state, but won't delete any questions.`,
            {
                onYes: async () => {
                    await this._db.resetState();
                },
            },
        );
    }

    protected async setState(state: TState | Partial<TState>): Promise<void> {
        await this._db.setState(state);
    }

    protected async deleteQuestion(question: Entity<TQuestion>): Promise<void> {
        await this._db.deleteQuestion(question);
    }

    protected async uploadFile(
        file: File,
        subPath: string,
        onProgress?: (progress: number) => void,
    ): Promise<string> {
        return await this._db.uploadFile(file, subPath, onProgress);
    }

    protected async deleteFile(
        path: string,
        isFullPath?: boolean,
    ): Promise<void> {
        await this._db.deleteFile(path, isFullPath);
    }
}
