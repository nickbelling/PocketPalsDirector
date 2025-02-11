import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { ConfirmDialogComponent } from './confirm-dialog-component';
import {
    Callback,
    ConfirmDialogData,
    ConfirmDialogOptions,
    ConfirmDialogResult,
    ConfirmDialogType,
} from './model';

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
        prompt: string,
        options: ConfirmDialogOptions,
    ): Promise<void> {
        // Open the confirmation dialog with the data
        const dialogRef = this._dialog.open<
            ConfirmDialogComponent,
            ConfirmDialogData,
            ConfirmDialogResult
        >(ConfirmDialogComponent, {
            data: {
                title: title,
                prompt: prompt,
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
