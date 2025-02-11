import { Pipe, PipeTransform } from '@angular/core';
import { Entity, resolveStorageUrl } from '../firestore';
import {
    VIDEOGAME_STORAGE_BASE,
    VideogameDatabaseItem,
} from './videogame-database-service';

/** Given a VGDB game object, resolves the URL to its public logo. */
@Pipe({
    name: 'gameLogoSrc',
    pure: true,
})
export class GameLogoSrcPipe implements PipeTransform {
    public transform(
        game: Entity<VideogameDatabaseItem>,
        isThumbnail: boolean = false,
    ): string {
        const storageUrl = `${VIDEOGAME_STORAGE_BASE}/${game.id}_logo${isThumbnail ? '_thumb' : ''}`;
        const cacheBuster = game.updatedAt
            ? `t=${game.updatedAt.toMillis()}`
            : undefined;
        return resolveStorageUrl(storageUrl, cacheBuster);
    }
}

/** Given a VGDB game object, resolves the URL to its public logo. */
@Pipe({
    name: 'gameHeroSrc',
    pure: true,
})
export class GameHeroSrcPipe implements PipeTransform {
    public transform(
        game: Entity<VideogameDatabaseItem>,
        isThumbnail: boolean = false,
    ): string {
        const storageUrl = `${VIDEOGAME_STORAGE_BASE}/${game.id}_hero${isThumbnail ? '_thumb' : ''}`;
        const cacheBuster = game.updatedAt
            ? `t=${game.updatedAt.toMillis()}`
            : undefined;
        return resolveStorageUrl(storageUrl, cacheBuster);
    }
}
