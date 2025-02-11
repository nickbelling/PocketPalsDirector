import { inject, Injectable, WritableSignal } from '@angular/core';
import { default as SGDB } from 'steamgriddb';
import { SGDB_PROXY_FUNCTION_URL } from '../firestore';
import { downloadUrlAsFile } from '../utils';
import { VideogameDatabaseService } from './videogame-database-service';

// We have to redefine some of the SGDB interfaces as it seems the API has
// changed from the SDK we use.

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

/**
 * A data service used for interacting with SteamGridDB. Responsible for
 * fetching game logo and hero images, as well as listing games that can be
 * potentially added to our Videogame Database.
 */
@Injectable()
export class SteamGridDbService {
    private _videogameDatabaseService = inject(VideogameDatabaseService);

    /**
     * The API client used to interact with SGDB. Because we can't keep the API
     * key in this client-side app, we have a Firebase Function that acts as a
     * proxy to it (and appends the API key to its requests).
     */
    private _client: SGDB = new SGDB({
        // URL comes from Firebase proxy function, as we cannot
        // access SteamGridDB directly due to CORS
        baseURL: `${SGDB_PROXY_FUNCTION_URL}?path=`,
        // Doesn't matter what this is (proxy has our key embedded as a secret),
        // so it just needs to be set
        key: 'abc123',
    });

    /** Searches SGDB for games matching the given query string. */
    public async search(term: string): Promise<SGDBGame[]> {
        const results = (await this._client?.searchGame(
            term,
        )) as unknown as SGDBGame[];
        return results || [];
    }

    /**
     * Registers a SGDB game with our Videogame Database.
     * @param game The game's record as it was found in SGDB.
     * @param year The year of the game's release.
     * @param progress A callback signal for setting its registration progress.
     */
    public async registerGame(
        game: SGDBGame,
        year: number,
        progress?: WritableSignal<number>,
    ): Promise<void> {
        // Search for logo images for this game
        progress?.set(10);
        const logos = await this._client!.getLogosById(game.id, [
            'official',
            'white',
        ]);

        // Search for hero images for this game
        progress?.set(20);
        const heroes = await this._client!.getHeroesById(game.id);

        // Get the first of each
        const logo: SGDBImage = (logos as unknown[] as SGDBImage[])[0];
        const hero: SGDBImage = (heroes as unknown[] as SGDBImage[])[0];

        // Determine the game's ID as a slug. We concatenate the year because
        // of an annoying trend where games are rebooted using the exact same
        // name yet have entirely different logo images (looking at you, Tomb
        // Raider 1996 and Tomb Raider 2013)
        const slug = this._videogameDatabaseService.getGameId(game.name, year);

        progress?.set(30);
        if (logo) {
            // Download the logo image we found
            const logoFile = await downloadUrlAsFile(
                logo.url.toString(),
                'logo',
                true,
            );

            // Upload it to our Firestore Storage
            progress?.set(40);
            await this._videogameDatabaseService.uploadLogo(slug, logoFile);
        }

        progress?.set(60);
        if (hero) {
            // Download the hero image we found
            const heroFile = await downloadUrlAsFile(
                hero.url.toString(),
                'hero',
                true,
            );

            // Upload it to our Firestore Storage
            progress?.set(70);
            await this._videogameDatabaseService.uploadHero(slug, heroFile);
        }

        // Finally, register the game record
        progress?.set(90);
        await this._videogameDatabaseService.registerGame(
            slug,
            game.name,
            year,
            game.id,
        );

        progress?.set(100);
    }

    /**
     * Gets all available game logos for the game with the given SteamGridDB ID.
     * @param sgdbGameId The SteamGridDB ID of the game.
     * @returns A list of image records.
     */
    public async getGameLogos(sgdbGameId: number): Promise<SGDBImage[]> {
        const logos = await this._client!.getLogosById(sgdbGameId, [
            'official',
            'white',
        ]);
        return logos as unknown[] as SGDBImage[];
    }

    /**
     * Gets all available game heroes for the game with the given SteamGridDB ID.
     * @param sgdbGameId The SteamGridDB ID of the game.
     * @returns A list of image records.
     */
    public async getGameHeroes(sgdbGameId: number): Promise<SGDBImage[]> {
        const heroes = await this._client!.getHeroesById(sgdbGameId);
        return heroes as unknown[] as SGDBImage[];
    }
}
