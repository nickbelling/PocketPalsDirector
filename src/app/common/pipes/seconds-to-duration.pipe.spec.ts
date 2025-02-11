import { SecondsToDurationPipe } from './seconds-to-duration.pipe';

describe('SecondsToDurationPipe', () => {
    let pipe: SecondsToDurationPipe;

    beforeEach(() => {
        pipe = new SecondsToDurationPipe();
    });

    it('should create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should format 65 seconds as "1:05"', () => {
        expect(pipe.transform(65)).toBe('1:05');
    });

    it('should format 60 seconds as "1:00"', () => {
        expect(pipe.transform(60)).toBe('1:00');
    });

    it('should format 30 seconds as 0:30', () => {
        expect(pipe.transform(30)).toBe('0:30');
    });

    it('should format 0 seconds as "0:00"', () => {
        expect(pipe.transform(0)).toBe('0:00');
    });

    it('should format 130 seconds as "2:10"', () => {
        expect(pipe.transform(130)).toBe('2:10');
    });

    it('should use the absolute value of the amount of time', () => {
        expect(pipe.transform(65)).toBe('1:05');
        expect(pipe.transform(-65)).toBe('1:05');
    });

    it('should show milliseconds when showMillis is true', () => {
        expect(pipe.transform(65.5, true)).toBe('1:05.5');
        expect(pipe.transform(-65.5, true)).toBe('1:05.5');
    });
});
