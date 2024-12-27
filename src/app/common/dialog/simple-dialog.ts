import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SimpleDialogData, SimpleDialogType } from './model';

/**
 * A simple dialog that offers a prompt with some buttons (e.g. yes/no,
 * OK/cancel, etc). Don't use directly - use the SimpleDialogService instead.
 */
@Component({
    templateUrl: './simple-dialog.html',
    imports: [MatButtonModule, MatDialogModule, MatToolbarModule],
})
export class SimpleDialog {
    private _data: SimpleDialogData = inject(MAT_DIALOG_DATA);

    protected type: SimpleDialogType = this._data.type;
    protected title: string = this._data.title;
    protected description: string = this._data.description;

    protected hasCancel =
        this.type === 'okCancel' ||
        this.type === 'yesNoCancel' ||
        this.type === 'deleteCancel';
    protected hasNo = this.type === 'yesNo' || this.type === 'yesNoCancel';
    protected hasYes = this.type === 'yesNo' || this.type === 'yesNoCancel';
    protected hasOk = this.type === 'okCancel';
    protected hasDelete = this.type === 'deleteCancel';
}
