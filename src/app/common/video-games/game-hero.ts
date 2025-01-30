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
import { resolveStorageUrl } from '../firestore';
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

    public readonly gameId = input.required<string>();
    public readonly preload = input(false, { transform: booleanAttribute });
    public readonly useThumbnails = input<boolean>(false);
    public readonly loaded = signal<boolean>(false);
    public game = computed(() => {
        const games = this._vgDb.games();
        const gameId = this.gameId();

        return games.find((g) => g.id === gameId);
    });

    constructor() {
        effect(() => {
            this.loaded.set(this.heroLoaded() && this.logoLoaded());
        });
    }

    protected heroLoaded = linkedSignal<boolean>(() => {
        const game = this.gameId();
        return false;
    });

    protected logoLoaded = linkedSignal<boolean>(() => {
        const game = this.gameId();
        return false;
    });

    protected cacheBuster = computed(() => {
        const game = this.game();

        if (game && game.updatedAt) {
            return `t=${game.updatedAt.toMillis()}`;
        }

        return undefined;
    });

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

    protected logoSrc = computed(() => {
        const logoPath = this.logoPath();
        const cacheBuster = this.cacheBuster();

        if (logoPath) {
            return resolveStorageUrl(logoPath, cacheBuster);
        } else {
            return null;
        }
    });

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
