import { Component, inject, resource } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastService } from '../../common/toast';
import { SGDBImage, SteamGridDbService } from '../../common/video-games';
import { CommonControllerModule } from '../../games/base/controller';

export interface DatabaseImageSelectOptions {
    type: 'logo' | 'hero';
    sgdbGameId: number;
}

/**
 * The Videogame Database "Select New Image" dialog. Searches SGDB for new logos
 * or hero images for the given game, and displays them, allowing the user to
 * select one.
 */
@Component({
    imports: [CommonControllerModule],
    providers: [SteamGridDbService],
    templateUrl: './dashboard-database-image-select-dialog.html',
    styleUrl: './dashboard-database-image-select-dialog.scss',
})
export class DashboardGamesDatabaseImageSelectDialog {
    private _steamGridDb = inject(SteamGridDbService);
    private _dialog = inject(
        MatDialogRef<DashboardGamesDatabaseImageSelectDialog>,
    );
    private _toast = inject(ToastService);

    /** The game and image type selection. */
    public data = inject<DatabaseImageSelectOptions>(MAT_DIALOG_DATA);

    /** The list of images from SteamGridDB. */
    public images = resource({
        request: () => this.data,
        loader: async ({ request }) => {
            try {
                if (request.type === 'hero') {
                    return await this._steamGridDb.getGameHeroes(
                        request.sgdbGameId,
                    );
                } else {
                    return await this._steamGridDb.getGameLogos(
                        request.sgdbGameId,
                    );
                }
            } catch (error) {
                this._toast.error('Failed to load images.', error);
                return [];
            }
        },
    });

    /**
     * Fired when the user selects an image. Closes the dialog with the selected
     * image as the "dialog result", which will cause the edit dialog to
     * download it.
     */
    public onSelect(image: SGDBImage): void {
        this._dialog.close(image);
    }
}
