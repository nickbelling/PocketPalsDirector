import { default as deepEqual } from 'deep-equal';

/**
 * Returns true if the two given items are equal, regardless of type.
 * Checks objects for deep equality.
 */
export function isDeepEqual<T extends any>(a: T, b: T): boolean {
    return deepEqual(a, b);
}

/**
 * Returns true if the given arrays are equal.
 */
export function arraysAreEqual<T>(
    a: T[],
    b: T[],
    ignoreOrder: boolean = false,
): boolean {
    if (a.length !== b.length) return false;

    if (ignoreOrder) {
        const bCopy = [...b];

        for (let i = 0; i < a.length; i++) {
            const aItem = a[i];
            const indexOfB = bCopy.findIndex((bItem) =>
                isDeepEqual(aItem, bItem),
            );

            if (indexOfB === -1) {
                return false;
            }

            bCopy.splice(indexOfB, 1);
        }

        return true;
    } else {
        return a.every((item, index) => deepEqual(item, b[index]));
    }
}
