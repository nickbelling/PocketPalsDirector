import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, inject, linkedSignal } from '@angular/core';
import { Entity } from '../../common/firestore';
import { randomizeItems } from '../../common/utils';
import { BaseController, CommonControllerModule } from '../base/controller';
import { OrderUpDatabase } from './database';
import { OrderUpQuestion, OrderUpQuestionItem, OrderUpState } from './model';
import { OrderUpQuestionEditDialog } from './question-edit';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './controller.html',
})
export class OrderUpController extends BaseController<
    OrderUpState,
    OrderUpQuestion
> {
    protected data = inject(OrderUpDatabase);

    protected nextItemPosition = linkedSignal(() => {
        this.sortedRevealedItems().length;
    });
    protected sortedRevealedItems = this.data.sortedRevealedItems;
    protected sortedRevealedIndexes = this.data.sortedRevealedIndexes;
    protected displayedItems = this.data.displayedItems;

    constructor() {
        const database = inject(OrderUpDatabase);
        super(database);
        this.data = database;
    }

    public async setQuestion(
        question?: Entity<OrderUpQuestion>,
    ): Promise<void> {
        const state = this.state();
        const questionsDone = [...state.questionsDone];

        if (question && !state.questionsDone.includes(question.id)) {
            questionsDone.push(question.id);

            await this.setState({
                questionsDone: questionsDone,
            });
        }

        const sortedIndexes = question?.items.map((i) => i.order) || [];
        const randomizedIndexes = randomizeItems(sortedIndexes);

        await this.setState({
            currentQuestion: question?.id || null,
            currentQuestionRevealOrder: randomizedIndexes,
            revealedCount: 1,
        });
    }

    public addQuestion(): void {
        this.editQuestion();
    }

    public editQuestion(question?: Entity<OrderUpQuestion>): void {
        this._dialog.open(OrderUpQuestionEditDialog, {
            data: question,
            width: '800px',
            maxWidth: '800px',
            height: '700px',
            maxHeight: '700px',
        });
    }

    public async reorder(
        $event: CdkDragDrop<OrderUpQuestionItem>,
    ): Promise<void> {
        await this.setState({
            currentPosition: $event.currentIndex,
        });
    }

    public async addNextItem(): Promise<void> {
        const state = this.state();
        await this.setState({
            revealedCount: state.revealedCount + 1,
            currentPosition: state.revealedCount + 1,
        });
    }
}
