import { Signal } from '@angular/core';
import { Entity } from '../../../common/firestore';
import {
    BaseGameDatabase,
    GameQuestionLike,
    GameStateLike,
} from '../database/base-database';

/**
 * Base class for a Game component. Abstracts away as much of the common stuff
 * as possible, e.g. the current state, the question list, the current question,
 * etc.
 */
export abstract class BaseGame<
    TState extends GameStateLike,
    TQuestion extends GameQuestionLike,
> {
    /** The current game state. */
    public readonly state: Signal<TState>;

    /** The game's question list. */
    public readonly questions: Signal<Entity<TQuestion>[]>;

    /** The ID of the currently selected question (or null if none selected). */
    public readonly currentQuestionId: Signal<string | null>;

    /** The current question (or undefined if none selected). */
    public readonly currentQuestion: Signal<Entity<TQuestion> | undefined>;

    constructor(db: BaseGameDatabase<TState, TQuestion>) {
        this.state = db.state;
        this.questions = db.questions;
        this.currentQuestionId = db.currentQuestionId;
        this.currentQuestion = db.currentQuestion;
    }
}
