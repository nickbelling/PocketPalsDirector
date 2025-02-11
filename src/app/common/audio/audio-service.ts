import { Injectable, signal } from '@angular/core';

/** A service for playing audio. */
@Injectable({
    providedIn: 'root',
})
export class AudioService {
    /**
     * Use to globally disable audio for the entire application. Anything
     * attempting to play audio via the `playAudio()` function will silently
     * fail. When playing audio elsewhere (e.g. via an `<audio>` or `<video>`
     * element in a component template) check this Signal to determine whether
     * that element should be muted.
     */
    public readonly audioEnabled = signal<boolean>(true);

    /**
     * Loads and plays the given audio source file.
     * @param src A link to the audio to be played.
     * @param forcePlay Whether or not
     * @returns A reference to the audio element, so that you can later call
     * `stop()` if necessary.
     */
    public async playAudio(
        src: string,
        forcePlay: boolean = false,
    ): Promise<HTMLAudioElement> {
        const audio = new Audio(src);

        if (!this.audioEnabled() && !forcePlay) {
            audio.volume = 0;
        } else {
            audio.volume = 1;
        }

        await audio.play();
        return audio;
    }
}
