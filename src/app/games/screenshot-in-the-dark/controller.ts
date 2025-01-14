import { Component, inject } from '@angular/core';
import { Entity } from '../../common/firestore';
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
        question: Entity<ScreenshotInTheDarkQuestion>,
    ): Promise<void> {
        this._confirm.open(
            'deleteCancel',
            'Delete question',
            `Are you sure you want to delete '${question.gameId}'?`,
            {
                onDelete: async () => {
                    const guessTheGameId = question.guessTheGameId;

                    if (guessTheGameId) {
                        const baseUrl = `${guessTheGameId}_`;
                        const deletions = [
                            this.deleteFile(baseUrl + 1),
                            this.deleteFile(baseUrl + 2),
                            this.deleteFile(baseUrl + 3),
                            this.deleteFile(baseUrl + 4),
                            this.deleteFile(baseUrl + 5),
                            this.deleteFile(baseUrl + 6),
                        ];

                        await Promise.all(deletions);
                    }

                    await this.deleteQuestion(question);
                },
            },
        );
    }

    public async setQuestion(questionId: string): Promise<void> {
        await this.setState({
            currentQuestion: questionId,
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
