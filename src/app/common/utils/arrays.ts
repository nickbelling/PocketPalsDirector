/** Returns true if the given arrays are equal. */
export function arraysAreEqual<T>(
    a: T[],
    b: T[],
    ignoreOrder: boolean = false,
): boolean {
    if (a.length !== b.length) return false;

    if (ignoreOrder) {
        const sortedA = [...a].sort();
        const sortedB = [...b].sort();
        for (let i = 0; i < sortedA.length; i++) {
            if (sortedA[i] !== sortedB[i]) {
                return false;
            }
        }
        return true;
    }

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
}
