import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { CommonModule } from '@angular/common';
import {
    Component,
    contentChild,
    effect,
    inject,
    input,
    model,
    output,
    ViewContainerRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { GameQuestionLike } from '../../../games/base/database';
import { ConfirmDialog } from '../../dialog';
import { Entity } from '../../firestore';
import { QuestionTemplateDirective } from './question-template';

@Component({
    selector: 'question-selector',
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatSelectModule,
    ],
    templateUrl: './question-selector.html',
})
export class QuestionSelector<TQuestion extends Entity<GameQuestionLike>> {
    private _confirm = inject(ConfirmDialog);
    private _viewContainerRef = inject(ViewContainerRef);

    public readonly questions = input.required<TQuestion[]>();
    public readonly currentQuestion = model.required<TQuestion | undefined>();
    public readonly canEdit = input(false, {
        transform: coerceBooleanProperty,
    });
    public readonly canDelete = input(true, {
        transform: coerceBooleanProperty,
    });
    public readonly addQuestion = output<void>();
    public readonly editQuestion = output<TQuestion>();
    public readonly deleteQuestion = output<TQuestion>();
    public readonly questionTemplate = contentChild(
        QuestionTemplateDirective<TQuestion>,
    );

    constructor() {
        effect(() => {
            const questions = this.questions();
            console.log('questions changed:', questions);
        });

        effect(() => {
            const currentQuestion = this.currentQuestion();
            console.log('current question changed:', currentQuestion);
        });

        effect(() => {
            const currentQuestion = this.currentQuestion();

            if (currentQuestion) {
                console.log(
                    'current question in question list',
                    this.questions().includes(currentQuestion),
                );
            }
        });
    }

    public setQuestion(question: TQuestion | undefined): void {
        this.currentQuestion.set(question);
    }

    public onAddQuestion(): void {
        this.addQuestion.emit();
    }

    public onEditQuestion(question: TQuestion): void {
        this.editQuestion.emit(question);
    }

    public onDeleteQuestion(question: TQuestion): void {
        const questionDisplayText = this._getQuestionDisplayText(question);
        console.log('displaying:', questionDisplayText);

        this._confirm.open(
            'deleteCancel',
            'Delete question',
            `Are you sure you want to delete "${questionDisplayText}"?`,
            {
                onDelete: () => {
                    this.deleteQuestion.emit(question);
                },
            },
        );
    }

    private _getQuestionDisplayText<TQuestion extends Entity<object>>(
        question: TQuestion,
    ): string {
        if (!this.questionTemplate) {
            throw new Error('No template defined for questions.');
        }

        // Create an embedded view for the template
        const embeddedView = this._viewContainerRef.createEmbeddedView(
            this.questionTemplate()?.template!,
            { $implicit: question },
        );

        // Render the view and capture the text content
        embeddedView.detectChanges();
        const containerElement = embeddedView.rootNodes[0] as HTMLElement;
        const textContent = containerElement.textContent?.trim() || '';

        // Destroy the view to clean up
        embeddedView.destroy();

        return textContent;
    }
}
