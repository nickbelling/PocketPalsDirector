import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { parseError } from '../utils';
import { ToastPopup, ToastPopupData } from './toast-popup';

/**
 * A service that can be used to display a notification popup with a specified
 * message, styled based on a "level" (e.g. info/error).
 */
@Injectable({
    providedIn: 'root',
})
export class ToastService {
    private _snackbar = inject(MatSnackBar);

    /** Pops an "info"-level toast message. */
    public info(message: string, duration: number = 2000): void {
        this.open(
            {
                type: 'info',
                message: message,
            },
            duration,
        );
    }

    /**
     * Pops an "error"-level toast message.
     * Providing an {@link Error} object will also format the error and display
     * it alongside the message.
     */
    public error(
        message: string,
        error?: unknown,
        duration: number = 2000,
    ): void {
        // Console log the error so that a dev can jump to the callstack easily
        console.error(message, error);

        const messageWithError = error
            ? `${message} ${parseError(error)}`
            : message;

        this.open(
            {
                type: 'error',
                message: messageWithError,
            },
            duration,
        );
    }

    /**
     * Pops a toast notification with the given options.
     * @param options The options for displaying the toast notification.
     * @param duration The amount of time (in ms) the notification should
     * persist before auto-dismissing.
     */
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
