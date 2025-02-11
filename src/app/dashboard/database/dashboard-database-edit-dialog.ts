import { GlobalPositionStrategy, Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Component, inject, linkedSignal, signal } from '@angular/core';
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogRef,
} from '@angular/material/dialog';
import { toPng } from 'html-to-image';
import { ConfirmDialog } from '../../common/dialog';
import { Entity } from '../../common/firestore';
import { ToastService } from '../../common/toast';
import { downloadUrlAsFile, sleep } from '../../common/utils';
import {
    GameHero,
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
    private _toast = inject(ToastService);
    private _overlay = inject(Overlay);

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

            await this._vgDb.markGameAsUpdated(this.game.id);

            this._toast.info(`${this.game.name} updated successfully.`);
            this._dialog.close();
        } catch (error) {
            this._toast.error(`Failed to update ${this.game.name}.`, error);
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

                try {
                    const file = await downloadUrlAsFile(image.url, type, true);

                    if (type === 'logo') {
                        this.logoFileToUpload.set(file);
                    } else if (type === 'hero') {
                        this.heroFileToUpload.set(file);
                    }
                } catch (error) {
                    this._toast.error(
                        'Failed to download the image file.',
                        error,
                    );
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
                    try {
                        await this._vgDb.deleteGame(game.id);
                        this._toast.info(`Successfully deleted ${game.name}.`);
                        this._dialog.close();
                    } catch (error) {
                        this._toast.error(
                            `Failed to delete ${game.name}.`,
                            error,
                        );
                    } finally {
                        this.loading.set(false);
                    }
                },
            },
        );
    }

    public async makeImage(width: number, height: number): Promise<void> {
        // Set up the portal to appear just off-screen (i.e. the image's
        // bottom-right will be at the screen's top-left)
        const position = new GlobalPositionStrategy();
        position.top(`-${height}px`);
        position.left(`-${width}px`);
        const overlayRef = this._overlay.create({
            width: width,
            height: height,
            positionStrategy: position,
        });

        // Spawn a new GameHero component in an overlay
        const portal = new ComponentPortal(GameHero);
        const componentRef = overlayRef.attach(portal);
        componentRef.setInput('gameId', this.game.id);

        // Wait for the hero to report that it's loaded
        let count = 0;
        while (!componentRef.instance.loaded()) {
            await sleep(100);
            count++;

            if (count >= 100) {
                break;
            }
        }

        try {
            // Get a reference to the element
            const element = componentRef.location.nativeElement;

            // Render the image as a PNG
            const dataUrl = await toPng(element!, {
                width: width,
                height: height,
                canvasWidth: width,
                canvasHeight: height,
                pixelRatio: 1,
            });

            // Download the image
            const link = document.createElement('a');
            link.download = `${this.game.id}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            this._toast.error('Failed to create image file.', error);
        } finally {
            // Dispose of the overlay, which inherently destroys the GameHero
            // component
            overlayRef.dispose();
        }
    }
}
