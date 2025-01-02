import { Injectable, signal } from '@angular/core';
import {
    CollectionReference,
    deleteDoc,
    doc,
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
import { resizeImage } from '../utils';

export const VIDEOGAME_DATABASE_BASE = 'videogame-db';
export const VIDEOGAME_STORAGE_BASE = 'videogame-db';

export interface VideogameDatabaseItem {
    name: string;
    steamGridDbId: number;
    updatedAt: Timestamp | null;
}

@Injectable({
    providedIn: 'root',
})
export class VideogameDatabaseService extends BaseFirestoreDataStore {
    public games = signal<Entity<VideogameDatabaseItem>[]>([]);
    private _gamesCollectionRef: CollectionReference<VideogameDatabaseItem>;
    private _converter = getConverter<VideogameDatabaseItem>();

    constructor() {
        super();

        this._gamesCollectionRef = subscribeToCollection<VideogameDatabaseItem>(
            `/${VIDEOGAME_DATABASE_BASE}`,
            (items) => {
                const games: Entity<VideogameDatabaseItem>[] = [];

                items
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .forEach((item) => {
                        games.push(item);
                    });

                this.games.set(games);
            },
            orderBy('name'),
        );
    }

    public getGameSlug(name: string): string {
        return slugify(name, { lower: true });
    }

    public getGameName(slug: string): string {
        return this.games().find((g) => g.id === slug)?.name || slug;
    }

    public async registerGame(
        gameSlug: string,
        gameName: string,
        steamGridDbId: number,
    ): Promise<void> {
        const gameDocRef = doc(
            this._firestore,
            `${this._gamesCollectionRef.path}/${gameSlug}`,
        ).withConverter(this._converter);

        await setDoc(
            gameDocRef,
            {
                name: gameName,
                steamGridDbId: steamGridDbId,
            },
            { merge: true },
        );
    }

    public async updateRegisteredGame(gameSlug: string): Promise<void> {
        const gameDocRef = doc(
            this._firestore,
            `${this._gamesCollectionRef.path}/${gameSlug}`,
        ).withConverter(this._converter);

        await setDoc(
            gameDocRef,
            {
                updatedAt: serverTimestamp(),
            },
            { merge: true },
        );
    }

    public async uploadLogo(gameSlug: string, image: File): Promise<void> {
        const basePath = `${VIDEOGAME_STORAGE_BASE}/${gameSlug}_logo`;
        await this._uploadImageAndThumb(basePath, image);
    }

    public async uploadHero(gameSlug: string, image: File): Promise<void> {
        const basePath = `${VIDEOGAME_STORAGE_BASE}/${gameSlug}_hero`;
        await this._uploadImageAndThumb(basePath, image);
    }

    public async deleteGame(gameSlug: string): Promise<void> {
        try {
            await this.deleteFile(`${VIDEOGAME_STORAGE_BASE}/${gameSlug}_logo`);
        } catch {}
        try {
            await this.deleteFile(`${VIDEOGAME_STORAGE_BASE}/${gameSlug}_hero`);
        } catch {}
        try {
            await this.deleteFile(
                `${VIDEOGAME_STORAGE_BASE}/${gameSlug}_logo_thumb`,
            );
        } catch {}
        try {
            await this.deleteFile(
                `${VIDEOGAME_STORAGE_BASE}/${gameSlug}_hero_thumb`,
            );
        } catch {}

        const gameDocRef = doc(
            this._firestore,
            `${this._gamesCollectionRef.path}/${gameSlug}`,
        ).withConverter(this._converter);
        await deleteDoc(gameDocRef);
    }

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
