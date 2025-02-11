import { NumberArrayPipe } from './number-array.pipe';

describe('NumberArrayPipe', () => {
    let pipe: NumberArrayPipe;

    beforeEach(() => {
        pipe = new NumberArrayPipe();
    });

    it('should create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should transform 3 into [1, 2, 3]', () => {
        expect(pipe.transform(3)).toEqual([1, 2, 3]);
    });

    it('should return an empty array when input is 0', () => {
        expect(pipe.transform(0)).toEqual([]);
    });

    it('should return an empty array when input is negative', () => {
        expect(pipe.transform(-5)).toEqual([]);
    });

    it('should handle decimal numbers by effectively flooring the input', () => {
        // Since Array.from uses ToLength internally, 3.5 becomes 3
        expect(pipe.transform(3.5)).toEqual([1, 2, 3]);
    });
});
