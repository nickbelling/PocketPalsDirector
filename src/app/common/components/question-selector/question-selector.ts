import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { CommonModule } from '@angular/common';
import {
    Component,
    contentChild,
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

    public setQuestion(questionId: string | undefined): void {
        const questions = this.questions();
        const question = questions.find((q) => q.id === questionId);
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
