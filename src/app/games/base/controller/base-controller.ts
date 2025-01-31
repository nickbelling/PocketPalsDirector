import { inject, Signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../../../common/dialog';
import { Entity } from '../../../common/firestore';
import { ToastService } from '../../../common/toast';
import { BaseGameDatabase, GameQuestionLike, GameStateLike } from '../database';

export abstract class BaseController<
    TState extends GameStateLike,
    TQuestion extends GameQuestionLike,
> {
    protected _dialog = inject(MatDialog);
    protected _confirm = inject(ConfirmDialog);
    protected _toast = inject(ToastService);
    private _db: BaseGameDatabase<TState, TQuestion>;

    public readonly state: Signal<TState>;
    public readonly questions: Signal<Entity<TQuestion>[]>;
    public readonly currentQuestionId: Signal<string | null>;
    public readonly currentQuestion: Signal<Entity<TQuestion> | undefined>;
    public readonly nextQuestion: Signal<Entity<TQuestion> | undefined>;
    public readonly questionsRemaining: Signal<number>;

    constructor(db: BaseGameDatabase<TState, TQuestion>) {
        this._db = db;
        this.state = db.state;
        this.questions = db.questions;
        this.currentQuestionId = db.currentQuestionId;
        this.currentQuestion = db.currentQuestion;
        this.nextQuestion = db.nextQuestion;
        this.questionsRemaining = db.questionsRemaining;
    }

    public async reset(): Promise<void> {
        try {
            await this._db.resetState();
            this._toast.info('Game reset successfully.');
        } catch (error) {
            this._toast.error('Failed to reset the game.', error);
        }
    }

    public getQuestionString(question: Entity<TQuestion>): string {
        return this._db.getQuestionString(question);
    }

    protected async setState(state: TState | Partial<TState>): Promise<void> {
        try {
            await this._db.setState(state);
        } catch (error) {
            this._toast.error('Failed to update the game state.', error);
        }
    }

    protected async deleteQuestion(question: Entity<TQuestion>): Promise<void> {
        try {
            await this._db.deleteQuestion(question);
            this._toast.info(
                `Successfully deleted question "${this.getQuestionString(question)}".`,
            );
        } catch (error) {
            this._toast.error(
                `Failed to delete question "${this.getQuestionString(question)}".`,
            );
        }
    }

    protected async uploadFile(
        file: File,
        subPath: string,
        onProgress?: (progress: number) => void,
    ): Promise<string | null> {
        try {
            const url = await this._db.uploadFile(file, subPath, onProgress);
            return url;
        } catch (error) {
            this._toast.error(
                `Failed to upload file to path "${subPath}".`,
                error,
            );
            return null;
        }
    }

    protected async deleteFile(
        path: string,
        isFullPath?: boolean,
    ): Promise<void> {
        try {
            await this._db.deleteFile(path, isFullPath);
        } catch (error) {
            this._toast.error(`Failed to delete the file "${path}".`, error);
        }
    }
}
