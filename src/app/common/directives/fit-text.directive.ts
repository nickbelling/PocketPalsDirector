import {
    AfterViewInit,
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

    private _originalFontSize?: number = undefined;
    private _el = inject(ElementRef);

    public ngAfterViewInit(): void {
        this._originalFontSize = parseFloat(
            window
                .getComputedStyle(this._el.nativeElement, null)
                .getPropertyValue('font-size'),
        );

        this.adjustFontSize();
    }

    public ngOnChanges(): void {
        // The text has changed. Readjust the font
        requestAnimationFrame(() => {
            this.adjustFontSize();
        });
    }

    private adjustFontSize(): void {
        if (this._originalFontSize !== undefined) {
            const element = this._el.nativeElement;
            let fontSize = this._originalFontSize;
            element.style.fontSize = `${fontSize}px`;
            element.style.lineHeight = `${fontSize}px`;

            // Keep shrinking the text until it fits
            while (
                element.scrollHeight > element.clientHeight ||
                element.scrollWidth > element.clientWidth
            ) {
                fontSize--;
                element.style.fontSize = `${fontSize}px`;
                element.style.lineHeight = `${fontSize}px`;
            }
        }
    }
}
