import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CORS_PROXY_FUNCTION_URL, Entity } from '../../common/firestore';
import { VideogameDatabaseService } from '../../common/video-games';
import { BaseGameDatabase } from '../base/database';
import {
    SteamSpyAppResponse,
    TAG_YOURE_IT_BASE_PATH,
    TAG_YOURE_IT_STATE_DEFAULT,
    TagYoureItQuestion,
    TagYoureItState,
} from './model';

@Injectable({
    providedIn: 'root',
})
export class TagYoureItDatabase extends BaseGameDatabase<
    TagYoureItState,
    TagYoureItQuestion
> {
    private _http = inject(HttpClient);
    private _vgdb = inject(VideogameDatabaseService);

    constructor() {
        super(TAG_YOURE_IT_BASE_PATH, TAG_YOURE_IT_STATE_DEFAULT);
    }

    public override getQuestionString(
        question: Entity<TagYoureItQuestion>,
    ): string {
        return this._vgdb.getGameName(question.gameId);
    }

    public async getSteamGameTags(steamAppId: number): Promise<string[]> {
        const steamSpyUrl = `https://steamspy.com/api.php?appid=${steamAppId}&request=appdetails`;
        const encodedUrl = encodeURIComponent(steamSpyUrl);
        const corsProxyUrl = `${CORS_PROXY_FUNCTION_URL}?url=${encodedUrl}`;
        try {
            const response = await firstValueFrom(
                this._http.get<SteamSpyAppResponse>(corsProxyUrl, {
                    responseType: 'json',
                }),
            );

            const tags = Object.entries(response.tags)
                .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
                .map((pair: [string, number]) => pair[0]);

            if (tags.length) {
                return tags;
            } else {
                throw new Error(
                    `SteamSpy found no tags for "${response.name}".`,
                );
            }
        } catch (err: unknown) {
            console.error(err);
            throw new Error('Could not get user tags for game.');
        }
    }
}
