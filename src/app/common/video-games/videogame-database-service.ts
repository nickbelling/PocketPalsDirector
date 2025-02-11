import { Injectable, signal } from '@angular/core';
import {
    CollectionReference,
    deleteDoc,
    doc,
    DocumentReference,
    orderBy,
    serverTimestamp,
    setDoc,
    Timestamp,
} from 'firebase/firestore';
import { default as slugify } from 'slugify';
import {
    BaseFirestoreDataStore,
    Entity,
    getConverter,
    subscribeToCollection,
} from '../firestore';
import { normalizeTitle, resizeImage } from '../utils';

export const VIDEOGAME_DATABASE_BASE = 'videogame-db';
export const VIDEOGAME_STORAGE_BASE = 'videogame-db';

export interface VideogameDatabaseItem {
    name: string;
    steamGridDbId: number;
    year: number;
    updatedAt: Timestamp | null;
}

/**
 * The Pocket Pals Videogame Database service, a repository of registered
 * videogames and functions for accessing their game logo and hero images that
 * are uploaded to Firestore Storage.
 *
 * Each game is registered with its ID as the game's slug and its release year
 * appended, so the VGDB ID for "The Legend of Zelda: Ocarina of Time" is
 * `the-legend-of-zelda:-ocarina-of-time-1998`. Its canon name and release date
 * is stored in Firestore, and its images are stored in Storage as
 * `{gameId}_logo`, `{gameId}_hero`, `{gameId}_logo_thumb` and
 * `{gameId}_hero_thumb`.
 */
@Injectable({
    providedIn: 'root',
})
export class VideogameDatabaseService extends BaseFirestoreDataStore {
    /**
     * The Firestore collection reference to the complete list of registered
     * videogames.
     */
    private _gamesCollectionRef: CollectionReference<VideogameDatabaseItem>;

    /** Firestore entity converter. */
    private _converter = getConverter<VideogameDatabaseItem>();

    /** The list of videogames registered in the VGDB. */
    public games = signal<Entity<VideogameDatabaseItem>[]>([]);

    constructor() {
        super();

        // Subscribe to the collection of videogames in Firestore and update the
        // signal as they change.
        this._gamesCollectionRef = subscribeToCollection<VideogameDatabaseItem>(
            `/${VIDEOGAME_DATABASE_BASE}`,
            (items) => {
                const games: Entity<VideogameDatabaseItem>[] = [];

                items
                    .sort((a, b) =>
                        normalizeTitle(a.name).localeCompare(
                            normalizeTitle(b.name),
                        ),
                    )
                    .forEach((item) => {
                        games.push(item);
                    });

                this.games.set(games);
            },
            orderBy('name'),
        );
    }

    /**
     * For the given game's VGDB ID, returns its name. If not found, returns the
     * provided ID.
     */
    public getGameName(vgdbId: string): string {
        return this.games().find((g) => g.id === vgdbId)?.name || vgdbId;
    }

    /**
     * A single source of truth for creating a game's VGDB ID from its game name
     * and release year.
     */
    public getGameId(name: string, releaseYear: number): string {
        return `${slugify(name, { lower: true })}-${releaseYear}`;
    }

    /**
     * Registers a game in the Videogame Database.
     * @param gameId The game's VGDB ID.
     * @param gameName The game's official name.
     * @param gameReleaseYear The game's release year.
     * @param steamGridDbId The game's ID in SteamGridDB. Used for further
     * fetching of images in case they need replacement.
     */
    public async registerGame(
        gameId: string,
        gameName: string,
        gameReleaseYear: number,
        steamGridDbId: number,
    ): Promise<void> {
        const gameDocRef = doc(
            this._firestore,
            `${this._gamesCollectionRef.path}/${gameId}`,
        ).withConverter(this._converter);

        await setDoc(
            gameDocRef,
            {
                name: gameName,
                steamGridDbId: steamGridDbId,
                year: gameReleaseYear,
                updatedAt: serverTimestamp(),
            },
            { merge: true },
        );
    }

    /**
     * Marks the "updated" time of the game. When game images are replaced with
     * new ones, this is required as the game's "updated" time is used as a
     * cache buster to force a reload (otherwise the images will not update if
     * the browser has seen them before).
     */
    public async markGameAsUpdated(gameId: string): Promise<void> {
        const gameDocRef = this._getGameDocRef(gameId);

        await setDoc(
            gameDocRef,
            {
                updatedAt: serverTimestamp(),
            },
            { merge: true },
        );
    }

    /** Uploads the given image as the given game's logo. */
    public async uploadLogo(gameId: string, image: File): Promise<void> {
        const basePath = `${VIDEOGAME_STORAGE_BASE}/${gameId}_logo`;
        await this._uploadImageAndThumb(basePath, image);
    }

    /** Uploads the given image as the given game's hero. */
    public async uploadHero(gameId: string, image: File): Promise<void> {
        const basePath = `${VIDEOGAME_STORAGE_BASE}/${gameId}_hero`;
        await this._uploadImageAndThumb(basePath, image);
    }

    /**
     * Deletes a game and its images from the Videogame Database.
     * @param gameId The VGDB ID of the game to delete.
     */
    public async deleteGame(gameId: string): Promise<void> {
        // Delete the images first, allowing silent failure
        try {
            await this.deleteFile(`${VIDEOGAME_STORAGE_BASE}/${gameId}_logo`);
        } catch {}
        try {
            await this.deleteFile(`${VIDEOGAME_STORAGE_BASE}/${gameId}_hero`);
        } catch {}
        try {
            await this.deleteFile(
                `${VIDEOGAME_STORAGE_BASE}/${gameId}_logo_thumb`,
            );
        } catch {}
        try {
            await this.deleteFile(
                `${VIDEOGAME_STORAGE_BASE}/${gameId}_hero_thumb`,
            );
        } catch {}

        // Finally, delete the game record
        const gameDocRef = this._getGameDocRef(gameId);
        await deleteDoc(gameDocRef);
    }

    /** Gets the Firestore DocumentReference for the given game. */
    private _getGameDocRef(gameId: string): DocumentReference {
        return doc(
            this._firestore,
            `${this._gamesCollectionRef.path}/${gameId}`,
        ).withConverter(this._converter);
    }

    /**
     * Uploads an image to the given path, scaling it to be no larger than
     * 1000x800, then creates a thumbnail version at no larger than 300x240 and
     * uploads that too.
     * @param path The path to upload the main image to.
     * @param image The image file to upload.
     */
    private async _uploadImageAndThumb(
        path: string,
        image: File,
    ): Promise<void> {
        // Resize and upload main image
        const resizedImage = await resizeImage(image, 1000, 800);
        await this.uploadFile(resizedImage, path);

        // Resize and upload thumbnail
        const thumbnailImage = await resizeImage(image, 300, 240);
        await this.uploadFile(thumbnailImage, `${path}_thumb`);
    }
}
