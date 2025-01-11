import { Signal } from '@angular/core';
import { Entity } from '../../../common/firestore';
import {
    BaseGameDatabase,
    GameQuestionLike,
    GameStateLike,
} from '../database/base-database';

export abstract class BaseGame<
    TState extends GameStateLike,
    TQuestion extends GameQuestionLike,
> {
    public readonly state: Signal<TState>;
    public readonly questions: Signal<Entity<TQuestion>[]>;
    public readonly currentQuestionId: Signal<string | null>;
    public readonly currentQuestion: Signal<Entity<TQuestion> | undefined>;

    constructor(db: BaseGameDatabase<TState, TQuestion>) {
        this.state = db.state;
        this.questions = db.questions;
        this.currentQuestionId = db.currentQuestionId;
        this.currentQuestion = db.currentQuestion;
    }
}
