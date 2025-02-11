import { Component } from '@angular/core';
import { BASE_FILE_FIELD_IMPORTS, BaseFileField } from './base-file.field';

/**
 * Creates an Angular Material looking "file input" field for images which has
 * a button for upload as well as a button to enable pasting from the clipboard
 * if the clipboard contains a valid image file.
 *
 * By default, matches any file with the MIME type `image/*`.
 */
@Component({
    selector: 'image-file-field',
    imports: BASE_FILE_FIELD_IMPORTS,
    templateUrl: './base-file-field.html',
    styleUrl: './base-file-field.scss',
})
export class ImageFileField extends BaseFileField {
    constructor() {
        super('Image file', 'image/*');
    }
}
