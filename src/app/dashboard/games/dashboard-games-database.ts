import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FirebaseUploadedFileUrlPipe } from '../../common/firestore/firebase-file-url.pipe';
import {
    VIDEOGAME_STORAGE_BASE,
    VideogameDatabaseService,
} from '../../common/video-games';
import { CommonControllerModule } from '../../games/base/controller';
import { DashboardGamesDatabaseAddDialog } from './dashboard-games-database-add-dialog';

@Component({
    imports: [CommonControllerModule, FirebaseUploadedFileUrlPipe],
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
            width: '400px',
            maxWidth: '400px',
        });
    }
}
