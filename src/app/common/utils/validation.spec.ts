import { signal } from '@angular/core';
import {
    hasAtLeast,
    isGreaterThanZero,
    isNotEmpty,
    isNotNull,
    isNotNullOrUndefined,
    isNotUndefined,
} from './validation';

describe('isNotEmpty', () => {
    it('should return true for a non-empty signal string', () => {
        const sig = signal('hello');
        expect(isNotEmpty(sig)).toBe(true);
    });

    it('should return false for a whitespace-only signal string', () => {
        const sig = signal('    ');
        expect(isNotEmpty(sig)).toBe(false);
    });

    it('should return true for a non-empty plain string', () => {
        expect(isNotEmpty('hello')).toBe(true);
    });

    it('should return false for a whitespace-only plain string', () => {
        expect(isNotEmpty('    ')).toBe(false);
    });
});

describe('isGreaterThanZero', () => {
    it('should return true for plain numbers greater than 0', () => {
        expect(isGreaterThanZero(5)).toBe(true);
    });

    it('should return false for 0 or negative plain numbers', () => {
        expect(isGreaterThanZero(0)).toBe(false);
        expect(isGreaterThanZero(-3)).toBe(false);
    });

    it('should return true for signal numbers greater than 0', () => {
        expect(isGreaterThanZero(signal(5))).toBe(true);
    });

    it('should return false for signal numbers that are 0 or negative', () => {
        expect(isGreaterThanZero(signal(0))).toBe(false);
        expect(isGreaterThanZero(signal(-3))).toBe(false);
    });
});

describe('hasAtLeast', () => {
    it('should return true if a plain array has at least the given number of items', () => {
        expect(hasAtLeast(2, [1, 2, 3])).toBe(true);
    });

    it('should return false if a plain array has fewer items than the given count', () => {
        expect(hasAtLeast(4, [1, 2, 3])).toBe(false);
    });

    it('should work correctly for signal arrays', () => {
        const arrSignal = signal([1, 2, 3, 4]);
        expect(hasAtLeast(3, arrSignal)).toBe(true);
        expect(hasAtLeast(5, arrSignal)).toBe(false);
    });
});

describe('isNotNull', () => {
    it('should return true for plain non-null values', () => {
        expect(isNotNull('test')).toBe(true);
        expect(isNotNull(0)).toBe(true);
    });

    it('should return false for a plain null value', () => {
        expect(isNotNull(null)).toBe(false);
    });

    it('should work for signal values', () => {
        expect(isNotNull(signal('test'))).toBe(true);
        expect(isNotNull(signal(null))).toBe(false);
    });
});

describe('isNotUndefined', () => {
    it('should return true for defined plain values', () => {
        expect(isNotUndefined('test')).toBe(true);
        expect(isNotUndefined(0)).toBe(true);
        expect(isNotUndefined(null)).toBe(true);
    });

    it('should return false for plain undefined', () => {
        expect(isNotUndefined(undefined)).toBe(false);
    });

    it('should work for signal values', () => {
        expect(isNotUndefined(signal('test'))).toBe(true);
        expect(isNotUndefined(signal(undefined))).toBe(false);
    });
});

describe('isNotNullOrUndefined', () => {
    it('should return true for plain, defined, non-null values', () => {
        expect(isNotNullOrUndefined('test')).toBe(true);
        expect(isNotNullOrUndefined(0)).toBe(true);
    });

    it('should return false for plain null or undefined values', () => {
        expect(isNotNullOrUndefined(null)).toBe(false);
        expect(isNotNullOrUndefined(undefined)).toBe(false);
    });

    it('should work for signal values', () => {
        expect(isNotNullOrUndefined(signal('test'))).toBe(true);
        expect(isNotNullOrUndefined(signal(null))).toBe(false);
        expect(isNotNullOrUndefined(signal(undefined))).toBe(false);
    });
});
