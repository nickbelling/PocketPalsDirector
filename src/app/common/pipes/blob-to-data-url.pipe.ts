import { DestroyRef, inject, Pipe, PipeTransform } from '@angular/core';

/**
 * Converts a {@link Blob} object to a data URL that can be used as the "src"
 * of an `<image>`, `<audio>` or other media element.
 *
 * Also handles cleaning up the generated URL, which will be revoked when the
 * pipe is destroyed.
 */
@Pipe({
    name: 'blobToUrl',
    pure: true,
})
export class BlobToUrlPipe implements PipeTransform {
    // Stores the generated URL for later cleanup.
    private _url: string | null = null;

    constructor() {
        inject(DestroyRef).onDestroy(() => {
            this._cleanUp();
        });
    }

    public transform(value: Blob | null): string | null {
        this._cleanUp();

        if (value) {
            this._url = URL.createObjectURL(value);
        }

        return this._url;
    }

    /** Revokes the generated URL to prevent memory leakage. */
    private _cleanUp(): void {
        if (this._url) {
            URL.revokeObjectURL(this._url);
            this._url = null;
        }
    }
}
