import { Component, inject, signal } from '@angular/core';
import { SGDBGame } from 'steamgriddb';
import { SteamGridDbService } from '../../common/video-games';
import { CommonControllerModule } from '../../games/base/controller';

@Component({
    imports: [CommonControllerModule],
    providers: [SteamGridDbService],
    templateUrl: './dashboard-games-database-add-dialog.html',
    styleUrl: './dashboard-games-database-add-dialog.scss',
})
export class DashboardGamesDatabaseAddDialog {
    private _steamGridDb = inject(SteamGridDbService);

    public loading = signal<boolean>(false);
    public searchTerm = signal<string>('');
    public searchResults = signal<SGDBGame[] | undefined>(undefined);

    public async search(): Promise<void> {
        this.loading.set(true);
        try {
            const results = await this._steamGridDb.search(this.searchTerm());
            this.searchResults.set(results);
        } finally {
            this.loading.set(false);
        }
    }

    public async register(game: SGDBGame): Promise<void> {
        this.loading.set(true);
        try {
            await this._steamGridDb.registerGame(game);
        } finally {
            this.loading.set(false);
        }
    }
}
