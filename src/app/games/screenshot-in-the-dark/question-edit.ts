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

        const guessTheGameId = this.guessTheGameId();

        const question: ScreenshotInTheDarkQuestion = {
            gameId: this.gameId()!,
            guessTheGameId: guessTheGameId,
            finalIsVideo: false,
        };

        this.progress.start(7);

        try {
            this.progress.increment('Getting file 1...');
            await this._getAndUploadFile(guessTheGameId, 1);
            this.progress.increment('Getting file 2...');
            await this._getAndUploadFile(guessTheGameId, 2);
            this.progress.increment('Getting file 3...');
            await this._getAndUploadFile(guessTheGameId, 3);
            this.progress.increment('Getting file 4...');
            await this._getAndUploadFile(guessTheGameId, 4);
            this.progress.increment('Getting file 5...');
            await this._getAndUploadFile(guessTheGameId, 5);
            this.progress.increment('Getting file 6...');
            const result = await this._getAndUploadFile(guessTheGameId, 6);
            question.finalIsVideo = result.isVideo;

            this.progress.increment('Adding question...');
            await this.addQuestion(question);

            this.progress.finish();
            this.dialog.close();
        } catch (error) {
            this._toast.error('Failed to add the question.', error);
        }

        this.progress.reset();
        this.loading.set(false);
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
