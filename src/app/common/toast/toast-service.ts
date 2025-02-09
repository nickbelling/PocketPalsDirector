import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { parseError } from '../utils';
import { ToastPopup, ToastPopupData } from './toast-popup';

@Injectable({
    providedIn: 'root',
})
export class ToastService {
    private _snackbar = inject(MatSnackBar);

    public info(title: string): void {
        this.open({
            type: 'info',
            title: title,
        });
    }

    public error(title: string, error?: unknown): void {
        console.error(title, error);
        const titleWithError = error ? `${title} ${parseError(error)}` : title;

        this.open({
            type: 'error',
            title: titleWithError,
        });
    }

    public open(options: ToastPopupData, duration: number = 2000): void {
        const panelClass =
            options.type === 'error' ? 'toast-error' : 'toast-info';

        this._snackbar.openFromComponent<ToastPopup, ToastPopupData>(
            ToastPopup,
            {
                data: options,
                panelClass: panelClass,
                duration: duration,
            },
        );
    }
}
