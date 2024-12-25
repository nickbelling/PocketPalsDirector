import { Component, computed, inject, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { serverTimestamp, Timestamp } from 'firebase/firestore';
import { CommonControllerModule } from '../../common';
import { BuzzerDirectorDataStore } from '../data/director-data';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './buzzer-player-add-dialog.html',
})
export class BuzzerPlayerAddDialog {
    private _data = inject(BuzzerDirectorDataStore);
    private _dialog = inject(MatDialogRef<BuzzerPlayerAddDialog>);

    protected name = signal<string>('');
    protected loading = signal<boolean>(false);
    protected isValid = computed(
        () =>
            this.name().trim().length > 0 &&
            this.imageFileToUpload() !== null &&
            this.soundFileToUpload() !== null,
    );
    protected imageFileToUpload = signal<File | null>(null);
    protected soundFileToUpload = signal<File | null>(null);
    protected uploadProgress = signal<number>(0);

    public async submit(): Promise<void> {
        this.loading.set(true);
        try {
            this.uploadProgress.set(25);
            const imageId = await this._data.uploadImage(
                this.imageFileToUpload()!,
            );

            this.uploadProgress.set(50);
            const soundId = await this._data.uploadSound(
                this.soundFileToUpload()!,
            );

            this.uploadProgress.set(75);
            await this._data.addPlayer({
                name: this.name(),
                createdAt: serverTimestamp() as Timestamp,
                buzzTimestamp: null,
                lockedOut: false,
                image: imageId,
                soundEffect: soundId,
            });

            this.uploadProgress.set(100);
            await this._dialog.close();
        } finally {
            this.uploadProgress.set(0);
            this.loading.set(false);
        }
    }
}
