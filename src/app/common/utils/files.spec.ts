import { fileTypeMatchesInputPattern as matches } from './files';

describe('fileTypeMatchesInputPattern', () => {
    it('should match exact MIME types', () => {
        expect(matches('image/png', 'image/png')).toBe(true);
        expect(matches('image/png', 'image/jpeg')).toBe(false);
    });

    it('should match wildcard MIME types', () => {
        expect(matches('image/png', 'image/*')).toBe(true);
        expect(matches('audio/mp3', 'audio/*')).toBe(true);
        expect(matches('application/pdf', 'image/*')).toBe(false);
    });

    it('should match when multiple patterns are provided', () => {
        expect(matches('image/png', 'audio/*, image/png')).toBe(true);
        expect(matches('image/png', 'audio/*, application/pdf')).toBe(false);
        expect(matches('application/pdf', 'image/*, application/pdf')).toBe(
            true,
        );
    });

    it('should handle patterns with extra whitespace', () => {
        expect(matches('image/png', '  image/* ,   application/pdf ')).toBe(
            true,
        );
        expect(
            matches('application/pdf', '  image/* ,   application/pdf '),
        ).toBe(true);
        expect(matches('audio/mp3', '  image/* ,   application/pdf ')).toBe(
            false,
        );
    });

    it('should return true when pattern is empty or only whitespace', () => {
        expect(matches('image/png', '')).toBe(true);
        expect(matches('image/png', '   ')).toBe(true);
    });

    it('should match any file type when pattern is "*/*"', () => {
        expect(matches('image/png', '*/*')).toBe(true);
        expect(matches('application/pdf', '*/*')).toBe(true);
    });
});
