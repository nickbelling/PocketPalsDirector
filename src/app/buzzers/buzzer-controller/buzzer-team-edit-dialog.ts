import { Component, computed, inject, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Timestamp } from 'firebase/firestore';
import { ToastService } from '../../common/toast';
import { isValidColor } from '../../common/utils';
import {
    BaseEntityEditDialog,
    CommonControllerModule,
} from '../../games/base/controller';
import { BuzzerDirectorDataStore } from '../data/director-data';
import { BuzzerTeam } from '../data/model';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './buzzer-team-edit-dialog.html',
})
export class BuzzerTeamEditDialog extends BaseEntityEditDialog<BuzzerTeam> {
    private _data = inject(BuzzerDirectorDataStore);
    private _dialog = inject(MatDialogRef<BuzzerTeamEditDialog>);
    private _toast = inject(ToastService);

    protected name = signal<string>('');
    protected color = signal<string>('');
    protected isValid = computed(
        () => this.name().trim().length > 0 && isValidColor(this.color()),
    );

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
