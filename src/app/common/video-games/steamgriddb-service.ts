import { HttpClient } from '@angular/common/http';
import { inject, Injectable, WritableSignal } from '@angular/core';
import { default as SGDB } from 'steamgriddb';
import { SGDB_PROXY_FUNCTION_URL } from '../firestore';
import { downloadUrlAsFile } from '../utils';
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
    thumb: string;
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
        // URL comes from Firebase proxy function, as we cannot
        // access SteamGridDB directly due to CORS
        baseURL: `${SGDB_PROXY_FUNCTION_URL}?path=`,
        // Doesn't matter what this is (proxy has our key embedded as a secret),
        // so it just needs to be set
        key: 'abc123',
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
            const logoFile = await downloadUrlAsFile(
                logo.url.toString(),
                'logo',
                true,
            );

            progress?.set(40);
            await this._videogameDatabaseService.uploadLogo(slug, logoFile);
        }

        progress?.set(60);
        if (hero) {
            const heroFile = await downloadUrlAsFile(
                hero.url.toString(),
                'hero',
                true,
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

    public async getGameLogos(sgdbGameId: number): Promise<SGDBImage[]> {
        const logos = await this._client!.getLogosById(sgdbGameId, [
            'official',
            'white',
        ]);
        return logos as unknown[] as SGDBImage[];
    }

    public async getGameHeroes(sgdbGameId: number): Promise<SGDBImage[]> {
        const heroes = await this._client!.getHeroesById(sgdbGameId);
        return heroes as unknown[] as SGDBImage[];
    }
}
