import { Injectable, signal } from '@angular/core';

/** Service used to share edit state globally. */
@Injectable({
    providedIn: 'root',
})
export class QuestionEditorService {
    /** True if question "edit mode" is currently enabled. */
    public readonly editModeEnabled = signal<boolean>(false);
}
