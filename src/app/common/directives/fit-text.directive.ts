import {
    AfterViewInit,
    Directive,
    ElementRef,
    inject,
    input,
    OnChanges,
} from '@angular/core';

@Directive({
    selector: '[fitText]',
})
export class FitTextDirective implements OnChanges, AfterViewInit {
    public fitText = input.required<string>();
    private _originalFontSize?: number = undefined;
    private _el = inject(ElementRef);

    public ngAfterViewInit(): void {
        this._originalFontSize = parseFloat(
            window
                .getComputedStyle(this._el.nativeElement, null)
                .getPropertyValue('font-size')
        );

        this.adjustFontSize();
    }

    public ngOnChanges(): void {
        setTimeout(() => {
            this.adjustFontSize();
        });
    }

    private adjustFontSize() {
        if (this._originalFontSize !== undefined) {
            const element = this._el.nativeElement;
            let fontSize = this._originalFontSize;
            element.style.fontSize = `${fontSize}px`;
            element.style.lineHeight = `${fontSize}px`;

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
