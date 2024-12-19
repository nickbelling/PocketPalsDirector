import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
    SimpleDialogData,
    SimpleDialogResult,
    SimpleDialogType,
} from './model';
import { SimpleDialog } from './simple-dialog';
import { firstValueFrom } from 'rxjs';

type Callback<T> = () => T | Promise<T>;

export interface SimpleDialogCallbacks {
    onCancel?: Callback<void>;
    onYes?: Callback<void>;
    onNo?: Callback<void>;
    onOk?: Callback<void>;
    onDelete?: Callback<void>;
}

@Injectable({
    providedIn: 'root',
})
export class SimpleDialogService {
    private _dialog = inject(MatDialog);

    public async open(
        type: SimpleDialogType,
        title: string,
        description: string,
        options: SimpleDialogCallbacks
    ): Promise<void> {
        const dialogRef = this._dialog.open<
            SimpleDialog,
            SimpleDialogData,
            SimpleDialogResult
        >(SimpleDialog, {
            data: {
                title: title,
                description: description,
                type: type,
            },
            disableClose: true,
        });

        const result = await firstValueFrom(dialogRef.afterClosed());
        const callbacks: {
            [key in SimpleDialogResult]: Callback<void> | undefined;
        } = {
            [SimpleDialogResult.Cancel]: options.onCancel,
            [SimpleDialogResult.Yes]: options.onYes,
            [SimpleDialogResult.No]: options.onNo,
            [SimpleDialogResult.Ok]: options.onOk,
            [SimpleDialogResult.Delete]: options.onDelete,
        };

        if (result !== undefined) {
            if (callbacks[result] !== undefined) {
                await callbacks[result]();
            } else {
                console.debug(
                    `Result ${SimpleDialogResult[result]} has no callback defined.`
                );
            }
        }
    }
}
