import { FocusMonitor } from '@angular/cdk/a11y';
import {
    Component,
    DestroyRef,
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

@Component({
    selector: 'image-field',
    imports: [
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
    ],
    templateUrl: './image-field.html',
    styleUrl: './image-field.scss',
})
export class ImageField {
    private _destroyRef = inject(DestroyRef);
    private _focusMonitor = inject(FocusMonitor);
    private _focusSubscription?: Subscription;
    private _fileUploadControl = viewChild<ElementRef>('fileInput');

    public readonly fileToUpload = model<File | null>(null);
    public readonly focusElement = input<HTMLElement | null>(null);

    protected clipboardHasImage = signal<boolean>(false);

    constructor() {
        // Monitor the external focus element for clipboard events, and fire the
        // gotFocus() method to determine if the clipboard has an image in it.
        effect(() => {
            const focusElement = this.focusElement();

            if (focusElement) {
                this._focusSubscription?.unsubscribe();
                this._focusMonitor
                    .monitor(focusElement, true)
                    .subscribe(async () => {
                        await this._gotFocus();
                    });
            }
        });

        // Monitor the fileToUpload signal for the file being reset to null. If
        // so, also reset the native control's file.
        effect(() => {
            const fileToUpload = this.fileToUpload();

            if (fileToUpload === null) {
                const control = this._fileUploadControl();
                if (control) {
                    control.nativeElement.value = null;
                }
            }
        });

        this._destroyRef.onDestroy(() => {
            this._focusSubscription?.unsubscribe();
        });
    }

    public async pasteImage(): Promise<void> {
        if (this.clipboardHasImage()) {
            const clipboardItems = await navigator.clipboard.read();
            for (const item of clipboardItems) {
                if (
                    item.types.includes('image/png') ||
                    item.types.includes('image/jpeg')
                ) {
                    const imageBlob =
                        (await item.getType('image/png')) ||
                        (await item.getType('image/jpeg'));
                    const fileName =
                        'Pasted' +
                        (imageBlob.type === 'image/png' ? '.png' : '.jpg');
                    const file = new File([imageBlob], fileName, {
                        type: imageBlob.type,
                    });

                    this.fileToUpload.set(file);
                    break;
                }
            }
        }
    }

    private async _gotFocus(): Promise<void> {
        const clipboardHasImage = await this._clipboardHasImage();
        this.clipboardHasImage.set(clipboardHasImage);
    }

    private async _clipboardHasImage(): Promise<boolean> {
        try {
            const clipboardItems = await navigator.clipboard.read();
            for (const item of clipboardItems) {
                if (
                    item.types.includes('image/png') ||
                    item.types.includes('image/jpeg')
                ) {
                    return true;
                }
            }
        } catch {
            console.log('No permissions granted for reading clipboard.');
        }

        return false;
    }
}
