import { inject, Pipe, PipeTransform } from '@angular/core';
import { Entity, FirebaseUploadedFileUrlPipe } from '../firestore';
import {
    VIDEOGAME_STORAGE_BASE,
    VideogameDatabaseItem,
} from './videogame-database-service';

@Pipe({
    name: 'gameLogoSrc',
    pure: true,
})
export class GameLogoSrcPipe implements PipeTransform {
    private _uploadedFileUrlPipe = inject(FirebaseUploadedFileUrlPipe);

    public async transform(
        game: Entity<VideogameDatabaseItem>,
        isThumbnail: boolean = false,
    ): Promise<string | null> {
        const storageUrl =
            VIDEOGAME_STORAGE_BASE +
            '/' +
            game.id +
            `_logo${isThumbnail ? '_thumb' : ''}`;
        const downloadUrl =
            await this._uploadedFileUrlPipe.transform(storageUrl);

        if (downloadUrl) {
            return `${downloadUrl}?t=${game.updatedAt}`;
        } else {
            return null;
        }
    }
}

@Pipe({
    name: 'gameHeroSrc',
    pure: true,
})
export class GameHeroSrcPipe implements PipeTransform {
    private _uploadedFileUrlPipe = inject(FirebaseUploadedFileUrlPipe);

    public async transform(
        game: Entity<VideogameDatabaseItem>,
        isThumbnail: boolean = false,
    ): Promise<string | null> {
        const storageUrl =
            VIDEOGAME_STORAGE_BASE +
            '/' +
            game.id +
            `_hero${isThumbnail ? '_thumb' : ''}`;
        const downloadUrl =
            await this._uploadedFileUrlPipe.transform(storageUrl);

        if (downloadUrl) {
            return `${downloadUrl}?t=${game.updatedAt}`;
        } else {
            return null;
        }
    }
}
