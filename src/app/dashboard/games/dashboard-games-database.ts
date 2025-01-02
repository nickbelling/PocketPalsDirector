import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../../common/dialog';
import { Entity } from '../../common/firestore';
import {
    SteamGridDbService,
    VIDEOGAME_STORAGE_BASE,
    VideogameDatabaseItem,
    VideogameDatabaseService,
} from '../../common/video-games';
import { CommonControllerModule } from '../../games/base/controller';
import { DashboardGamesDatabaseAddDialog } from './dashboard-games-database-add-dialog';
import { DashboardGamesDatabaseEditDialog } from './dashboard-games-database-edit-dialog';

@Component({
    imports: [CommonControllerModule],
    providers: [SteamGridDbService],
    templateUrl: './dashboard-games-database.html',
    styleUrl: './dashboard-games-database.scss',
})
export class DashboardGamesDatabase {
    private _db = inject(VideogameDatabaseService);
    private _dialog = inject(MatDialog);
    private _confirm = inject(ConfirmDialog);

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

    public deleteGame(game: Entity<VideogameDatabaseItem>): void {
        this._confirm.open(
            'deleteCancel',
            'Delete game',
            `Are you sure you want to delete ${game.name}?`,
            {
                onDelete: () => {
                    this._db.deleteGame(game.id);
                },
            },
        );
    }
}
