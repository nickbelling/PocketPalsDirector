import { Component, inject } from '@angular/core';
import { Entity } from '../../common/firestore';
import { BaseController, CommonControllerModule } from '../base/controller';
import { ScreenshotInTheDarkDatabase } from './database';
import { ScreenshotInTheDarkQuestion, ScreenshotInTheDarkState } from './model';
import { ScreenshotInTheDarkQuestionEditDialog } from './question-edit';
import docs from './README.md';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './controller.html',
})
export class ScreenshotInTheDarkController extends BaseController<
    ScreenshotInTheDarkState,
    ScreenshotInTheDarkQuestion
> {
    protected data: ScreenshotInTheDarkDatabase;
    protected docs = docs;

    constructor() {
        const database = inject(ScreenshotInTheDarkDatabase);
        super(database);
        this.data = database;
    }

    public addQuestion(): void {
        this._dialog.open(ScreenshotInTheDarkQuestionEditDialog);
    }

    public async setQuestion(
        question?: Entity<ScreenshotInTheDarkQuestion>,
    ): Promise<void> {
        await this.setState({
            currentQuestion: question?.id || null,
            isPlaying: false,
            isShowingAnswer: false,
        });
    }

    public async play(): Promise<void> {
        await this.setState({
            isPlaying: true,
        });
    }

    public async pause(): Promise<void> {
        await this.setState({
            isPlaying: false,
        });
    }

    public async showAnswer(): Promise<void> {
        await this.setState({
            isShowingAnswer: true,
        });
    }
}
