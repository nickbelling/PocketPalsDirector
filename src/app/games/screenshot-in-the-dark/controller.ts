import { Component, inject } from '@angular/core';
import { BaseController, CommonControllerModule } from '../base/controller';
import { ScreenshotInTheDarkDatabase } from './database';
import { ScreenshotInTheDarkQuestion, ScreenshotInTheDarkState } from './model';
import { ScreenshotInTheDarkQuestionEditDialog } from './question-edit';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './controller.html',
})
export class ScreenshotInTheDarkController extends BaseController<
    ScreenshotInTheDarkState,
    ScreenshotInTheDarkQuestion
> {
    protected data: ScreenshotInTheDarkDatabase;

    constructor() {
        const database = inject(ScreenshotInTheDarkDatabase);
        super(database);
        this.data = database;
    }

    public addQuestion(): void {
        this._dialog.open(ScreenshotInTheDarkQuestionEditDialog);
    }

    public async confirmDeleteQuestion(
        question: ScreenshotInTheDarkQuestion,
    ): Promise<void> {}

    public async setQuestion(questionId: string): Promise<void> {
        await this.setState({
            currentQuestion: questionId,
        });
    }
}
