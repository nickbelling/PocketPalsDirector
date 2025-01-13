/** Asynchronously sleeps for the specified number of milliseconds. */
export function sleep(duration: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, duration);
    });
}
