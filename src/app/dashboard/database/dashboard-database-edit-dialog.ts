import { GlobalPositionStrategy, Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Component, inject, linkedSignal, signal } from '@angular/core';
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogRef,
} from '@angular/material/dialog';
import { toPng } from 'html-to-image';
import { ProgressMonitor } from '../../common/components/progress';
import { ConfirmDialog } from '../../common/dialog';
import { Entity } from '../../common/firestore';
import { ToastService } from '../../common/toast';
import { downloadUrlAsFile, sleep } from '../../common/utils';
import {
    GameHero,
    SGDBImage,
    SteamGridDbService,
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

type ImageType = 'logo' | 'hero';

/**
 * The Videogame Database "Edit Game" dialog.
 *
 * Has a number of functions:
 * * Can replace either image either by uploading a file, or popping a dialog
 *   to enable you to select it from the SGDB image list.
 * * Can make a static PNG of the game's "Hero" (logo + hero BG) in a variety
 *   of resolutions
 * * Can open the game in SteamGridDB in a new tab
 */
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
    protected progress = new ProgressMonitor();

    /** The VGDB record for the game currently being edited. */
    public game = inject<Entity<VideogameDatabaseItem>>(MAT_DIALOG_DATA);

    /** True if either image is still loading. */
    public loading = linkedSignal<boolean>(() => {
        return this.logoLoading() || this.heroLoading();
    });

    /** True if a new logo image has been selected and is loading. */
    public logoLoading = signal<boolean>(false);

    /** True if a new hero image has been selected and is loading. */
    public heroLoading = signal<boolean>(false);

    /** A replacement logo file to upload. */
    public logoFileToUpload = signal<File | null>(null);

    /** A replacement hero file to upload. */
    public heroFileToUpload = signal<File | null>(null);

    /**
     * Uploads the replaced images and updates the game in the VGDB.
     */
    public async submit(): Promise<void> {
        this.loading.set(true);
        const logoFile = this.logoFileToUpload();
        const heroFile = this.heroFileToUpload();

        if (!logoFile && !heroFile) {
            return;
        }

        try {
            this.progress.start(3);

            if (logoFile) {
                this.progress.set(1, 'Uploading logo image...');
                await this._vgDb.uploadLogo(this.game.id, logoFile);
            }

            if (heroFile) {
                this.progress.set(2, 'Uploading hero image...');
                await this._vgDb.uploadHero(this.game.id, heroFile);
            }

            this.progress.set(3, 'Updating game...');
            await this._vgDb.markGameAsUpdated(this.game.id);

            this.progress.finish();
            this._toast.info(`${this.game.name} updated successfully.`);
            this._dialog.close();
        } catch (error) {
            this._toast.error(`Failed to update ${this.game.name}.`, error);
        } finally {
            this.progress.reset();
            this.loading.set(false);
        }
    }

    /**
     * Opens the image select dialog for the current game. Searches SGDB for all
     * images of the given type, and displays them. When the user selects one,
     * downloads it and sets the appropriate "fileToUpload" Signal.
     * @param type The type of image to select (logo or hero).
     */
    public selectNewImage(type: ImageType): void {
        const data: DatabaseImageSelectOptions = {
            type: type,
            sgdbGameId: this.game.steamGridDbId,
        };

        // Pop the select image dialog
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

        const closeRef = dialogRef
            .afterClosed()
            .subscribe(async (image?: SGDBImage) => {
                if (image) {
                    // User selected an image.
                    await this._downloadImageFile(type, image);
                } // else user dismissed dialog without selecting anything

                closeRef.unsubscribe();
            });
    }

    /**
     * Downloads the given image as a file, and stores that in the appropriate
     * "fileToUpload" Signal.
     */
    private async _downloadImageFile(type: ImageType, image: SGDBImage) {
        if (type === 'logo') {
            this.logoLoading.set(true);
        } else if (type === 'hero') {
            this.heroLoading.set(true);
        }

        try {
            // Download the image and set it as the file to upload
            const file = await downloadUrlAsFile(image.url, type, true);

            if (type === 'logo') {
                this.logoFileToUpload.set(file);
            } else if (type === 'hero') {
                this.heroFileToUpload.set(file);
            }
        } catch (error) {
            this._toast.error('Failed to download the image file.', error);
        }

        this.logoLoading.set(false);
        this.heroLoading.set(false);
    }

    /** Deletes the game from the Videogame Database. */
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

    /**
     * Renders an image of the game's logo/hero at the given resolution.
     *
     * Spawns a CDK overlay portal just off-screen, renders a <game-hero>
     * component into it for the current game, waits for it to load, renders
     * that as an image, downloads it, and then destroys the overlay.
     */
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
                // Circuit breaker
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
