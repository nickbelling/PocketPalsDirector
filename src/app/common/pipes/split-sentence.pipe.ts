import { Pipe, PipeTransform } from '@angular/core';
import { getSentenceArray } from '../utils';

/**
 * Given a string, splits it into sentences, and then gets the first N
 * sentences.
 *
 * For example, if the text was:
 *
 * const text = "This. Then this. And then this."
 *
 * * `text | splitSentence: 1` would be "This."
 * * `text | splitSentence: 2` would be "This. Then this."
 * * `text | splitSentence: 0` would be "".
 *
 * Adding "invert" will get the remaining sentences for the given number.
 * Therefore:
 *
 * * `text | splitSentence: 1: true` would be "Then this. And then this."
 * * `text | splitSentence: 2` would be "And then this."
 * * `text | splitSentence: 0` would be "This. Then this. And then this.".
 */
@Pipe({
    name: 'splitSentence',
    pure: true,
})
export class SplitSentencePipe implements PipeTransform {
    public transform(
        text: string,
        sentencesToGet: number,
        invert: boolean = false,
    ): string {
        const sentences = getSentenceArray(text);

        if (invert) {
            return sentences.slice(sentencesToGet).join('');
        } else {
            return sentences.slice(0, sentencesToGet).join('');
        }
    }
}

/** Gets the sentence segment at the given index. */
@Pipe({
    name: 'splitSentenceAtIndex',
    pure: true,
})
export class SplitSentenceAtIndexPipe implements PipeTransform {
    public transform(text: string, index: number): string {
        const sentences = getSentenceArray(text);
        return sentences[index];
    }
}

/**
 * Gets the amount of sentences in the given array.
 */
@Pipe({
    name: 'splitSentenceCount',
    pure: true,
})
export class SplitSentenceCountPipe implements PipeTransform {
    public transform(text: string): number {
        const sentences = getSentenceArray(text);
        return sentences.length;
    }
}
