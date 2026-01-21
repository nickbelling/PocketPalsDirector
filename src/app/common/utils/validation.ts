import { isSignal, Signal } from '@angular/core';

/** Returns true if the given string is not empty. */
export function isNotEmpty(value: string | Signal<string>): boolean {
    if (isSignal(value)) {
        return value()?.trim().length > 0;
    } else {
        return value?.trim().length > 0;
    }
}

/** Returns true if the given number is greater than 0. */
export function isGreaterThanZero(value: number | Signal<number>): boolean {
    if (isSignal(value)) {
        return value() > 0;
    } else {
        return value > 0;
    }
}

/** Returns true if the given array has at least the given number of items. */
export function hasAtLeast<T>(
    count: number,
    array: T[] | Signal<T[]>,
): boolean {
    if (isSignal(array)) {
        return array().length >= count;
    } else {
        return array.length >= count;
    }
}

/** Returns true if the given value is not null. */
export function isNotNull<T>(value: T | null | Signal<T | null>): boolean {
    if (isSignal(value)) {
        return value() !== null;
    } else {
        return value !== null;
    }
}

/** Returns true if the given value is not undefined. */
export function isNotUndefined<T>(
    value: T | undefined | Signal<T | undefined>,
): boolean {
    if (isSignal(value)) {
        return value() !== undefined;
    } else {
        return value !== undefined;
    }
}

/** Returns true if the given value is not null or undefined. */
export function isNotNullOrUndefined<T>(
    value?: T | Signal<T | null | undefined>,
): boolean {
    return isNotNull(value) && isNotUndefined(value);
}
