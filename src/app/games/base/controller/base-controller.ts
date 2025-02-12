import { inject, Signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../../../common/dialog';
import { Entity } from '../../../common/firestore';
import { ToastService } from '../../../common/toast';
import { BaseGameDatabase, GameQuestionLike, GameStateLike } from '../database';

/**
 * Base class for a Game Controller component. Abstracts away as much of the
 * common stuff as possible, e.g. the state signal and update functions, the
 * question list, etc.
 */
export abstract class BaseController<
    TState extends GameStateLike,
    TQuestion extends GameQuestionLike,
> {
    protected _dialog = inject(MatDialog);
    protected _confirm = inject(ConfirmDialog);
    protected _toast = inject(ToastService);

    /**
     * The service that manages the data store for this specific game.
     */
    private _db: BaseGameDatabase<TState, TQuestion>;

    /** The game's current state. */
    public readonly state: Signal<TState>;

    /** The game's question list. */
    public readonly questions: Signal<Entity<TQuestion>[]>;

    /** The ID of the currently selected question (null if none selected). */
    public readonly currentQuestionId: Signal<string | null>;

    /** The current question object (undefined if none selected). */
    public readonly currentQuestion: Signal<Entity<TQuestion> | undefined>;

    /**
     * The next question after current question (undefined if the current
     * question is the last one).
     */
    public readonly nextQuestion: Signal<Entity<TQuestion> | undefined>;

    /** The number of questions remaining after the current question. */
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

    /** Resets the game's state to an "unplayed" state. */
    public async reset(): Promise<void> {
        try {
            await this._db.resetState();
            this._toast.info('Game reset successfully.');
        } catch (error) {
            this._toast.error('Failed to reset the game.', error);
        }
    }

    /** Gets the string representation of the given question. */
    public getQuestionString(question: Entity<TQuestion>): string {
        return this._db.getQuestionString(question);
    }

    /**
     * Sets the state for the current game, or any aspect/s of it.
     * @param state The state object, either in its entirety, or just partially.
     */
    protected async setState(state: TState | Partial<TState>): Promise<void> {
        try {
            await this._db.setState(state);
        } catch (error) {
            this._toast.error('Failed to update the game state.', error);
        }
    }

    /**
     * Deletes the given question from the game's database.
     */
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

    /**
     * Uploads a file to the given Firebase Storage subpath for the given game.
     */
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

    /** Deletes a file from the given Firebase Storage path. */
    protected async deleteFile(subPath: string): Promise<void> {
        try {
            await this._db.deleteFile(subPath);
        } catch (error) {
            this._toast.error(`Failed to delete the file "${subPath}".`, error);
        }
    }
}
