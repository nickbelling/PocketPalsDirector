import { CommonModule } from '@angular/common';
import {
    Component,
    computed,
    effect,
    inject,
    input,
    signal,
} from '@angular/core';
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

    public readonly gameId = input.required<string>();
    public readonly useThumbnails = input<boolean>(false);
    public readonly loaded = signal<boolean>(false);

    public game = computed(() => {
        const games = this._vgDb.games();
        const gameId = this.gameId();

        return games.find((g) => g.id === gameId);
    });

    protected logoSrc = signal<string | undefined>(undefined);
    protected heroSrc = signal<string | undefined>(undefined);

    constructor() {
        effect(async () => {
            const game = this.game();
            const thumbnails = this.useThumbnails();

            if (game) {
                this.loaded.set(false);
                this.logoSrc.set(undefined);
                this.heroSrc.set(undefined);

                let logoPath = `${VIDEOGAME_STORAGE_BASE}/${game.id}_logo`;
                let heroPath = `${VIDEOGAME_STORAGE_BASE}/${game.id}_hero`;

                if (thumbnails) {
                    logoPath = `${logoPath}_thumb`;
                    heroPath = `${heroPath}_thumb`;
                }

                const cacheBuster = `t=${game.updatedAt}`;

                const promises = {
                    logo: this._images
                        .preloadStorageImage(logoPath, cacheBuster)
                        .catch(() => undefined),
                    hero: this._images
                        .preloadStorageImage(heroPath, cacheBuster)
                        .catch(() => undefined),
                };

                const entries = await Promise.all(
                    Object.entries(promises).map(async ([key, promise]) => [
                        key,
                        await promise,
                    ]),
                );

                const resolved = Object.fromEntries(entries);

                this.logoSrc.set(resolved.logo);
                this.heroSrc.set(resolved.hero);

                this.loaded.set(true);
            } else {
                this.loaded.set(false);
                this.logoSrc.set(undefined);
                this.heroSrc.set(undefined);
            }
        });
    }
}
