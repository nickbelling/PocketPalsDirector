import {
    Component,
    inject,
    resource,
    signal,
    WritableSignal,
} from '@angular/core';
import { ToastService } from '../../common/toast';
import { isNotEmpty } from '../../common/utils';
import {
    SGDBGame,
    SteamGridDbService,
    VideogameDatabaseService,
} from '../../common/video-games';
import { CommonControllerModule } from '../../games/base/controller';

interface SearchResult {
    game: SGDBGame;
    releaseYear: number;
    progress: WritableSignal<number>;
}

/** The Videogame Database "Add Game" dialog. */
@Component({
    imports: [CommonControllerModule],
    providers: [SteamGridDbService],
    templateUrl: './dashboard-database-add-dialog.html',
    styleUrl: './dashboard-database-add-dialog.scss',
})
export class DashboardGamesDatabaseAddDialog {
    private _steamGridDb = inject(SteamGridDbService);
    private _vgDb = inject(VideogameDatabaseService);
    private _toast = inject(ToastService);

    /** The current SGDB search term. */
    public searchTerm = signal<string>('');

    /** The results of searching for the given SGDB search term. */
    public searchResults = resource({
        request: () => {
            return { searchTerm: this.searchTerm(), games: this._vgDb.games() };
        },
        loader: async (params) => {
            const searchTerm = params.request.searchTerm;
            const games = params.request.games;

            if (isNotEmpty(searchTerm)) {
                const results = await this._steamGridDb.search(searchTerm);

                return results.map((game) => {
                    // SGDB game release_date field is num seconds since epoch,
                    // multiply by 1000 to get milliseconds for JS Date
                    const releaseDate = Number.isNaN(game.release_date)
                        ? 0
                        : game.release_date * 1000;
                    const releaseYear =
                        releaseDate !== 0
                            ? new Date(releaseDate).getFullYear()
                            : 0;

                    const gameId = this._vgDb.getGameId(game.name, releaseYear);
                    const gameExists = games.some((g) => g.id === gameId);

                    return {
                        game: game,
                        releaseYear: releaseYear,
                        progress: signal<number>(gameExists ? 100 : 0),
                    };
                });
            } else {
                return [];
            }
        },
    });

    /**
     * Registers the given search result with the Videogame Database. Downloads
     * all of the given game's images, uploads them to Storage, and adds the
     * game to the Firestore Collection.
     *
     * Reports the current progress via the given SearchResult's "progress"
     * Signal, so that it can be shown in the UI.
     */
    public async register(result: SearchResult): Promise<void> {
        try {
            await this._steamGridDb.registerGame(
                result.game,
                result.releaseYear,
                result.progress,
            );
            this._toast.info(
                `Successfully registered ${result.game.name} (${result.releaseYear}).`,
            );
        } catch (error) {
            result.progress.set(0);
            this._toast.error(`Failed to register ${result.game.name}.`, error);
        }
    }
}
