import { Component } from '@angular/core';
import { BASE_FILE_FIELD_IMPORTS, BaseFileField } from './base-file.field';

/**
 * Creates an Angular Material looking "file input" field for audio which has
 * a button for upload as well as a button to enable pasting from the clipboard
 * if the clipboard contains a valid audio file.
 *
 * By default, matches any file with the MIME type `audio/*`.
 */
@Component({
    selector: 'audio-file-field',
    imports: BASE_FILE_FIELD_IMPORTS,
    templateUrl: './base-file-field.html',
    styleUrl: './base-file-field.scss',
})
export class AudioFileField extends BaseFileField {
    constructor() {
        super('Audio file', 'audio/*');
    }
}
