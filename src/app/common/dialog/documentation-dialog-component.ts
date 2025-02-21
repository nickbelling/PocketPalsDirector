import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MarkdownComponent } from 'ngx-markdown';
import { DocumentationDialogData } from './model';

/** A dialog to pop that shows Markdown documentation. */
@Component({
    imports: [
        MatButtonModule,
        MatDialogModule,
        MatToolbarModule,
        MarkdownComponent,
    ],
    templateUrl: './documentation-dialog-component.html',
})
export class DocumentationDialogComponent {
    private _data = inject<DocumentationDialogData>(MAT_DIALOG_DATA);

    /** The title, as it will appear in the dialog's toolbar. */
    public readonly title = this._data.title;

    /** The main documentation to display, in Markdown format. */
    public readonly documentation = this._data.documentation;
}
