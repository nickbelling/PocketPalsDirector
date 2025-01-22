import {
    AfterViewInit,
    DestroyRef,
    Directive,
    ElementRef,
    inject,
    input,
    OnChanges,
} from '@angular/core';

/**
 * Place on an element to cause it to adjust its font size until all of the text
 * inside the element fits on-screen. Pass in a copy of the text being displayed
 * so that it can be monitored for changes if necessary.
 */
@Directive({
    selector: '[fitText]',
})
export class FitTextDirective implements OnChanges, AfterViewInit {
    /** The text being fit into this element. Used to monitor for changes. */
    public fitText = input.required<string>();
    public fitTextMinSize = input<number>(10);

    private _originalFontSize?: number = undefined;
    private _el = inject(ElementRef);
    private _resizeObserver?: ResizeObserver;

    constructor() {
        inject(DestroyRef).onDestroy(() => {
            if (this._resizeObserver) {
                this._resizeObserver.disconnect();
            }
        });
    }

    public ngAfterViewInit(): void {
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
        }

        this._resizeObserver = new ResizeObserver((resize) => {
            this._setOriginalSize();
            this._adjustFontSize();
        });

        this._resizeObserver.observe(this._el.nativeElement);

        // This has to occur after an animation frame, otherwise a font style
        // applied to the element's class may not yet be loaded.
        requestAnimationFrame(() => {
            this._setOriginalSize();
            this._adjustFontSize();
        });
    }

    public ngOnChanges(): void {
        // The text has changed. Readjust the font
        requestAnimationFrame(() => {
            this._adjustFontSize();
        });
    }

    private _setOriginalSize(): void {
        this._el.nativeElement.style.fontSize = null;
        this._originalFontSize = parseFloat(
            window
                .getComputedStyle(this._el.nativeElement, null)
                .getPropertyValue('font-size'),
        );
    }

    private _adjustFontSize(): void {
        if (this._originalFontSize !== undefined) {
            const element = this._el.nativeElement;

            // Cache the element's dimensions outside the loop (as each of
            // these cause a layout recalculation)
            const styles = getComputedStyle(element);
            const clientHeight = Math.round(parseFloat(styles.height));
            const clientWidth = Math.round(parseFloat(styles.width));

            if (clientHeight > 0 && clientWidth > 0) {
                let minSize = this.fitTextMinSize();
                let maxSize = Math.floor(this._originalFontSize);
                let fontSize = maxSize;

                let adjustments = 0;
                // Apply a binary search to find the optimal font size
                while (minSize <= maxSize) {
                    const midSize = Math.floor((minSize + maxSize) / 2);
                    element.style.fontSize = `${midSize}px`;

                    const scrollHeight = element.scrollHeight;
                    const scrollWidth = element.scrollWidth;

                    // Check if the current font size fits within the element
                    if (
                        scrollHeight <= clientHeight &&
                        scrollWidth <= clientWidth
                    ) {
                        // Font size fits, try a larger size
                        fontSize = midSize;
                        minSize = midSize + 1;
                    } else {
                        // Font size does not fit, try a smaller size
                        maxSize = midSize - 1;
                    }

                    adjustments++;
                }

                // Apply the final font size
                element.style.fontSize = `${fontSize}px`;
            }
        }
    }
}
