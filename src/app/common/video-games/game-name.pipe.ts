import { computed, inject, Pipe, PipeTransform, Signal } from '@angular/core';
import { VideogameDatabaseService } from './videogame-database-service';

@Pipe({
    name: 'gameName',
    pure: true,
})
export class VideogameNamePipe implements PipeTransform {
    private _vgDb = inject(VideogameDatabaseService);

    public transform(slug: string): Signal<string> {
        return computed(() => {
            const games = this._vgDb.games();
            return games.find((g) => g.id === slug)?.name || slug;
        });
    }
}
