import { CommonModule } from '@angular/common';
import {
    booleanAttribute,
    Component,
    computed,
    contentChild,
    inject,
    input,
    model,
    output,
    ViewContainerRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GameQuestionLike } from '../../../games/base/database';
import { ConfirmDialog, DocumentationDialog } from '../../dialog';
import { Entity } from '../../firestore';
import { QuestionEditorService } from './question-edit-service';
import { QuestionTemplateDirective } from './question-template';

/**
 * Component for sharing/simplifying the logic for selecting the current
 * question for a given game, as well as providing controls enabling CRUD
 * operations for them.
 *
 * Doesn't actually perform any actions - all logic is exposed as `output`s
 * which must be hooked in a Controller component.
 *
 * MUST contain a child
 * `<question-display *question="let question from: questions">` element that
 * defines how the question should be displayed.
 */
@Component({
    selector: 'question-selector',
    imports: [
        CommonModule,
        FormsModule,
        MatBadgeModule,
        MatButtonModule,
        MatCardModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatTooltipModule,
    ],
    templateUrl: './question-selector.html',
    styleUrl: './question-selector.scss',
})
export class QuestionSelector<TQuestion extends Entity<GameQuestionLike>> {
    private _confirm = inject(ConfirmDialog);
    private _docs = inject(DocumentationDialog);
    private _viewContainerRef = inject(ViewContainerRef);
    private _edit = inject(QuestionEditorService);

    /** The list of questions for this game. */
    public readonly questions = input.required<TQuestion[]>();

    /** The currently selected question. `undefined` if no question selected. */
    public readonly currentQuestion = model.required<TQuestion | undefined>();

    /** The Markdown documentation for this game. */
    public readonly documentation = input<string | undefined>();

    /** True if the game has editable questions. */
    public readonly canEdit = input(false, { transform: booleanAttribute });

    /** True if the game's questions can be deleted. */
    public readonly canDelete = input(true, { transform: booleanAttribute });

    /**
     * True if the game's questions can be navigated (i.e. go to next/previous
     * question). If false, the game is designed such that players pick a
     * question from a category board instead, and the director should simply
     * deselect each question when it's done.
     */
    public readonly canNavigate = input(false, { transform: booleanAttribute });

    /**
     * Fired when the "Reset game" button is clicked and the user clicked "yes"
     * in the confirmation prompt.
     */
    public readonly reset = output<void>();

    /** Fired when the "Add question" button is clicked. */
    public readonly addQuestion = output<void>();

    /** Fired when the "Edit question" button is clicked. */
    public readonly editQuestion = output<TQuestion>();

    /**
     * Fired when the "Delete question" button is clicked and the user clicked
     * "yes" in the confirmation prompt.
     */
    public readonly deleteQuestion = output<TQuestion>();

    /**
     * The child `<question-display *question="let question from: questions">`
     * element, that defines the template of how a question should be displayed.
     */
    public readonly questionTemplate = contentChild(
        QuestionTemplateDirective<TQuestion>,
    );

    /**
     * True if edit mode is enabled and the "add/edit/delete" buttons are
     * currently visible.
     */
    public readonly editModeEnabled = this._edit.editModeEnabled;

    /** The index of the current question. */
    public readonly currentQuestionIndex = computed<number>(() => {
        const questions = this.questions();
        const currentQuestion = this.currentQuestion();

        if (currentQuestion) {
            return questions.findIndex((q) => q.id === currentQuestion.id);
        } else {
            return -1;
        }
    });

    /** The number of questions remaining after the current question. */
    public readonly questionsRemaining = computed<number>(() => {
        const questions = this.questions();
        const currentQuestionIndex = this.currentQuestionIndex();
        return questions.length - (currentQuestionIndex + 1);
    });

    /**
     * A reference to the previous question. If the current question is the
     * first question, this will be `undefined`.
     */
    public readonly previousQuestion = computed<TQuestion | undefined>(() => {
        const questions = this.questions();
        const currentQuestionIndex = this.currentQuestionIndex();
        return questions[currentQuestionIndex - 1];
    });

    /**
     * A reference to the next question. If the current question is the last
     * question, this will be `undefined`.
     */
    public readonly nextQuestion = computed<TQuestion | undefined>(() => {
        const questions = this.questions();
        const currentQuestionIndex = this.currentQuestionIndex();
        return questions[currentQuestionIndex + 1];
    });

    /**
     * Fired when the user clicks the "Reset game" button. Prompts the user for
     * confirmation and then emits the relevant output event.
     */
    public onReset(): void {
        this._confirm.open(
            'yesNo',
            'Reset game',
            `Are you sure you want to reset this game? This will return the
            game to a fresh state, but won't delete any questions.`,
            {
                onYes: () => {
                    this.reset.emit();
                },
            },
        );
    }

    /**
     * Sets the current question to the question with the given ID.
     * @param questionId The ID of the question to set, or `undefined` to
     * deselect any questions.
     */
    public setQuestion(questionId: string | undefined): void {
        const questions = this.questions();
        const question = questions.find((q) => q.id === questionId);
        this.currentQuestion.set(question);
    }

    /**
     * Fired when the user clicks the "Add question" button. Emits the relevant
     * output event.
     */
    public onAddQuestion(): void {
        this.addQuestion.emit();
    }

    /**
     * Fired when the user clicks the "Edit question" button. Emits the relevant
     * output event.
     * @param question The question to edit.
     */
    public onEditQuestion(question: TQuestion): void {
        this.editQuestion.emit(question);
    }

    /**
     * Fired when the user clicks the "Delete question" button. Prompts the user
     * for confirmation and then emits the relevant output event.
     * @param question The question to delete.
     */
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

    /** Shows a popup that includes the documentation for this game. */
    public showDocs(): void {
        const docs = this.documentation();

        if (docs) {
            this._docs.open('How to play', docs);
        }
    }

    /**
     * Given a question, parses the provided question template to produce its
     * display string.
     * @param question The question to pass into the template.
     * @returns The question's display text as determined by the template.
     */
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
