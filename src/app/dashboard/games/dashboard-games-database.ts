import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Entity } from '../../common/firestore';
import {
    VIDEOGAME_STORAGE_BASE,
    VideogameDatabaseItem,
    VideogameDatabaseService,
} from '../../common/video-games';
import { CommonControllerModule } from '../../games/base/controller';
import { DashboardGamesDatabaseAddDialog } from './dashboard-games-database-add-dialog';
import { DashboardGamesDatabaseEditDialog } from './dashboard-games-database-edit-dialog';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './dashboard-games-database.html',
    styleUrl: './dashboard-games-database.scss',
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
