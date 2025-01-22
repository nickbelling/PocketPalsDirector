import {
    computed,
    inject,
    Pipe,
    PipeTransform,
    signal,
    untracked,
} from '@angular/core';
import { VideogameDatabaseService } from './videogame-database-service';

@Pipe({
    name: 'gameName',
    pure: false,
})
export class VideogameNamePipe implements PipeTransform {
    private readonly _vgDb = inject(VideogameDatabaseService);
    private _slug = signal('');

    private readonly _game = computed(() => {
        const games = this._vgDb.games();
        const slug = this._slug();
        return games.find((g) => g.id === slug);
    });

    public transform(slug: string, includeYear: boolean = false): string {
        // Set the slug signal, which kicks off the computed _gameName signal if
        // either the slug or the game list have changed
        untracked(() => {
            this._slug.set(slug);
        });

        const game = this._game();

        if (game) {
            if (includeYear && game.year) {
                return `${game.name} (${game.year})`;
            } else {
                return game.name;
            }
        } else {
            return slug;
        }
    }
}
