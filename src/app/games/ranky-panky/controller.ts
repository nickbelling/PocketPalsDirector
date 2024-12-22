import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, computed, inject, linkedSignal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
    resizeImage,
    SimpleDialogService,
    SimpleDialogType,
} from '../../common';
import { CommonControllerModule } from '../common-game.module';
import { Entity } from '../database';
import {
    RankyPankyDatabase,
    RankyPankyQuestion,
    RankyPankyQuestionItem,
} from './database';
import { RankyPankyQuestionEditDialog } from './question-edit';
import { RankyPankyQuestionItemsEditDialog } from './question-items-edit';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './controller.html',
})
export class RankyPankyController {
    private _db = inject(RankyPankyDatabase);
    private _dialog = inject(MatDialog);
    private _confirm = inject(SimpleDialogService);

    protected gameState = this._db.state;
    protected gameQuestions = this._db.questions;

    protected selectedQuestionId = computed(
        () => this.gameState().currentQuestion,
    );

    protected selectedQuestion = computed(() => {
        const id = this.selectedQuestionId();
        const questions = this.gameQuestions();
        return questions.find((q) => q.firebaseId === id);
    });

    protected guessedItemOrder = linkedSignal<RankyPankyQuestionItem[]>(() => {
        const question = this.selectedQuestion();
        if (question) {
            return question.items;
        } else {
            return [];
        }
    });

    public async reset(): Promise<void> {
        await this._confirm.open(
            SimpleDialogType.YesNo,
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

    public async uploadCardBack(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        const file = input.files ? input.files[0] : undefined;

        if (file) {
            const resized = await resizeImage(file, 240, 336);
            await this._db.uploadFile(resized, 'card-back');
        }
    }

    public async setQuestion(questionId: string | null): Promise<void> {
        const state = this.gameState();
        if (state.currentQuestion !== questionId) {
            if (
                questionId !== null &&
                !state.questionsDone.includes(questionId)
            ) {
                await this._db.setState({
                    questionsDone: [...state.questionsDone, questionId],
                });
            }

            await this._db.setState({
                currentQuestion: questionId,
                revealedCards: 0,
                currentGuessedOrder: [],
                revealedAnswers: 0,
            });
        }
    }

    public addQuestion(): void {
        this.editQuestion();
    }

    public editQuestion(question?: Entity<RankyPankyQuestion>): void {
        this._dialog.open(RankyPankyQuestionEditDialog, {
            data: question,
        });
    }

    public editQuestionItems(question?: Entity<RankyPankyQuestion>): void {
        this._dialog.open(RankyPankyQuestionItemsEditDialog, {
            data: question,
            minWidth: '800px',
        });
    }

    public async deleteQuestion(
        question: Entity<RankyPankyQuestion>,
    ): Promise<void> {
        this._confirm.open(
            SimpleDialogType.DeleteCancel,
            'Delete question',
            `Are you sure you want to delete the question '${question.name}'?`,
            {
                onDelete: async () => {
                    // Delete all uploaded files for this question
                    question.items.forEach(async (item) => {
                        await this._db.deleteFile(item.uploadedFilePath, true);
                    });

                    // Delete the question
                    await this._db.deleteQuestion(question);
                },
            },
        );
    }

    public async revealItem(): Promise<void> {
        const revealed = this.gameState().revealedCards;
        await this._db.setState({
            revealedCards: revealed + 1,
        });
    }

    public async reorder(
        event: CdkDragDrop<RankyPankyQuestionItem>,
    ): Promise<void> {
        this.guessedItemOrder.update((items) => {
            moveItemInArray(items, event.previousIndex, event.currentIndex);
            return [...items];
        });

        const newGuessedOrder = this.guessedItemOrder().map((i) => i.index);

        await this._db.setState({
            currentGuessedOrder: newGuessedOrder,
        });
    }
}
