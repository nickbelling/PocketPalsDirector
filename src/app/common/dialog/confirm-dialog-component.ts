import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ConfirmDialogData, ConfirmDialogType } from './model';

/**
 * A simple dialog that offers a prompt with some buttons (e.g. yes/no,
 * OK/cancel, etc). Don't use this component directly - use the `ConfirmDialog`
 * service instead.
 */
@Component({
    templateUrl: './confirm-dialog-component.html',
    imports: [MatButtonModule, MatDialogModule, MatToolbarModule],
})
export class ConfirmDialogComponent {
    private _data: ConfirmDialogData = inject(MAT_DIALOG_DATA);

    /** The dialog's type, which determines which buttons are visible. */
    protected type: ConfirmDialogType = this._data.type;

    /** The dialog's title - displayed in the toolbar. */
    protected title: string = this._data.title;

    /** The question to ask the user for confirmation. */
    protected prompt: string = this._data.prompt;

    // Determines which buttons to display based on the type of dialog this is.
    protected hasCancel =
        this.type === 'okCancel' ||
        this.type === 'yesNoCancel' ||
        this.type === 'deleteCancel';
    protected hasNo = this.type === 'yesNo' || this.type === 'yesNoCancel';
    protected hasYes = this.type === 'yesNo' || this.type === 'yesNoCancel';
    protected hasOk = this.type === 'okCancel';
    protected hasDelete = this.type === 'deleteCancel';
}
