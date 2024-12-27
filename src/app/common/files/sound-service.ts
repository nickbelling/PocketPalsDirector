import { inject, Injectable, signal } from '@angular/core';
import { getCachedDownloadUrl, STORAGE } from '../firestore';

@Injectable({
    providedIn: 'root',
})
export class SoundService {
    private _storage = inject(STORAGE);

    public readonly soundEnabled = signal<boolean>(true);

    public async playStorageSound(firebasePath: string): Promise<void> {
        const downloadUrl = await getCachedDownloadUrl(
            this._storage,
            firebasePath,
        );

        await this.playSound(downloadUrl);
    }

    public async playSound(src: string): Promise<void> {
        if (!this.soundEnabled()) {
            return;
        }

        const audio = new Audio(src);
        await audio.play();
    }
}
