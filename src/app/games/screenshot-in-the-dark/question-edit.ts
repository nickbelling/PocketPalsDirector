import { Component, computed, inject, signal } from '@angular/core';
import {
    BaseQuestionEditDialog,
    CommonControllerModule,
} from '../base/controller';
import { ScreenshotInTheDarkDatabase } from './database';
import { ScreenshotInTheDarkQuestion } from './model';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './question-edit.html',
})
export class ScreenshotInTheDarkQuestionEditDialog extends BaseQuestionEditDialog<ScreenshotInTheDarkQuestion> {
    private _db: ScreenshotInTheDarkDatabase;

    protected gameId = signal<string | null>(null);
    protected guessTheGameId = signal<number>(0);
    protected progress = signal<number>(0);

    protected isValid = computed(
        () => this.gameId() !== null && this.guessTheGameId() !== 0,
    );

    constructor() {
        const db = inject(ScreenshotInTheDarkDatabase);
        super(db);
        this._db = db;
    }

    public async submit(): Promise<void> {
        this.loading.set(true);
        this.progress.set(0);

        const guessTheGameId = this.guessTheGameId();

        const question: ScreenshotInTheDarkQuestion = {
            gameId: this.gameId()!,
            guessTheGameId: guessTheGameId,
            finalIsVideo: false,
        };

        try {
            this.progress.set(10);
            await this._getAndUploadFile(guessTheGameId, 1);
            this.progress.set(20);
            await this._getAndUploadFile(guessTheGameId, 2);
            this.progress.set(30);
            await this._getAndUploadFile(guessTheGameId, 3);
            this.progress.set(40);
            await this._getAndUploadFile(guessTheGameId, 4);
            this.progress.set(50);
            await this._getAndUploadFile(guessTheGameId, 5);
            this.progress.set(60);
            const result = await this._getAndUploadFile(guessTheGameId, 6);
            question.finalIsVideo = result.isVideo;

            this.progress.set(80);
            await this.addQuestion(question);

            this.dialog.close();
        } finally {
        }

        this.loading.set(false);
        this.progress.set(0);
    }

    private async _getAndUploadFile(
        guessTheGameId: number,
        num: number,
    ): Promise<{ isVideo: boolean }> {
        const file = await this._db.getGuessTheGameImage(guessTheGameId, num);
        await this._db.uploadFile(file, `${guessTheGameId}_${num}`);

        return {
            isVideo: file.type.startsWith('video'),
        };
    }
}
