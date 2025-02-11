import {
    filterByQuery,
    getSentenceArray,
    isFuzzyMatch,
    normalizeTitle,
} from './text';

const games = [
    { id: 1, name: "Assassin's Creed: Brotherhood", year: 2009 },
    { id: 2, name: 'Pokémon: Red Version', year: 1998 },
    { id: 3, name: 'Pokémon: FireRed Version', year: 2004 },
    { id: 4, name: 'The Legend of Zelda: Ocarina of Time', year: 1998 },
    { id: 5, name: 'Call of Duty 4: Modern Warfare', year: 2007 },
];

const gameNames = games.map((g) => g.name);

describe('isFuzzyMatch', () => {
    it('should match exact phrases', () => {
        const match = isFuzzyMatch(
            "Assassin's Creed: Brotherhood",
            "Assassin's Creed: Brotherhood",
        );
        expect(match).toBe(true);
    });

    it('should match case-insensitively', () => {
        const result = isFuzzyMatch(
            "Assassin's Creed: Brotherhood",
            "assassin's creed: brotherhood",
        );
        expect(result).toBe(true);
    });

    it('should match with partial input', () => {
        const result = isFuzzyMatch(
            "Assassin's Creed: Brotherhood",
            'assassins creed',
        );
        expect(result).toBe(true);
    });

    it('should match with flexible word order', () => {
        const result = isFuzzyMatch(
            "Assassin's Creed: Brotherhood",
            'creed assassins',
        );
        expect(result).toBe(true);
    });

    it('should ignore special characters and punctuation', () => {
        const result = isFuzzyMatch(
            "Assassin's Creed: Brotherhood",
            'assassins creed brotherhood',
        );
        expect(result).toBe(true);
    });

    it('should match despite accents and diacritics', () => {
        const result = isFuzzyMatch(
            'Pokémon: FireRed Version',
            'pokemon fire red',
        );
        expect(result).toBe(true);
    });
});

describe('filterByQuery', () => {
    it('should return multiple matches if applicable', () => {
        const result = filterByQuery(gameNames, 'pokemon red');
        expect(result).toEqual([
            'Pokémon: Red Version',
            'Pokémon: FireRed Version',
        ]);
    });

    it('should return an empty array when no matches are found', () => {
        const result = filterByQuery(gameNames, 'super mario');
        expect(result).toEqual([]);
    });

    it('should handle an empty query gracefully', () => {
        const result = filterByQuery(gameNames, '');
        expect(result).toEqual(gameNames);
    });

    it('should handle an empty array gracefully', () => {
        const result = filterByQuery([], 'pokemon');
        expect(result).toEqual([]);
    });

    it('should match objects using a predicate', () => {
        const result = filterByQuery(
            games,
            'assassins brotherhood',
            (game) => game.name,
        );
        expect(result).toEqual([
            { id: 1, name: "Assassin's Creed: Brotherhood", year: 2009 },
        ]);
    });

    it('should match objects based on multiple words in a different order', () => {
        const result = filterByQuery(
            games,
            'time ocarina',
            (game) => game.name,
        );
        expect(result).toEqual([
            { id: 4, name: 'The Legend of Zelda: Ocarina of Time', year: 1998 },
        ]);
    });

    it('should match objects when the predicate considers additional fields', () => {
        const result = filterByQuery(
            games,
            '2007 modern warfare',
            (game) => `${game.name} ${game.year}`,
        );
        expect(result).toEqual([
            { id: 5, name: 'Call of Duty 4: Modern Warfare', year: 2007 },
        ]);
    });

    it('should return an empty array when no objects match', () => {
        const result = filterByQuery(games, 'Halo', (game) => game.name);
        expect(result).toEqual([]);
    });

    it('should match strings case-insensitively', () => {
        const result = filterByQuery(gameNames, 'pokÉmon RED');
        expect(result).toEqual([
            'Pokémon: Red Version',
            'Pokémon: FireRed Version',
        ]);
    });

    it('should match objects case-insensitively when using a predicate', () => {
        const result = filterByQuery(games, 'zelda ocarina', (game) =>
            game.name.toUpperCase(),
        );
        expect(result).toEqual([
            { id: 4, name: 'The Legend of Zelda: Ocarina of Time', year: 1998 },
        ]);
    });

    it('should ignore special characters when matching', () => {
        const result = filterByQuery(gameNames, 'assassins creed brotherhood');
        expect(result).toEqual(["Assassin's Creed: Brotherhood"]);
    });

    it('should match objects with non-string fields when using JSON.stringify', () => {
        const result = filterByQuery(games, '1998', JSON.stringify);
        expect(result).toEqual([
            { id: 2, name: 'Pokémon: Red Version', year: 1998 },
            { id: 4, name: 'The Legend of Zelda: Ocarina of Time', year: 1998 },
        ]);
    });

    it('should fallback to JSON.stringify when no predicate is provided for objects', () => {
        const result = filterByQuery(games, 'brotherhood');
        expect(result).toEqual([
            { id: 1, name: "Assassin's Creed: Brotherhood", year: 2009 },
        ]);
    });
});

