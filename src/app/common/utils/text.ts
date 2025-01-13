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
