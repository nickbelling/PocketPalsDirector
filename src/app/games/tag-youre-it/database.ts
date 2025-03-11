import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Entity, STEAM_SPY_PROXY_FUNCTION_URL } from '../../common/firestore';
import { VideogameDatabaseService } from '../../common/video-games';
import { BaseGameDatabase } from '../base/database';
import {
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

    public async getSteamGameTags(steamAppId: number): Promise<Array<string>> {
        let tags;
        try {
            let json: any = await firstValueFrom(
                this._http.get(
                    `${STEAM_SPY_PROXY_FUNCTION_URL}?appId=${steamAppId}`,
                    {
                        responseType: 'json',
                    },
                ),
            );

            if (json.hasOwnProperty('tags')) {
                tags = Object.entries(json.tags)
                    .sort((a, b) => (b[1] as number) - (a[1] as number))
                    .map((tag) => tag[0]);
            }
        } catch {}

        if (tags) {
            return tags;
        } else {
            throw new Error('Could not get user tags for game.');
        }
    }
}
