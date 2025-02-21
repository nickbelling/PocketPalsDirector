import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DocumentationDialogComponent } from './documentation-dialog-component';
import { DocumentationDialogData } from './model';

/** A service used for displaying prompts for user confirmation. */
@Injectable({
    providedIn: 'root',
})
export class DocumentationDialog {
    private _dialog = inject(MatDialog);

    /** Opens a dialog showing the given Markdown documentation. */
    public open(title: string, markdown: string): void {
        // Open the confirmation dialog with the data
        this._dialog.open<
            DocumentationDialogComponent,
            DocumentationDialogData
        >(DocumentationDialogComponent, {
            data: {
                title: title,
                documentation: markdown,
            },
            width: '60vh',
            height: '60vh',
        });
    }
}
