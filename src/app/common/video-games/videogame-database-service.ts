import { Injectable, signal } from '@angular/core';
import { CollectionReference, doc, orderBy, setDoc } from 'firebase/firestore';
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

interface VideogameDatabaseItem {
    name: string;
}

type VideogameSlugToNameMap = { [slug: string]: string };

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

    public getGameName(slug: string): string {
        return this.games().find((g) => g.id === slug)?.name || slug;
    }

    public async registerGame(
        gameName: string,
        logoImage: File,
        heroImage: File,
    ): Promise<void> {
        const slug = slugify(gameName, { lower: true });
        const gameDocRef = doc(
            this._firestore,
            `${this._gamesCollectionRef.path}/${slug}`,
        ).withConverter(this._converter);

        await setDoc(
            gameDocRef,
            {
                name: gameName,
            },
            { merge: true },
        );

        await this.uploadLogo(slug, logoImage);
        await this.uploadHero(slug, heroImage);
    }

    public async uploadLogo(gameSlug: string, image: File): Promise<void> {
        const basePath = `${VIDEOGAME_STORAGE_BASE}/${gameSlug}_logo`;
        await this._uploadImageAndThumb(basePath, image);
    }

    public async uploadHero(gameSlug: string, image: File): Promise<void> {
        const basePath = `${VIDEOGAME_STORAGE_BASE}/${gameSlug}_hero`;
        await this._uploadImageAndThumb(basePath, image);
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
