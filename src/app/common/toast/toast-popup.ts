import { CommonModule } from '@angular/common';
import { Component, inject, linkedSignal, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import {
    MAT_SNACK_BAR_DATA,
    MatSnackBar,
    MatSnackBarModule,
} from '@angular/material/snack-bar';

export type ToastType = 'info' | 'error';

export interface ToastPopupData {
    type: ToastType;
    title: string;
    icon?: string;
}

@Component({
    imports: [CommonModule, MatCardModule, MatIconModule, MatSnackBarModule],
    templateUrl: './toast-popup.html',
})
export class ToastPopup {
    private _snackbar = inject(MatSnackBar);
    public data = inject<ToastPopupData>(MAT_SNACK_BAR_DATA);

    public type = signal<ToastType>('info');
    public title = signal<string>('');
    public icon = linkedSignal<string>(() => {
        if (this.data.icon) {
            return this.data.icon;
        }

        switch (this.type()) {
            case 'info':
                return 'info';
            case 'error':
                return 'report';
        }
    });

    constructor() {
        this.type.set(this.data.type);
        this.title.set(this.data.title);
        if (this.data.icon) {
            this.icon.set(this.data.icon);
        }
    }

    public dismiss(): void {
        this._snackbar.dismiss();
    }
}
