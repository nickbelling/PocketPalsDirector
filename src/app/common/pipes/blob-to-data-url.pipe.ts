import { DestroyRef, inject, Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'blobToUrl',
    pure: true,
})
export class BlobToUrlPipe implements PipeTransform {
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

    private _cleanUp(): void {
        if (this._url) {
            URL.revokeObjectURL(this._url);
            this._url = null;
        }
    }
}
