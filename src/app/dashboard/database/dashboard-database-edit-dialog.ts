import { Component, inject, linkedSignal, signal } from '@angular/core';
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogRef,
} from '@angular/material/dialog';
import { ConfirmDialog } from '../../common/dialog';
import { Entity } from '../../common/firestore';
import { downloadUrlAsFile } from '../../common/utils';
import {
    SGDBImage,
    SteamGridDbService,
    VIDEOGAME_STORAGE_BASE,
    VideogameDatabaseItem,
    VideogameDatabaseService,
} from '../../common/video-games';
import {
    GameHeroSrcPipe,
    GameLogoSrcPipe,
} from '../../common/video-games/logo-src.pipe';
import { CommonControllerModule } from '../../games/base/controller';
import {
    DashboardGamesDatabaseImageSelectDialog,
    DatabaseImageSelectOptions,
} from './dashboard-database-image-select-dialog';

@Component({
    imports: [CommonControllerModule, GameLogoSrcPipe, GameHeroSrcPipe],
    providers: [SteamGridDbService],
    templateUrl: './dashboard-database-edit-dialog.html',
    styleUrl: './dashboard-database-edit-dialog.scss',
})
export class DashboardGamesDatabaseEditDialog {
    private _vgDb = inject(VideogameDatabaseService);
    private _dialog = inject(MatDialogRef<DashboardGamesDatabaseEditDialog>);
    private _confirm = inject(ConfirmDialog);
    private _newDialog = inject(MatDialog);

    public VIDEOGAME_STORAGE_BASE = VIDEOGAME_STORAGE_BASE;
    public game = inject<Entity<VideogameDatabaseItem>>(MAT_DIALOG_DATA);

    public loading = linkedSignal<boolean>(() => {
        return this.logoLoading() || this.heroLoading();
    });
    public logoLoading = signal<boolean>(false);
    public heroLoading = signal<boolean>(false);
    public logoFileToUpload = signal<File | null>(null);
    public heroFileToUpload = signal<File | null>(null);

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

    public selectNewImage(type: 'logo' | 'hero'): void {
        const data: DatabaseImageSelectOptions = {
            type: type,
            sgdbGameId: this.game.steamGridDbId,
        };

        const dialogRef = this._newDialog.open(
            DashboardGamesDatabaseImageSelectDialog,
            {
                data: data,
                height: '60vh',
                width: '60vw',
                minHeight: '60vh',
                minWidth: '60vw',
            },
        );

        dialogRef.afterClosed().subscribe(async (image?: SGDBImage) => {
            if (image) {
                if (type === 'logo') {
                    this.logoLoading.set(true);
                } else if (type === 'hero') {
                    this.heroLoading.set(true);
                }

                const file = await downloadUrlAsFile(image.url, type, true);

                if (type === 'logo') {
                    this.logoFileToUpload.set(file);
                } else if (type === 'hero') {
                    this.heroFileToUpload.set(file);
                }

                this.logoLoading.set(false);
                this.heroLoading.set(false);
            }
        });
    }

    public deleteGame(game: Entity<VideogameDatabaseItem>): void {
        this._confirm.open(
            'deleteCancel',
            'Delete game',
            `Are you sure you want to delete ${game.name}?`,
            {
                onDelete: async () => {
                    this.loading.set(true);
                    await this._vgDb.deleteGame(game.id);
                    this.loading.set(false);
                    this._dialog.close();
                },
            },
        );
    }
}
