/** Returns true if the given string is a valid CSS color. */
export function isValidColor(strColor: string): boolean {
    const style: CSSStyleDeclaration = new Option().style;
    style.color = strColor;

    // style.color is '' by default, if not '' then successfully set.
    return style.color !== '';
}
