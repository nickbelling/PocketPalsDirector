import { isSignal, Signal } from '@angular/core';

export function isNotEmpty(value: string | Signal<string>): boolean {
    if (isSignal(value)) {
        return value().trim().length > 0;
    } else {
        return value.trim.length > 0;
    }
}

export function isGreaterThanZero(value: number | Signal<number>): boolean {
    if (isSignal(value)) {
        return value() > 0;
    } else {
        return value > 0;
    }
}

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

export function isNotNull<T>(value: T | null | Signal<T | null>): boolean {
    if (isSignal(value)) {
        return value() !== null;
    } else {
        return value !== null;
    }
}
