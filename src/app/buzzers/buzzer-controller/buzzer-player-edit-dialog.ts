import { Component, computed, inject, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Timestamp } from 'firebase/firestore';
import { ToastService } from '../../common/toast';
import {
    BaseEntityEditDialog,
    CommonControllerModule,
} from '../../games/base/controller';
import { BuzzerDirectorDataStore } from '../data/director-data';
import { BuzzerPlayer } from '../data/model';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './buzzer-player-edit-dialog.html',
})
export class BuzzerPlayerAddDialog extends BaseEntityEditDialog<BuzzerPlayer> {
    private _data = inject(BuzzerDirectorDataStore);
    private _dialog = inject(MatDialogRef<BuzzerPlayerAddDialog>);
    private _toast = inject(ToastService);

    protected name = signal<string>('');
    protected teamId = signal<string | null>(null);
    protected isValid = computed(() => this.name().trim().length > 0);
    protected imageFileToUpload = signal<File | null>(null);
    protected soundFileToUpload = signal<File | null>(null);
    protected uploadProgress = signal<number>(0);

    protected teams = this._data.teams;

    constructor() {
        super();
        if (this.editing && this.entity) {
            this.name.set(this.entity.name);
            this.teamId.set(this.entity.teamId);
        }
    }

    public async submit(): Promise<void> {
        this.loading.set(true);
        try {
            if (this.editing) {
                const entity = this.entity!;
                this.uploadProgress.set(25);

                let imageId = undefined;
                if (this.imageFileToUpload()) {
                    // Overriding an old image
                    if (entity.image) {
                        await this._data.deleteImage(entity.image);
                    }

                    imageId = await this._data.uploadImage(
                        this.imageFileToUpload()!,
                    );
                }

                this.uploadProgress.set(50);

                let soundId = undefined;
                if (this.soundFileToUpload()) {
                    // Overriding an old sound
                    if (entity.soundEffect) {
                        await this._data.deleteSound(entity.soundEffect);
                    }

                    soundId = await this._data.uploadSound(
                        this.soundFileToUpload()!,
                    );
                }

                this.uploadProgress.set(75);

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

                await this._data.editPlayer(entity.id, partialPlayer);

                this.uploadProgress.set(100);
            } else {
                this.uploadProgress.set(25);
                let imageId = null;
                if (this.imageFileToUpload()) {
                    imageId = await this._data.uploadImage(
                        this.imageFileToUpload()!,
                    );
                }

                this.uploadProgress.set(50);
                let soundId = null;
                if (this.soundFileToUpload()) {
                    soundId = await this._data.uploadSound(
                        this.soundFileToUpload()!,
                    );
                }

                this.uploadProgress.set(75);
                await this._data.addPlayer({
                    name: this.name(),
                    createdAt: Timestamp.now(),
                    buzzTimestamp: null,
                    lockedOut: false,
                    image: imageId,
                    soundEffect: soundId,
                    teamId: this.teamId(),
                });

                this.uploadProgress.set(100);
            }
            await this._dialog.close();
        } catch (error) {
            this._toast.error(
                this.editing
                    ? 'Failed to edit player.'
                    : 'Failed to add player.',
                error,
            );
        } finally {
            this.uploadProgress.set(0);
            this.loading.set(false);
        }
    }
}
