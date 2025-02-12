import { Component, computed, inject, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Timestamp } from 'firebase/firestore';
import { ProgressMonitor } from '../../common/components/progress';
import { ToastService } from '../../common/toast';
import { isNotEmpty } from '../../common/utils';
import {
    BaseEntityEditDialog,
    CommonControllerModule,
} from '../../games/base/controller';
import { BuzzerDirectorDataStore } from '../data/director-data';
import { BuzzerPlayer } from '../data/model';

/** Dialog for editing a buzzer player. */
@Component({
    imports: [CommonControllerModule],
    templateUrl: './buzzer-player-edit-dialog.html',
})
export class BuzzerPlayerAddDialog extends BaseEntityEditDialog<BuzzerPlayer> {
    private _data = inject(BuzzerDirectorDataStore);
    private _dialog = inject(MatDialogRef<BuzzerPlayerAddDialog>);
    private _toast = inject(ToastService);

    /** The list of teams that can be selected. */
    protected teams = this._data.teams;

    //#region Form fields

    protected name = signal<string>('');
    protected teamId = signal<string | null>(null);
    protected imageFileToUpload = signal<File | null>(null);
    protected soundFileToUpload = signal<File | null>(null);
    protected isValid = computed(() => isNotEmpty(this.name));

    //#endregion

    /**
     * The current progress of the add/edit operation. Used to display a
     * progress bar.
     */
    protected progress = new ProgressMonitor();

    constructor() {
        super();
        if (this.editing && this.entity) {
            this.name.set(this.entity.name);
            this.teamId.set(this.entity.teamId);
        }
    }

    /** Adds a new player, or edits the current one. */
    public async submit(): Promise<void> {
        this.loading.set(true);
        try {
            if (this.editing) {
                const entity = this.entity!;
                this.progress.start(5);

                let imageId = undefined;
                if (this.imageFileToUpload()) {
                    // Overriding an old image
                    if (entity.image) {
                        this.progress.set(1, 'Removing old image...');
                        await this._data.deleteImage(entity.image);
                    }

                    this.progress.set(2, 'Uploading image...');
                    imageId = await this._data.uploadImage(
                        this.imageFileToUpload()!,
                    );
                }

                let soundId = undefined;
                if (this.soundFileToUpload()) {
                    // Overriding an old sound
                    if (entity.soundEffect) {
                        this.progress.set(3, 'Removing old sound effect...');
                        await this._data.deleteSound(entity.soundEffect);
                    }

                    this.progress.set(4, 'Uploading sound effect...');
                    soundId = await this._data.uploadSound(
                        this.soundFileToUpload()!,
                    );
                }

                this.progress.set(5, 'Adding player...');

                const partialPlayer: Partial<BuzzerPlayer> = {
                    name: this.name(),
                    teamId: this.teamId(),
                };

                // Only set image and sound if they've been updated
                if (imageId) {
                    partialPlayer.image = imageId;
                }

                if (soundId) {
                    partialPlayer.soundEffect = soundId;
                }

                // Finally, update the record
                await this._data.editPlayer(entity.id, partialPlayer);

                this.progress.finish();
            } else {
                this.progress.start(3);

                // Upload image
                let imageId = null;
                if (this.imageFileToUpload()) {
                    this.progress.set(1, 'Uploading image...');
                    imageId = await this._data.uploadImage(
                        this.imageFileToUpload()!,
                    );
                }

                // Upload sound effect
                let soundId = null;
                if (this.soundFileToUpload()) {
                    this.progress.set(2, 'Uploading sound effect...');
                    soundId = await this._data.uploadSound(
                        this.soundFileToUpload()!,
                    );
                }

                // Add the player record
                this.progress.set(3, 'Adding player...');
                await this._data.addPlayer({
                    name: this.name(),
                    createdAt: Timestamp.now(),
                    buzzTimestamp: null,
                    lockedOut: false,
                    image: imageId,
                    soundEffect: soundId,
                    teamId: this.teamId(),
                });

                this.progress.finish();
            }

            this._dialog.close();
        } catch (error) {
            this._toast.error(
                this.editing
                    ? 'Failed to edit player.'
                    : 'Failed to add player.',
                error,
            );
        } finally {
            this.progress.reset();
            this.loading.set(false);
        }
    }
}
