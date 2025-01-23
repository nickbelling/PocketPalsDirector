import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Entity } from '../../common/firestore';
import {
    SteamGridDbService,
    VIDEOGAME_STORAGE_BASE,
    VideogameDatabaseItem,
    VideogameDatabaseService,
} from '../../common/video-games';
import { CommonControllerModule } from '../../games/base/controller';
import { DashboardGamesDatabaseAddDialog } from './dashboard-database-add-dialog';
import { DashboardGamesDatabaseEditDialog } from './dashboard-database-edit-dialog';

@Component({
    imports: [CommonControllerModule],
    providers: [SteamGridDbService],
    templateUrl: './dashboard-database.html',
    styleUrl: './dashboard-database.scss',
})
export class DashboardGamesDatabase {
    private _db = inject(VideogameDatabaseService);
    private _dialog = inject(MatDialog);

    public VIDEOGAME_STORAGE_BASE = VIDEOGAME_STORAGE_BASE;
    public games = this._db.games;

    public addGame(): void {
        this._dialog.open(DashboardGamesDatabaseAddDialog, {
            minWidth: '600px',
        });
    }

    public editGame(game: Entity<VideogameDatabaseItem>): void {
        this._dialog.open(DashboardGamesDatabaseEditDialog, {
            data: game,
        });
    }
}
