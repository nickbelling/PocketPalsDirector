import { inject, Injectable, signal } from '@angular/core';
import { getCachedDownloadUrl, STORAGE } from '../firestore';

@Injectable({
    providedIn: 'root',
})
export class SoundService {
    private _storage = inject(STORAGE);

    public readonly soundEnabled = signal<boolean>(true);

    public async playStorageSound(
        firebasePath: string,
        forcePlay: boolean = false,
    ): Promise<void> {
        const downloadUrl = await getCachedDownloadUrl(
            this._storage,
            firebasePath,
        );

        if (downloadUrl) {
            await this.playSound(downloadUrl, forcePlay);
        }
    }

    public async playSound(
        src: string,
        forcePlay: boolean = false,
    ): Promise<void> {
        const audio = new Audio(src);

        if (!this.soundEnabled() && !forcePlay) {
            audio.volume = 0;
        } else {
            audio.volume = 1;
        }

        await audio.play();
    }
}
