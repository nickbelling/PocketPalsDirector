import { inject, Injectable } from '@angular/core';
import { getCachedDownloadUrl, STORAGE } from '../firestore';

@Injectable({
    providedIn: 'root',
})
export class VideoService {
    private _storage = inject(STORAGE);

    public async preloadStorageVideo(firebasePath: string): Promise<Blob> {
        const downloadUrl = await getCachedDownloadUrl(
            this._storage,
            firebasePath,
        );

        if (downloadUrl) {
            return await this.preloadVideo(downloadUrl);
        } else {
            throw new Error(
                `Could not get a download URL for Firebase path '${firebasePath}'.`,
            );
        }
    }

    public preloadVideo(src: string): Promise<Blob> {
        return new Promise<Blob>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', src, true);
            xhr.responseType = 'arraybuffer';

            xhr.onload = () => {
                const blob = new Blob([xhr.response], {
                    type: xhr.getResponseHeader('Content-Type') || undefined,
                });
                resolve(blob);
            };
            xhr.onerror = (error) => reject(error);

            xhr.send();
        });
    }
}
