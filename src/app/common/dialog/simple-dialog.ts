import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
    SimpleDialogData,
    SimpleDialogResult,
    SimpleDialogType,
} from './model';

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
        this.type === SimpleDialogType.OkCancel ||
        this.type === SimpleDialogType.YesNoCancel ||
        this.type === SimpleDialogType.DeleteCancel;
    protected hasNo =
        this.type === SimpleDialogType.YesNo ||
        this.type === SimpleDialogType.YesNoCancel;
    protected hasYes =
        this.type === SimpleDialogType.YesNo ||
        this.type === SimpleDialogType.YesNoCancel;
    protected hasOk = this.type === SimpleDialogType.OkCancel;
    protected hasDelete = this.type === SimpleDialogType.DeleteCancel;

    protected Result = SimpleDialogResult;
}
