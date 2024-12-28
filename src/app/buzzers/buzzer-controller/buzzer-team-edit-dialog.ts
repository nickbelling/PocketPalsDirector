import { Component, computed, inject, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Timestamp } from 'firebase/firestore';
import { CommonControllerModule, isValidColor } from '../../common';
import { BaseEntityEditDialog } from '../../games/base/base-entity-edit';
import { BuzzerDirectorDataStore } from '../data/director-data';
import { BuzzerPlayer, BuzzerTeam } from '../model';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './buzzer-team-edit-dialog.html',
})
export class BuzzerTeamEditDialog extends BaseEntityEditDialog<BuzzerTeam> {
    private _data = inject(BuzzerDirectorDataStore);
    private _dialog = inject(MatDialogRef<BuzzerTeamEditDialog>);

    protected name = signal<string>('');
    protected color = signal<string>('');
    protected isValid = computed(
        () => this.name().trim().length > 0 && isValidColor(this.color()),
    );

    protected fakePlayer: BuzzerPlayer = {
        name: 'SAMPLE',
        image: null,
        soundEffect: null,
        createdAt: Timestamp.now(),
        buzzTimestamp: null,
        lockedOut: false,
        teamId: null,
    };

    protected fakeTeam = computed<BuzzerTeam | undefined>(() => {
        const color = this.color();
        if (color) {
            return {
                name: '',
                color: color,
                createdAt: Timestamp.now(),
            };
        } else {
            return undefined;
        }
    });

    constructor() {
        super();
        if (this.editing && this.entity) {
            this.name.set(this.entity.name);
            this.color.set(this.entity.color);
        }
    }

    public async submit(): Promise<void> {
        this.loading.set(true);
        try {
            if (this.editing) {
                await this._data.editTeam(this.id()!, {
                    name: this.name(),
                    color: this.color(),
                });
            } else {
                await this._data.addTeam({
                    name: this.name(),
                    color: this.color(),
                    createdAt: Timestamp.now(),
                });
            }
            this._dialog.close();
        } finally {
            this.loading.set(false);
        }
    }
}
