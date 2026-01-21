import { Component, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { Entity } from '../../common/firestore';
import { randomizeItems } from '../../common/utils';
import { BaseController, CommonControllerModule } from '../base/controller';
import { SwiperEliteDatabase } from './database';
import {
    SWIPER_ELITE_STATE_DEFAULT,
    SwiperEliteQuestion,
    SwiperEliteState,
} from './model';
import { SwiperEliteQuestionEditDialog } from './question-edit';

@Component({
    imports: [CommonControllerModule, MatTableModule],
    templateUrl: './controller.html',
    styleUrl: './controller.scss',
})
export class SwiperEliteController extends BaseController<
    SwiperEliteState,
    SwiperEliteQuestion
> {
    protected data: SwiperEliteDatabase;

    constructor() {
        const database = inject(SwiperEliteDatabase);
        super(database);
        this.data = database;
    }

    public async setQuestion(
        question?: Entity<SwiperEliteQuestion>,
    ): Promise<void> {
        const questionsDone = this.state().questionsDone;
        if (question) {
            await this.setState({
                currentQuestion: question.id,
                currentItems: randomizeItems(question.items),
                currentItem: 0,
                questionsDone: [...questionsDone, question.id],
            });
        } else {
            await this.setState({
                ...SWIPER_ELITE_STATE_DEFAULT,
                questionsDone,
            });
        }
    }

    public async showNextCard(): Promise<void> {
        await this.setState({
            currentItem: this.state().currentItem + 1,
        });
    }

    public addQuestion(): void {
        this.editQuestion();
    }

    public editQuestion(question?: SwiperEliteQuestion): void {
        this._dialog.open(SwiperEliteQuestionEditDialog, {
            data: question,
        });
    }
}
