import { CommonModule } from '@angular/common';
import {
    Component,
    computed,
    effect,
    inject,
    input,
    linkedSignal,
    signal,
} from '@angular/core';
import { Timestamp } from 'firebase/firestore';
import { ImageService } from '../files';
import {
    VIDEOGAME_STORAGE_BASE,
    VideogameDatabaseService,
} from './videogame-database-service';

@Component({
    selector: 'game-hero',
    imports: [CommonModule],
    templateUrl: './game-hero.html',
    styleUrl: './game-hero.scss',
})
export class GameHero {
    private _vgDb = inject(VideogameDatabaseService);
    private _images = inject(ImageService);
    private _lastGameId?: string | null | undefined;
    private _lastUpdatedAt?: Timestamp | null | undefined;

    public readonly gameId = input.required<string>();
    public readonly preload = input<boolean>(false);
    public readonly useThumbnails = input<boolean>(false);
    public readonly loaded = signal<boolean>(false);

    public game = computed(() => {
        const games = this._vgDb.games();
        const gameId = this.gameId();

        return games.find((g) => g.id === gameId);
    });

    protected logoSrc = linkedSignal<string | undefined>(() => {
        // Reset when game input changes
        const gameId = this.game();
        return undefined;
    });

    protected heroSrc = linkedSignal<string | undefined>(() => {
        // Reset when game input changes
        const gameId = this.game();
        return undefined;
    });

    constructor() {
        effect(async () => {
            const game = this.game();
            const thumbnails = this.useThumbnails();

            if (
                game &&
                (this._lastGameId !== game.id ||
                    this._lastUpdatedAt !== game.updatedAt ||
                    this._lastUpdatedAt !== null)
            ) {
                this._lastGameId = game.id;
                this._lastUpdatedAt = game.updatedAt || null;
                const cacheBuster = `t=${game.updatedAt}`;

                this.loaded.set(false);

                let logoPath = `${VIDEOGAME_STORAGE_BASE}/${game.id}_logo`;
                let heroPath = `${VIDEOGAME_STORAGE_BASE}/${game.id}_hero`;

                if (thumbnails) {
                    logoPath = `${logoPath}_thumb`;
                    heroPath = `${heroPath}_thumb`;
                }

                const logoPromise = this.preload()
                    ? this._images.preloadStorageImage(logoPath, cacheBuster)
                    : this._images.getDownloadUrl(logoPath, cacheBuster);
                const heroPromise = this.preload()
                    ? this._images.preloadStorageImage(heroPath, cacheBuster)
                    : this._images.getDownloadUrl(heroPath, cacheBuster);

                const [loadedLogo, loadedHero] = await Promise.all([
                    logoPromise.catch(() => undefined),
                    heroPromise.catch(() => undefined),
                ]);

                this.logoSrc.set(loadedLogo);
                this.heroSrc.set(loadedHero);

                this.loaded.set(true);
            } else if (!game) {
                this.loaded.set(false);
                this._lastGameId = undefined;
                this._lastUpdatedAt = undefined;
                this.logoSrc.set(undefined);
                this.heroSrc.set(undefined);
            }
            // else game "changed" but last updated not changed, so existing
            // images are good
        });
    }
}
