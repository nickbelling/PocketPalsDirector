import {
    computed,
    inject,
    Pipe,
    PipeTransform,
    signal,
    untracked,
} from '@angular/core';
import { Entity } from '../firestore';
import {
    VideogameDatabaseItem,
    VideogameDatabaseService,
} from './videogame-database-service';

/**
 * Given a game's slug, returns its name (and optionally its year).
 *
 * For simplicity's sake, this pipe does not require the Videogame Database's
 * games array to be passed in. However, because the games array can change over
 * time, it means this pipe cannot be pure.
 */
@Pipe({
    name: 'gameName',
    pure: false,
})
export class VideogameNamePipe implements PipeTransform {
    private readonly _vgDb = inject(VideogameDatabaseService);

    // The game's slug
    private _slug = signal('');

    // Whether or not we're including the year
    private _includeYear = signal(false);

    /** The game database object, as resolved from the VG database. */
    private readonly _game = computed<
        Entity<VideogameDatabaseItem> | undefined
    >(() => {
        const games = this._vgDb.games();
        const slug = this._slug();
        return games.find((g) => g.id === slug);
    });

    /** The current game name being returned from this pipe. */
    private readonly _gameName = computed<string>(() => {
        const game = this._game();
        const includeYear = this._includeYear();

        if (game) {
            if (includeYear && game.year) {
                return `${game.name} (${game.year})`;
            } else {
                return game.name;
            }
        } else {
            return this._slug();
        }
    });

    public transform(slug: string, includeYear: boolean = false): string {
        // This looks odd, but it's for performance's sake - basically, it
        // ensures we don't constantly search for the game and regenerate the
        // output string if we don't need to.

        // Set the slug/year signals, which kicks off the computed signals if
        // either the slug or the game list have changed
        untracked(() => {
            this._slug.set(slug);
            this._includeYear.set(includeYear);
        });

        // Assuming the _gameName changed as a result of setting the above
        // signals, return it. If it hasn't changed yet, it will on the next
        // change detection cycle.
        return this._gameName();
    }
}
