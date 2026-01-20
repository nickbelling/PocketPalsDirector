/**
 * Given a number (e.g. 3) converts it to the relevant column number (e.g. "C").
 *
 * When the number exceeds 26, will create an Excel-style column (e.g. so 27
 * will become AA, etc).
 */
export function numberToColumnLabel(num: number): string {
    if (num <= 0) {
        return '';
    }

    let result = '';
    let current = num;

    while (current > 0) {
        current--; // Excel columns are 1-based
        result = String.fromCharCode(65 + (current % 26)) + result;
        current = Math.floor(current / 26);
    }

    return result;
}

export function columnLabelToNumber(label: string): number {
    let result = 0;

    for (const char of label) {
        result = result * 26 + (char.charCodeAt(0) - 64);
    }

    return result;
}

export function toGridRefString(
    ref: number,
    cols: number,
    rows: number,
): string {
    if (ref <= 0) return '';

    const column = ((ref - 1) % cols) + 1;
    const row = Math.floor((ref - 1) / cols) + 1;

    return `${numberToColumnLabel(column)}${row}`;
}

export function fromGridRefString(
    value: string,
    cols: number,
    rows: number,
): number {
    const match = /^([A-Z]+)(\d+)$/.exec(value.toUpperCase());
    if (!match) return 0;

    const [, colLabel, rowStr] = match;

    const column = columnLabelToNumber(colLabel);
    const row = Number(rowStr);

    if (column < 1 || column > cols || row < 1 || row > rows) {
        return 0;
    }

    return (row - 1) * cols + column;
}

export function gridRefStringIsValid(value: string): boolean {
    return fromGridRefString(value, 10, 10) !== 0;
}
