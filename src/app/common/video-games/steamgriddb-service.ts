import { HttpClient } from '@angular/common/http';
import { inject, Injectable, WritableSignal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { default as SGDB } from 'steamgriddb';
import { CORS_PROXY_FUNCTION_URL, SGDB_PROXY_FUNCTION_URL } from '../firestore';
import { VideogameDatabaseService } from './videogame-database-service';

export interface SGDBGame {
    id: number;
    name: string;
    release_date: number;
}

export interface SGDBImage {
    style: string;
    height: number;
    width: number;
    url: string;
}

const stylePriority: Record<string, number> = {
    official: 1,
    white: 2,
};

@Injectable()
export class SteamGridDbService {
    private _http = inject(HttpClient);
    private _videogameDatabaseService = inject(VideogameDatabaseService);
    private _client: SGDB = new SGDB({
        key: 'abc123',
        // URL comes from Firebase proxy function, as we cannot
        // access SteamGridDB directly due to CORS
        baseURL: `${SGDB_PROXY_FUNCTION_URL}?path=`,
    });

    public async search(term: string): Promise<SGDBGame[]> {
        const results = (await this._client?.searchGame(
            term,
        )) as unknown as SGDBGame[];
        return results || [];
    }

    public async registerGame(
        game: SGDBGame,
        year: number,
        progress?: WritableSignal<number>,
    ): Promise<void> {
        progress?.set(10);
        const logos = await this._client!.getLogosById(game.id, [
            'official',
            'white',
        ]);

        progress?.set(20);
        const heroes = await this._client!.getHeroesById(game.id);

        const logo: SGDBImage = (logos as unknown[] as SGDBImage[])[0];
        const hero: SGDBImage = (heroes as unknown[] as SGDBImage[])[0];

        const slug = this._videogameDatabaseService.getGameSlug(
            game.name,
            year,
        );

        progress?.set(30);
        if (logo) {
            const logoFile = await this._downloadImageAsFile(
                logo.url.toString(),
                'logo',
            );

            progress?.set(40);
            await this._videogameDatabaseService.uploadLogo(slug, logoFile);
        }

        progress?.set(60);
        if (hero) {
            const heroFile = await this._downloadImageAsFile(
                hero.url.toString(),
                'hero',
            );

            progress?.set(70);
            await this._videogameDatabaseService.uploadHero(slug, heroFile);
        }

        progress?.set(90);
        await this._videogameDatabaseService.registerGame(
            slug,
            game.name,
            year,
            game.id,
        );

        progress?.set(100);
    }

    private async _downloadImageAsFile(
        url: string,
        filename: string,
    ): Promise<File> {
        const blob = await firstValueFrom(
            this._http.get(`${CORS_PROXY_FUNCTION_URL}?url=${url}`, {
                responseType: 'blob',
            }),
        );
        return new File([blob], filename, { type: blob.type });
    }
}
