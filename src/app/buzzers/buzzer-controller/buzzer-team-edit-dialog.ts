import { Component, computed, inject, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Timestamp } from 'firebase/firestore';
import { ToastService } from '../../common/toast';
import { isNotEmpty, isValidColor } from '../../common/utils';
import {
    BaseEntityEditDialog,
    CommonControllerModule,
} from '../../games/base/controller';
import { BuzzerDirectorDataStore } from '../data/director-data';
import { BuzzerTeam } from '../data/model';

/** Dialog for editing a buzzer team. */
@Component({
    imports: [CommonControllerModule],
    templateUrl: './buzzer-team-edit-dialog.html',
})
export class BuzzerTeamEditDialog extends BaseEntityEditDialog<BuzzerTeam> {
    private _data = inject(BuzzerDirectorDataStore);
    private _dialog = inject(MatDialogRef<BuzzerTeamEditDialog>);
    private _toast = inject(ToastService);

    //#region Form fields

    protected name = signal<string>('');
    protected color = signal<string>('');
    protected isValid = computed(
        () => isNotEmpty(this.name) && isValidColor(this.color()),
    );

    //#endregion

    constructor() {
        super();
        if (this.editing && this.entity) {
            this.name.set(this.entity.name);
            this.color.set(this.entity.color);
        }
    }

    /** Adds a new team, or edits an old one. */
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
        } catch (error) {
            this._toast.error(
                this.editing ? 'Failed to edit team.' : 'Failed to add team.',
                error,
            );
        } finally {
            this.loading.set(false);
        }
    }
}
