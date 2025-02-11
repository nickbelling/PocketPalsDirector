import { Component, input } from '@angular/core';
import { FitTextDirective } from './../../directives/fit-text.directive';

/**
 * A component that uses pure CSS to fit the given text within its parent. You
 * should use the CSS variable `--max-font-size` to fix the text's maximum size
 * to a reasonable amount if the text may be short - otherwise it may grow very
 * large.
 *
 * The CSS technique is adapted from https://kizu.dev/fit-to-width/.
 *
 * Note that this is NOT the same as the {@link FitTextDirective}. That
 * directive shrinks text using JavaScript until it fits within its parent. This
 * uses a CSS technique that will cause the text to ONLY fit on a single line.
 * While certainly more performant, it's not as flexible for Pocket Pals' use -
 * we sometimes prefer multi-line shrunk text (as long as it fits within its
 * container). In those cases, use {@link FitTextDirective}. If a single line
 * is acceptable, use this component.
 *
 * @example
 * ```html
 * <fit-text text="My very long text" />
 * <fit-text [text]="someStringVariable" />
 * ```
 */
@Component({
    selector: 'fit-text',
    templateUrl: './fit-text.html',
    styleUrl: './fit-text.scss',
})
export class FitText {
    // TODO: Allow this component to not require a text input and instead parse
    // its contents (e.g. <fit-text>My long text</fit-text>).

    /** The text to shrink to the parent. */
    public readonly text = input.required<string | number>();
}
