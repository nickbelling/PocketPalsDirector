import { Component, inject, resource, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastService } from '../../common/toast';
import { SGDBImage, SteamGridDbService } from '../../common/video-games';
import { CommonControllerModule } from '../../games/base/controller';

export interface DatabaseImageSelectOptions {
    type: 'logo' | 'hero';
    sgdbGameId: number;
}

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

    public loading = signal<boolean>(false);
    public data = inject<DatabaseImageSelectOptions>(MAT_DIALOG_DATA);

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

    public onSelect(image: SGDBImage): void {
        this._dialog.close(image);
    }
}
