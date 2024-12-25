import { inject, Pipe, PipeTransform } from '@angular/core';
import { getCachedDownloadUrl, STORAGE } from '../firestore';

/**
 * Given an internal Firebase storage path, produces the publicly available
 * download URL.
 */
@Pipe({
    name: 'uploadedFileUrl',
    pure: true,
})
export class FirebaseUploadedFileUrlPipe implements PipeTransform {
    private _storage = inject(STORAGE);

    public async transform(path: string | null): Promise<string> {
        if (path === null) {
            return '';
        }

        return await getCachedDownloadUrl(this._storage, path);
    }
}
