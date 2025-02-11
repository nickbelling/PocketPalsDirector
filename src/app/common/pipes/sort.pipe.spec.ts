import { SortPipe } from './sort.pipe';

describe('SortPipe', () => {
    let pipe: SortPipe;

    beforeEach(() => {
        pipe = new SortPipe();
    });

    it('should create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should sort an array of numbers', () => {
        const input = [5, 3, 8, 1];
        const expected = [1, 3, 5, 8];
        expect(pipe.transform(input)).toEqual(expected);
    });

    it('should sort an array of strings', () => {
        const input = ['delta', 'alpha', 'charlie', 'bravo'];
        const expected = ['alpha', 'bravo', 'charlie', 'delta'];
        expect(pipe.transform(input)).toEqual(expected);
    });

    it('should sort an array of objects based on the provided property', () => {
        const input = [
            { id: 3, name: 'gamma' },
            { id: 1, name: 'alpha' },
            { id: 2, name: 'beta' },
        ];
        // Sorting by "id"
        expect(pipe.transform(input, 'id')).toEqual([
            { id: 1, name: 'alpha' },
            { id: 2, name: 'beta' },
            { id: 3, name: 'gamma' },
        ]);

        // Sorting by "name"
        expect(pipe.transform(input, 'name')).toEqual([
            { id: 1, name: 'alpha' },
            { id: 2, name: 'beta' },
            { id: 3, name: 'gamma' },
        ]);
    });

    it('should not mutate the original array', () => {
        const input = [5, 3, 8, 1];
        const copy = [...input];
        pipe.transform(input);
        expect(input).toEqual(copy);
    });

    it('should return the input if it is not an array', () => {
        const notAnArray: any = 'not an array';
        expect(pipe.transform(notAnArray)).toBe(notAnArray);
    });
});
