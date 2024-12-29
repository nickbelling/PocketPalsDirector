import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, inject, linkedSignal } from '@angular/core';
import { Entity } from '../../common/firestore';
import { resizeImage } from '../../common/utils';
import { BaseController, CommonControllerModule } from '../base/controller';
import { RankyPankyDatabase } from './database';
import {
    RankyPankyQuestion,
    RankyPankyQuestionItem,
    RankyPankyState,
} from './model';
import { RankyPankyQuestionEditDialog } from './question-edit';
import { RankyPankyQuestionItemsEditDialog } from './question-items-edit';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './controller.html',
})
export class RankyPankyController extends BaseController<
    RankyPankyState,
    RankyPankyQuestion
> {
    constructor() {
        super(inject(RankyPankyDatabase));
    }

    protected guessedItemOrder = linkedSignal<RankyPankyQuestionItem[]>(() => {
        const question = this.currentQuestion();
        if (question) {
            return question.items;
        } else {
            return [];
        }
    });

    public async uploadCardBack(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        const file = input.files ? input.files[0] : undefined;

        if (file) {
            const resized = await resizeImage(file, 240, 336);
            await this.uploadFile(resized, 'card-back');
        }
    }

    public async setQuestion(questionId: string | null): Promise<void> {
        const state = this.gameState();
        if (state.currentQuestion !== questionId) {
            if (
                questionId !== null &&
                !state.questionsDone.includes(questionId)
            ) {
                await this.setState({
                    questionsDone: [...state.questionsDone, questionId],
                });
            }

            await this.setState({
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
            width: '800px',
            maxWidth: '800px',
        });
    }

    public async deleteQuestionAndFiles(
        question: Entity<RankyPankyQuestion>,
    ): Promise<void> {
        this._confirm.open(
            'deleteCancel',
            'Delete question',
            `Are you sure you want to delete the question '${question.name}'?`,
            {
                onDelete: async () => {
                    // Delete all uploaded files for this question
                    question.items.forEach(async (item) => {
                        await this.deleteFile(item.uploadedFilePath, true);
                    });

                    // Delete the question
                    await this.deleteQuestion(question);
                },
            },
        );
    }

    public async revealItem(): Promise<void> {
        const revealed = this.gameState().revealedCards;
        await this.setState({
            revealedCards: revealed + 1,
        });
    }

    public async revealAnswer(): Promise<void> {
        const revealed = this.gameState().revealedAnswers;
        await this.setState({
            revealedAnswers: revealed + 1,
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

        await this.setState({
            currentGuessedOrder: newGuessedOrder,
        });
    }
}
