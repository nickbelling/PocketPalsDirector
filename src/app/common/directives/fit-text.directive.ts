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
        if (this._originalFontSize == null) return;

        const el = this._el.nativeElement as HTMLElement;

        let min = this.fitTextMinSize();
        let max = Math.floor(this._originalFontSize);
        let best = min;

        while (min <= max) {
            const mid = (min + max) >> 1;
            el.style.fontSize = `${mid}px`;

            // Read after write
            const availableHeight = el.clientHeight;
            const availableWidth = el.clientWidth;
            const neededHeight = el.scrollHeight;
            const neededWidth = el.scrollWidth;

            const fits =
                neededHeight <= availableHeight &&
                neededWidth <= availableWidth;

            if (fits) {
                best = mid;
                min = mid + 1;
            } else {
                max = mid - 1;
            }
        }

        el.style.fontSize = `${best}px`;
    }
}
