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
import { resolveStorageUrl } from '../firestore';
import { CommonPipesModule } from '../pipes/pipes.module';
import {
    VIDEOGAME_STORAGE_BASE,
    VideogameDatabaseService,
} from './videogame-database-service';

/**
 * Shows the given game's logo in front of a blurred version of its hero image
 * as a background. Scales the logo to always fit 80% of its container in any
 * direction, with the hero background always filling it.
 *
 * The "loaded" signal becomes true when both the logo and hero have finished
 * loading.
 */
@Component({
    selector: 'game-hero',
    imports: [CommonModule, CommonPipesModule],
    templateUrl: './game-hero.html',
    styleUrl: './game-hero.scss',
})
export class GameHero {
    private _vgDb = inject(VideogameDatabaseService);

    /** The game's ID, as it was registered in the Videogame Database. */
    public readonly gameId = input.required<string>();

    /**
     * Set to true to load thumbnail versions of the images (max 300px) instead
     * of the full-sized ones.
     */
    public readonly useThumbnails = input<boolean>(false);

    public readonly align = input<'center' | 'top' | 'bottom'>('center');

    /**
     * Becomes true when the logo and hero images have fully loaded (or errored).
     */
    public readonly loaded = signal<boolean>(false);

    /** The game's registered record in the Videogame Database. */
    public game = computed(() => {
        const games = this._vgDb.games();
        const gameId = this.gameId();

        return games.find((g) => g.id === gameId);
    });

    constructor() {
        effect(() => {
            this.loaded.set(this.logoLoaded() && this.heroLoaded());
        });
    }

    /** True if the logo image is loaded. */
    protected logoLoaded = linkedSignal<boolean>(() => {
        // Reset to false whenever the game changes
        const game = this.gameId();
        return false;
    });

    /** True if the hero image is loaded. */
    protected heroLoaded = linkedSignal<boolean>(() => {
        // Reset to false whenever the game changes
        const game = this.gameId();
        return false;
    });

    /**
     * The cacheBuster used to enforce fetching new images if they have changed.
     * Prevents the browser from using stale images if they are replaced later.
     */
    protected cacheBuster = computed(() => {
        const game = this.game();

        if (game && game.updatedAt) {
            return `t=${game.updatedAt.toMillis()}`;
        }

        return undefined;
    });

    /** The path in Firebase storage to the game's logo image. */
    protected logoPath = computed(() => {
        const game = this.game();
        const thumbnails = this.useThumbnails();

        if (game) {
            let logoPath = `${VIDEOGAME_STORAGE_BASE}/${game.id}_logo`;

            if (thumbnails) {
                logoPath = `${logoPath}_thumb`;
            }

            return logoPath;
        } else {
            return null;
        }
    });

    /** The path in Firebase storage to the game's hero image. */
    protected heroPath = computed(() => {
        const game = this.game();
        const thumbnails = this.useThumbnails();

        if (game) {
            let heroPath = `${VIDEOGAME_STORAGE_BASE}/${game.id}_hero`;

            if (thumbnails) {
                heroPath = `${heroPath}_thumb`;
            }

            return heroPath;
        } else {
            return null;
        }
    });

    /** The resolved URL to the public logo image. */
    protected logoSrc = computed(() => {
        const logoPath = this.logoPath();
        const cacheBuster = this.cacheBuster();

        if (logoPath) {
            return resolveStorageUrl(logoPath, cacheBuster);
        } else {
            return null;
        }
    });

    /** The resolved URL to the public hero image. */
    protected heroSrc = computed(() => {
        const heroPath = this.heroPath();
        const cacheBuster = this.cacheBuster();

        if (heroPath) {
            return resolveStorageUrl(heroPath, cacheBuster);
        } else {
            return null;
        }
    });
}
