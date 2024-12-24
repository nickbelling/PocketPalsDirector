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
    protected isValid = computed(() => this.name().trim().length > 0);

    public async submit(): Promise<void> {
        await this._data.addPlayer({
            name: this.name(),
            createdAt: serverTimestamp() as Timestamp,
            buzzTimestamp: null,
            lockedOut: false,
            soundEffect: null,
        });

        await this._dialog.close();
    }
}
