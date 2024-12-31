import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { default as SGDB, SGDBGame, SGDBImage } from 'steamgriddb';
import { CORS_PROXY_FUNCTION_URL, SGDB_PROXY_FUNCTION_URL } from '../firestore';
import { VideogameDatabaseService } from './videogame-database-service';

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
        const results = await this._client?.searchGame(term);
        return results || [];
    }

    public async registerGame(game: SGDBGame): Promise<void> {
        const logos = await this._client!.getLogosById(game.id, [
            'official',
            'white',
        ]);

        if (logos.length === 0) {
            throw new Error('No logos found');
        }

        const heroes = await this._client!.getHeroesById(game.id);

        if (heroes.length === 0) {
            throw new Error('No heroes found');
        }

        const logo: SGDBImage = logos[0];
        const hero: SGDBImage = heroes[0];

        const logoFile = await this._downloadImageAsFile(
            logo.url.toString(),
            'logo',
        );
        const heroFile = await this._downloadImageAsFile(
            hero.url.toString(),
            'hero',
        );

        await this._videogameDatabaseService.registerGame(
            game.name,
            logoFile,
            heroFile,
        );
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
