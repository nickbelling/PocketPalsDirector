import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Entity } from '../../common/firestore';
import {
    SteamGridDbService,
    VIDEOGAME_STORAGE_BASE,
    VideogameDatabaseItem,
    VideogameDatabaseService,
} from '../../common/video-games';
import { CommonControllerModule } from '../../games/base/controller';

@Component({
    imports: [CommonControllerModule],
    providers: [SteamGridDbService],
    templateUrl: './dashboard-games-database-edit-dialog.html',
    styleUrl: './dashboard-games-database-edit-dialog.scss',
})
export class DashboardGamesDatabaseEditDialog {
    private _vgDb = inject(VideogameDatabaseService);
    private _dialog = inject(MatDialogRef<DashboardGamesDatabaseEditDialog>);

    public VIDEOGAME_STORAGE_BASE = VIDEOGAME_STORAGE_BASE;
    public loading = signal<boolean>(false);
    public game = inject<Entity<VideogameDatabaseItem>>(MAT_DIALOG_DATA);
    public logoFileToUpload = signal<File | undefined>(undefined);
    public heroFileToUpload = signal<File | undefined>(undefined);

    public async submit(): Promise<void> {
        this.loading.set(true);
        const logoFile = this.logoFileToUpload();
        const heroFile = this.heroFileToUpload();

        try {
            if (logoFile) {
                await this._vgDb.uploadLogo(this.game.id, logoFile);
            }

            if (heroFile) {
                await this._vgDb.uploadHero(this.game.id, heroFile);
            }

            await this._vgDb.updateRegisteredGame(this.game.id);

            this._dialog.close();
        } finally {
            this.loading.set(false);
        }
    }
}
