/**
 * Given a block of text, splits it into an array of sentences.
 *
 * RegExes are damn near unreadable. Basically, this one splits a block of
 * text into sentences. It also handles when there is a newline or paragraph
 * break (and treats that as a "sentence" as well, e.g. a list of items).
 */
export function getSentenceArray(text: string): string[] {
    const pattern = /.*?[.,:!?](\s+|\n+|$)|.+?(\n+|$)/g;
    let matches = text.match(pattern);

    if (matches === null) {
        // Looks like the text wasn't able to be split (likely the original text
        // was just a single sentence). Instead, wrap the original text in an
        // array.
        return [text];
    } else {
        return matches.map((match) => match);
    }
}

/**
 * Normalizes the given string for fuzzy matches when searching.
 * @param text The text to normalize.
 * @returns The normalized text, ready for fuzzy matching.
 */
export function normalizeTextForFuzzyMatch(text: string): string {
    return text
        .toLowerCase() // Convert to lowercase
        .normalize('NFD') // Normalize accented characters
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .trim(); // Remove extra whitespace
}

/**
 * Returns true if the given query is a fuzzy match for the given term.
 * @param match The string to be matched against.
 * @param query The query being matched.
 * @returns True if the given query matches against the string.
 */
export function isFuzzyMatch(term: string, query: string): boolean {
    const normalizedTerm = normalizeTextForFuzzyMatch(term);
    const normalizedQueryWords = normalizeTextForFuzzyMatch(query).split(/\s+/);

    return normalizedQueryWords.every((word) => normalizedTerm.includes(word));
}

/**
 * Searches the given array for items which are fuzzy matches for the given
 * query.
 * @param items The array of items to search.
 * @param query The search term to look for.
 * @returns Items in the original array which are fuzzy matches for the given
 * query.
 */
export function filterByQuery(items: string[], query: string): string[];

/**
 * Searches the given array for items which are fuzzy matches for the given
 * query.
 * @param items The array of items to search.
 * @param query The search term to look for.
 * @param itemQueryStringPredicate An optional predicate of how to define the
 * term being searched for. For example, use `(item) => item.name` or some
 * other string predicate which the query should be matching against. If this is
 * not defined, this function will simply `JSON.stringify` the object, unless
 * type `T` is itself already a string.
 * @returns Items in the original array which are fuzzy matches for the given
 * query.
 */
export function filterByQuery<T>(
    items: T[],
    query: string,
    itemQueryStringPredicate?: (item: T) => string,
): T[];

/**
 * Searches the given array for items which are fuzzy matches for the given
 * query.
 * @param items The array of items to search.
 * @param query The search term to look for.
 * @param itemQueryStringPredicate An optional predicate of how to define the
 * term being searched for. For example, use `(item) => item.name` or some
 * other string predicate which the query should be matching against. If this is
 * not defined, this function will simply `JSON.stringify` the object, unless
 * type `T` is itself already a string.
 * @returns Items in the original array which are fuzzy matches for the given
 * query.
 */
export function filterByQuery<T>(
    items: T[],
    query: string,
    itemQueryStringPredicate?: (item: T) => string,
): T[] {
    return items.filter((item) => {
        const itemQueryString = itemQueryStringPredicate
            ? itemQueryStringPredicate(item)
            : typeof item === 'string'
              ? item
              : JSON.stringify(item);
        const normalizedItemName = normalizeTextForFuzzyMatch(itemQueryString);
        return isFuzzyMatch(normalizedItemName, query);
    });
}
