import { filterByQuery, isFuzzyMatch } from './text';

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
