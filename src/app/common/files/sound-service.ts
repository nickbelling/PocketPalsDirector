import { Injectable, signal } from '@angular/core';
import { resolveStorageUrl } from '../firestore';

@Injectable({
    providedIn: 'root',
})
export class SoundService {
    public readonly soundEnabled = signal<boolean>(true);

    public async playStorageSound(
        firebasePath: string,
        forcePlay: boolean = false,
    ): Promise<void> {
        const downloadUrl = resolveStorageUrl(firebasePath);
        await this.playSound(downloadUrl, forcePlay);
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
