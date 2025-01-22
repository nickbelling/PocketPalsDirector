import { Directive, inject, input, TemplateRef } from '@angular/core';
import { GameQuestionLike } from '../../../games/base/database';
import { Entity } from '../../firestore';

export type QuestionContext<TQuestion extends Entity<GameQuestionLike>> = {
    $implicit: TQuestion;
};

@Directive({
    selector: '[question]',
    standalone: true,
})
export class QuestionTemplateDirective<
    TQuestion extends Entity<GameQuestionLike>,
> {
    public readonly template = inject(TemplateRef<QuestionContext<TQuestion>>);
    public readonly questionFrom = input.required<TQuestion[]>();

    static ngTemplateContextGuard<T extends Entity<GameQuestionLike>>(
        _: QuestionTemplateDirective<T>,
        context: unknown,
    ): context is QuestionContext<T> {
        return true;
    }
}