describe('getSentenceArray', () => {
    it('should return the original text in an array if no splitting punctuation is present', () => {
        const text = 'No punctuation at all';
        expect(getSentenceArray(text)).toEqual([text]);
    });

    it('should split text into sentences based on ending punctuation', () => {
        const text = 'Hello. How are you? I am fine!';
        const sentences = getSentenceArray(text);
        // Expected three sentences:
        // "Hello. ", "How are you? " and "I am fine!"
        expect(sentences.length).toBe(3);
        expect(sentences[0]).toBe('Hello. ');
        expect(sentences[1]).toBe('How are you? ');
        expect(sentences[2]).toBe('I am fine!');
    });

    it('should split text on newlines', () => {
        const text = 'Item one\nItem two\nItem three';
        const sentences = getSentenceArray(text);
        // The regex should match at each newline.
        expect(sentences.length).toBe(3);
        expect(sentences[0]).toBe('Item one\n');
        expect(sentences[1]).toBe('Item two\n');
        expect(sentences[2]).toBe('Item three');
    });

    it('should split a list separated by commas into individual segments', () => {
        const text = 'Apples, Oranges, Bananas.';
        const sentences = getSentenceArray(text);
        // Expect each comma to be treated as a splitting point:
        // e.g. "Apples, ", "Oranges, " and "Bananas."
        expect(sentences.length).toBe(3);
        expect(sentences[0]).toBe('Apples, ');
        expect(sentences[1]).toBe('Oranges, ');
        expect(sentences[2]).toBe('Bananas.');
    });

    it('should handle multiple punctuation marks in a row', () => {
        const text = 'Really?! No way.';
        const sentences = getSentenceArray(text);
        // The regex should extend to the punctuation that is followed by a
        // valid white space/newline.
        expect(sentences.length).toBe(2);
        expect(sentences[0]).toBe('Really?! ');
        expect(sentences[1]).toBe('No way.');
    });

    it('should split text on newlines even if there is no terminal punctuation', () => {
        const text = 'This is a sentence\nAnd another line';
        const sentences = getSentenceArray(text);
        expect(sentences.length).toBe(2);
        expect(sentences[0]).toContain('This is a sentence');
        expect(sentences[1]).toContain('And another line');
    });

    it('should handle text that ends with punctuation but no trailing whitespace', () => {
        const text = 'Hello world!How are you?';
        const sentences = getSentenceArray(text);
        expect(sentences[0]).toBe(text);
    });

    it('should handle multiple consecutive newlines', () => {
        const text = 'Line one\n\nLine two';
        const sentences = getSentenceArray(text);
        expect(sentences.length).toBe(2);
        expect(sentences[0]).toContain('Line one\n');
        expect(sentences[1]).toContain('Line two');
    });

    it('should split on colons as well', () => {
        const text = 'Warning: Do not enter: this is private.';
        const sentences = getSentenceArray(text);
        expect(sentences.length).toBe(3);
        expect(sentences[0]).toBe('Warning: ');
        expect(sentences[1]).toBe('Do not enter: ');
        expect(sentences[2]).toBe('this is private.');
    });

    it('should return an array containing an empty string when given an empty string', () => {
        const text = '';
        const sentences = getSentenceArray(text);
        expect(sentences).toEqual(['']);
    });
});

describe('normalizeTitle', () => {
    it('should remove leading "The " from titles', () => {
        expect(normalizeTitle('The Legend of Zelda')).toBe('Legend of Zelda');
    });

    it('should remove leading "the " regardless of case', () => {
        expect(normalizeTitle('the Last of Us')).toBe('Last of Us');
        expect(normalizeTitle('tHe Chronicles of Narnia')).toBe(
            'Chronicles of Narnia',
        );
    });

    it('should not modify titles that do not start with an article', () => {
        expect(normalizeTitle('Legend of Zelda')).toBe('Legend of Zelda');
        expect(normalizeTitle('Super Mario 64')).toBe('Super Mario 64');
    });

    it('should not remove an article if it is not followed by whitespace', () => {
        expect(normalizeTitle('TheLegend')).toBe('TheLegend');
    });

    it('should remove articles even if followed by multiple spaces', () => {
        expect(normalizeTitle('The   Legend of Zelda')).toBe('Legend of Zelda');
    });

    it('should return an empty string when the title is just an article with trailing whitespace', () => {
        expect(normalizeTitle('The ')).toBe('');
    });
});
