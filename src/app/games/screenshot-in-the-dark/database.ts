import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CORS_PROXY_FUNCTION_URL, Entity } from '../../common/firestore';
import { VideogameDatabaseService } from '../../common/video-games';
import { BaseGameDatabase } from '../base/database';
import {
    SCREENSHOT_IN_THE_DARK_BASE_PATH,
    SCREENSHOT_IN_THE_DARK_STATE_DEFAULT,
    ScreenshotInTheDarkQuestion,
    ScreenshotInTheDarkState,
} from './model';

@Injectable({
    providedIn: 'root',
})
export class ScreenshotInTheDarkDatabase extends BaseGameDatabase<
    ScreenshotInTheDarkState,
    ScreenshotInTheDarkQuestion
> {
    private _http = inject(HttpClient);
    private _vgdb = inject(VideogameDatabaseService);

    constructor() {
        super(
            SCREENSHOT_IN_THE_DARK_BASE_PATH,
            SCREENSHOT_IN_THE_DARK_STATE_DEFAULT,
        );
    }

    public override getQuestionString(
        question: Entity<ScreenshotInTheDarkQuestion>,
    ): string {
        return this._vgdb.getGameName(question.gameId);
    }

    protected override async afterDeleteQuestion(
        question: Entity<ScreenshotInTheDarkQuestion>,
    ): Promise<void> {
        const guessTheGameId = question.guessTheGameId;

        if (guessTheGameId) {
            const baseUrl = `${guessTheGameId}_`;
            const deletions = [
                this.deleteFile(baseUrl + 1, false),
                this.deleteFile(baseUrl + 2, false),
                this.deleteFile(baseUrl + 3, false),
                this.deleteFile(baseUrl + 4, false),
                this.deleteFile(baseUrl + 5, false),
                this.deleteFile(baseUrl + 6, false),
            ];

            await Promise.all(deletions);
        }
    }

    public async getGuessTheGameImage(
        guessTheGameId: number,
        screenshotNumber: number,
    ): Promise<File> {
        let blob;
        try {
            const url = `https://guessthe.game/games/${guessTheGameId}/${screenshotNumber}.webp`;
            // Try and get a .webp
            blob = await firstValueFrom(
                this._http.get(
                    `${CORS_PROXY_FUNCTION_URL}?url=${encodeURI(url)}`,
                    {
                        responseType: 'blob',
                    },
                ),
            );

            if (blob.type !== 'image/webp') {
                const url = `https://guessthe.game/games/${guessTheGameId}/video/${screenshotNumber}.webm`;
                // If that failed, try and get a .webm instead
                blob = await firstValueFrom(
                    this._http.get(
                        `${CORS_PROXY_FUNCTION_URL}?url=${encodeURI(url)}`,
                        {
                            responseType: 'blob',
                        },
                    ),
                );
            }
        } catch {}

        if (blob) {
            return new File([blob], `${screenshotNumber}`, { type: blob.type });
        } else {
            throw new Error('Could not download file.');
        }
    }
}
