import { Signal } from '@angular/core';
import { Entity } from '../../common/firestore';
import {
    BaseGameDatabase,
    GameQuestionLike,
    GameStateLike,
} from './base-database';

export abstract class BaseGame<
    TState extends GameStateLike,
    TQuestion extends GameQuestionLike,
> {
    public readonly gameState: Signal<TState>;
    public readonly gameQuestions: Signal<Entity<TQuestion>[]>;
    public readonly currentQuestionId: Signal<string | null>;
    public readonly currentQuestion: Signal<Entity<TQuestion> | undefined>;

    constructor(db: BaseGameDatabase<TState, TQuestion>) {
        this.gameState = db.state;
        this.gameQuestions = db.questions;
        this.currentQuestionId = db.currentQuestionId;
        this.currentQuestion = db.currentQuestion;
    }
}
