import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { ConfirmDialogComponent } from './confirm-dialog-component';
import {
    ConfirmDialogData,
    ConfirmDialogResult,
    ConfirmDialogType,
} from './model';

type Callback<T> = () => T | Promise<T>;

export interface ConfirmDialogCallbacks {
    /** Fired when the user clicks "Cancel" in the dialog. */
    onCancel?: Callback<void>;
    /** Fired when the user clicks "Yes" in the dialog. */
    onYes?: Callback<void>;
    /** Fired when the user clicks "No" in the dialog. */
    onNo?: Callback<void>;
    /** Fired when the user clicks "OK" in the dialog. */
    onOk?: Callback<void>;
    /** Fired when the user clicks "Delete" in the dialog. */
    onDelete?: Callback<void>;
}

/** A service used for displaying prompts for user confirmation. */
@Injectable({
    providedIn: 'root',
})
export class ConfirmDialog {
    private _dialog = inject(MatDialog);

    /** Opens a prompt of the given type to ask the user a question. */
    public async open(
        type: ConfirmDialogType,
        title: string,
        description: string,
        options: ConfirmDialogCallbacks,
    ): Promise<void> {
        // Open the dialog with the data
        const dialogRef = this._dialog.open<
            ConfirmDialogComponent,
            ConfirmDialogData,
            ConfirmDialogResult
        >(ConfirmDialogComponent, {
            data: {
                title: title,
                description: description,
                type: type,
            },
            disableClose: true,
        });

        // Await the result
        const result = await firstValueFrom(dialogRef.afterClosed());

        const callbacks: {
            [key in ConfirmDialogResult]: Callback<void> | undefined;
        } = {
            ['cancel']: options.onCancel,
            ['yes']: options.onYes,
            ['no']: options.onNo,
            ['ok']: options.onOk,
            ['delete']: options.onDelete,
        };

        // Match the result of the dialog against the provided callbacks, and
        // invoke it if it's defined.
        if (result !== undefined) {
            if (callbacks[result] !== undefined) {
                await callbacks[result]();
            } else {
                console.debug(`Result '${result}' has no callback defined.`);
            }
        }
    }
}
