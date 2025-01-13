/**
 * Preloads all of the given audio URLs.
 */
export async function preloadAudio(audioUrls: string[]): Promise<void> {
    const preloadAudio = (src: string) =>
        new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.onload = resolve;
            audio.onerror = reject;
            audio.src = src;
            audio.load();
        });

    await Promise.all(audioUrls.map(preloadAudio));
}
