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

    private readonly _gameName = computed(() => {
        const games = this._vgDb.games();
        const slug = this._slug();

        const name = games.find((g) => g.id === slug)?.name || slug;
        return name;
    });

    public transform(slug: string): string {
        // Set the slug signal, which kicks off the computed _gameName signal if
        // either the slug or the game list have changed
        untracked(() => {
            this._slug.set(slug);
        });

        // Return the current result of the computed _gameName signal
        return this._gameName();
    }
}
