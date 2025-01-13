import { arraysAreEqual } from './equality';

describe('arraysAreEqual', () => {
    it('should return true for identical arrays', () => {
        expect(arraysAreEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    });

    it('should return false for arrays with different lengths', () => {
        expect(arraysAreEqual([1, 2, 3], [1, 2])).toBe(false);
    });

    it('should return false for arrays with different elements', () => {
        expect(arraysAreEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    });

    it('should return true for arrays with the same elements in different orders if ignoreOrder is true', () => {
        expect(arraysAreEqual([1, 2, 3], [3, 2, 1], true)).toBe(true);
    });

    it('should return false for arrays with the same elements in different orders if ignoreOrder is false', () => {
        expect(arraysAreEqual([1, 2, 3], [3, 2, 1], false)).toBe(false);
    });

    it('should return true for empty arrays', () => {
        expect(arraysAreEqual([], [])).toBe(true);
    });

    it('should return true for arrays with duplicate elements in the same order', () => {
        expect(arraysAreEqual([1, 2, 2, 3], [1, 2, 2, 3])).toBe(true);
    });

    it('should return true for arrays with duplicate elements in different orders if ignoreOrder is true', () => {
        expect(arraysAreEqual([1, 2, 2, 3], [2, 1, 3, 2], true)).toBe(true);
    });

    it('should return false for arrays with duplicate elements in different orders if ignoreOrder is false', () => {
        expect(arraysAreEqual([1, 2, 2, 3], [2, 1, 3, 2], false)).toBe(false);
    });

    it('should handle arrays with complex objects', () => {
        const obj1 = { id: 1 };
        const obj2 = { id: 2 };
        expect(arraysAreEqual([obj1, obj2], [obj1, obj2])).toBe(true);
        expect(arraysAreEqual([obj1, obj2], [obj2, obj1], true)).toBe(true);
        expect(arraysAreEqual([obj1, obj2], [obj2, obj1], false)).toBe(false);
    });
});
