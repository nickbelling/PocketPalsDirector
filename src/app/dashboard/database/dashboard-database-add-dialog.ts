import {
    Component,
    computed,
    inject,
    signal,
    WritableSignal,
} from '@angular/core';
import { ToastService } from '../../common/toast';
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

    public loading = signal<boolean>(false);
    public searchTerm = signal<string>('');
    public rawResults = signal<SGDBGame[] | undefined>(undefined);

    public searchResults = computed<SearchResult[] | undefined>(() => {
        const results = this.rawResults();
        const games = this._vgDb.games();

        if (results) {
            return results.map((game) => {
                const year = new Date(game.release_date * 1000).getFullYear();
                const gameId = this._vgDb.getGameId(game.name, year);
                const gameExists = games.some((g) => g.id === gameId);

                return {
                    game: game,
                    releaseYear: year,
                    progress: signal<number>(gameExists ? 100 : 0),
                };
            });
        } else {
            return undefined;
        }
    });

    public async search(): Promise<void> {
        this.loading.set(true);
        try {
            const results = await this._steamGridDb.search(this.searchTerm());
            this.rawResults.set(results);
        } catch (error) {
            this._toast.error('Failed to search SteamGridDB.', error);
        } finally {
            this.loading.set(false);
        }
    }

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
            this._toast.error(`Failed to register ${result.game.name}.`, error);
        }
    }
}
