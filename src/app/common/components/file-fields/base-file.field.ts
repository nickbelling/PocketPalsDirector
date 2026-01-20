import { FocusMonitor } from '@angular/cdk/a11y';
import {
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    model,
    signal,
    viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Subscription } from 'rxjs';
import { fileTypeMatchesInputPattern } from '../../utils';

export const BASE_FILE_FIELD_IMPORTS = [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
];

/**
 * Class used as the base to simplify uploadable file fields that follow the
 * basic pattern of being a disabled `<input matInput>` with an accompanying
 * hidden `<input type="file">`.
 *
 * Also adds an additional button to enable clipboard paste support.
 *
 * @abstract
 */
@Directive()
export abstract class BaseFileField {
    private _destroyRef = inject(DestroyRef);
    private _focusMonitor = inject(FocusMonitor);
    private _elementRef = inject(ElementRef<HTMLElement>);

    /**
     * A reference to the internal input control that holds the file being
     * uploaded.
     */
    private _fileUploadControl = viewChild<ElementRef>('fileInput');

    /** The current file loaded into the control. `null` if no file. */
    public readonly fileToUpload = model<File | null>(null);

    /**
     * A reference to a parent HTML element of this control that can be
     * monitored for focus. When that element is focused, this component checks
     * if the clipboard has a file of the given `acceptType`. If it does, it
     * enables the "paste file" button.
     */
    public readonly focusElement = input<HTMLElement | null>(null);

    /**
     * The MIME accept pattern the file input should use. Can be:
     * * a single type (e.g. `"image/png"`)
     * * a comma-separated list (e.g. `"image/png, image/jpg"`)
     * * a wildcard type (e.g. `"image/*"`, `"audio/*"`, `"*\/*"`)
     */
    public readonly acceptType = model<string>();

    /** The field's label (displayed above it). */
    public readonly label = model<string>();

    /** An optional hint to display underneath the form field. */
    public readonly hint = input<string | undefined>();

    public readonly disabled = input<boolean>(false);

    /** True if pasting is allowed. */
    public readonly canPaste = input(true);

    /** True if the clipboard currently has a valid file in it. */
    protected clipboardHasValidFile = signal<boolean>(false);

    constructor(defaultLabel: string, acceptType: string) {
        this.label.set(defaultLabel);
        this.acceptType.set(acceptType);

        // Monitor the external focus element for clipboard events, and fire the
        // gotFocus() method to determine if the clipboard has an image in it.
        let focusSubscription: Subscription | undefined = undefined;
        effect(() => {
            const focusElement =
                this.focusElement() || this._elementRef.nativeElement;

            // If changed from previous element to a different one, unsubscribe
            focusSubscription?.unsubscribe();

            // When the parent element receives focus, check if the
            // clipboard has a file type we're interested in, and if so,
            // set the "clipboardHasValidFile" Signal to true to enable the
            // paste button.
            focusSubscription = this._focusMonitor
                .monitor(focusElement, true)
                .subscribe(async () => {
                    const hasFile = await this._clipboardHasValidFile();
                    this.clipboardHasValidFile.set(hasFile);
                });
        });

        // Monitor the fileToUpload signal for the file being reset to null
        // (usually externally). If so, also reset the native control's file.
        effect(() => {
            const fileToUpload = this.fileToUpload();

            if (fileToUpload === null) {
                const control = this._fileUploadControl();
                if (control) {
                    control.nativeElement.value = null;
                }
            }
        });

        // Cleanup
        this._destroyRef.onDestroy(() => {
            focusSubscription?.unsubscribe();
        });
    }

    /** Pastes the current file from the clipboard into the control. */
    public async pasteFile(): Promise<void> {
        if (this.clipboardHasValidFile()) {
            const clipboardItems = await navigator.clipboard.read();
            const acceptTypePattern = this.acceptType() || '*/*';

            for (const item of clipboardItems) {
                if (this._clipboardItemMatchesPattern(item)) {
                    const concreteType = item.types.find((t) =>
                        fileTypeMatchesInputPattern(t, acceptTypePattern),
                    )!;
                    const fileBlob = await item.getType(concreteType);
                    const fileName = 'Pasted file';
                    const file = new File([fileBlob], fileName, {
                        type: fileBlob.type,
                    });

                    this.fileToUpload.set(file);
                    break;
                }
            }
        }
    }

    /**
     * Returns true if the clipboard currently has a file in it of the type
     * we're interested in.
     */
    private async _clipboardHasValidFile(): Promise<boolean> {
        try {
            const clipboardItems = await navigator.clipboard.read();
            for (const item of clipboardItems) {
                if (this._clipboardItemMatchesPattern(item)) {
                    return true;
                }
            }
        } catch {
            console.log('No permissions granted for reading clipboard.');
        }

        return false;
    }

    /**
     * Returns true if the given clipboard item has any MIME types matching the
     * current acceptType pattern we're interested in.
     */
    private _clipboardItemMatchesPattern(item: ClipboardItem): boolean {
        const acceptTypePattern = this.acceptType() || '*/*';
        return item.types.some((t) =>
            fileTypeMatchesInputPattern(t, acceptTypePattern),
        );
    }
}
