import { CommonModule } from '@angular/common';
import {
    booleanAttribute,
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
import { CommonPipesModule } from '../pipes/pipes.module';
import {
    VIDEOGAME_STORAGE_BASE,
    VideogameDatabaseService,
} from './videogame-database-service';

@Component({
    selector: 'game-hero',
    imports: [CommonModule, CommonPipesModule],
    templateUrl: './game-hero.html',
    styleUrl: './game-hero.scss',
})
export class GameHero {
    private _vgDb = inject(VideogameDatabaseService);
    private _images = inject(ImageService);
    private _lastGameId?: string | null | undefined;
    private _lastUpdatedAt?: Timestamp | null | undefined;

    public readonly gameId = input.required<string>();
    public readonly preload = input(false, { transform: booleanAttribute });
    public readonly useThumbnails = input<boolean>(false);
    public readonly loaded = signal<boolean>(false);

    public game = computed(() => {
        const games = this._vgDb.games();
        const gameId = this.gameId();

        return games.find((g) => g.id === gameId);
    });

    protected logoBlob = linkedSignal<Blob | undefined>(
        this._resetOnGameChange.bind(this),
    );
    protected heroBlob = linkedSignal<Blob | undefined>(
        this._resetOnGameChange.bind(this),
    );
    protected logoSrc = linkedSignal<string | undefined>(
        this._resetOnGameChange.bind(this),
    );
    protected heroSrc = linkedSignal<string | undefined>(
        this._resetOnGameChange.bind(this),
    );

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

                if (typeof loadedLogo === 'string') {
                    this.logoSrc.set(loadedLogo);
                } else if (loadedLogo) {
                    this.logoBlob.set(loadedLogo);
                } else {
                    this.logoSrc.set(undefined);
                    this.logoBlob.set(undefined);
                }

                if (typeof loadedHero === 'string') {
                    this.heroSrc.set(loadedHero);
                } else if (loadedHero) {
                    this.heroBlob.set(loadedHero);
                } else {
                    this.heroSrc.set(undefined);
                    this.heroBlob.set(undefined);
                }

                this.loaded.set(true);
            } else if (!game) {
                this._lastGameId = undefined;
                this._lastUpdatedAt = undefined;
                this.logoSrc.set(undefined);
                this.heroSrc.set(undefined);
                this.loaded.set(true);
            }
            // else game "changed" but last updated not changed, so existing
            // images are good
        });
    }

    private _resetOnGameChange(): undefined {
        // Reset when game input changes
        const gameId = this.game();
        return undefined;
    }
}
