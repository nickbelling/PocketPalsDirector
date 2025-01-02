import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root',
})
export class ToastService {
    private _snackbar = inject(MatSnackBar);

    public open(text: string): void {
        this._snackbar.open(text, undefined, {
            duration: 2500,
        });
    }
}
