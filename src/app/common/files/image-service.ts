import { inject, Injectable } from '@angular/core';
import { getCachedDownloadUrl, STORAGE } from '../firestore';

@Injectable({
    providedIn: 'root',
})
export class ImageService {
    private _storage = inject(STORAGE);

    public async preloadStorageImage(firebasePath: string): Promise<string> {
        const downloadUrl = await getCachedDownloadUrl(
            this._storage,
            firebasePath,
        );

        if (downloadUrl) {
            return await this.preloadImage(downloadUrl);
        } else {
            throw new Error(
                `Could not get a download URL for Firebase path '${firebasePath}'.`,
            );
        }
    }

    public preloadImage(src: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', src, true);
            xhr.responseType = 'arraybuffer';

            xhr.onload = () => {
                const blob = new Blob([xhr.response], {
                    type: xhr.getResponseHeader('Content-Type') || undefined,
                });
                resolve(URL.createObjectURL(blob));
            };
            xhr.onerror = (error) => reject(error);

            xhr.send();
        });
    }
}
