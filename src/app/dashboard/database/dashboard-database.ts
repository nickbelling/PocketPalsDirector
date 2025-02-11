import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Entity } from '../../common/firestore';
import {
    SteamGridDbService,
    VideogameDatabaseItem,
    VideogameDatabaseService,
} from '../../common/video-games';
import { CommonControllerModule } from '../../games/base/controller';
import { DashboardGamesDatabaseAddDialog } from './dashboard-database-add-dialog';
import { DashboardGamesDatabaseEditDialog } from './dashboard-database-edit-dialog';

/** The Videogame Database screen. */
@Component({
    imports: [CommonControllerModule],
    providers: [SteamGridDbService],
    templateUrl: './dashboard-database.html',
    styleUrl: './dashboard-database.scss',
})
export class DashboardGamesDatabase {
    private _db = inject(VideogameDatabaseService);
    private _dialog = inject(MatDialog);

    /** The full list of games. */
    public games = this._db.games;

    /** Opens the add game dialog. */
    public addGame(): void {
        this._dialog.open(DashboardGamesDatabaseAddDialog, {
            minWidth: '600px',
        });
    }

    /** Opens the edit game dialog. */
    public editGame(game: Entity<VideogameDatabaseItem>): void {
        this._dialog.open(DashboardGamesDatabaseEditDialog, {
            data: game,
        });
    }
}
