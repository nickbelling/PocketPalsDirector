/** Returns a random item from the given array. */
export function getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

/** Returns a copy of the given array with the items in a randomized order. */
export function randomizeItems<T>(sorted: T[]): T[] {
    const array = [...sorted];
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
