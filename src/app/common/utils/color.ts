/** Returns true if the given string is a valid CSS color. */
export function isValidColor(strColor: string): boolean {
    return CSS.supports('color', strColor);
}
