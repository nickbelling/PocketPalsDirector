import {
    Component,
    computed,
    DestroyRef,
    effect,
    ElementRef,
    inject,
    signal,
    viewChild,
} from '@angular/core';

@Component({
    selector: 'preview',
    templateUrl: './preview.html',
    styleUrl: './preview.scss',
})
export class GamePreview {
    private _destroyRef = inject(DestroyRef);
    private _containerEl = viewChild<ElementRef>('previewContainer');
    private _childContentWrapper = viewChild<ElementRef>('childContentWrapper');

    private _childWidth = signal<number>(1920); // default fallback
    private _childHeight = signal<number>(1080); // default fallback

    public readonly aspectRatio = computed<string>(() => {
        const w = this._childWidth();
        const h = this._childHeight();
        // Fallback to 16/9 if not available yet
        return w > 0 && h > 0 ? `${w}/${h}` : '16/9';
    });

    private _scaleFactor = signal<number>(1);
    public readonly scaleTransform = computed(
        () => `scale(${this._scaleFactor()})`
    );

    constructor() {
        // Observer for container resizing
        const containerResizeObserver = new ResizeObserver(() => {
            this._setScale();
        });

        // Observer for the child's natural size (the scaling container)
        const childResizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const cr = entry.contentRect;
                if (cr.width > 0 && cr.height > 0) {
                    // Update the child's natural dimensions
                    console.log(
                        'setting child width:',
                        cr.width,
                        'height:',
                        cr.height
                    );
                    this._childWidth.set(cr.width);
                    this._childHeight.set(cr.height);
                    // After updating child's dimensions, also update the scale
                    this._setScale();
                }
            }
        });

        effect(() => {
            const containerEl = this._containerEl();
            const childWrapperEl = this._childContentWrapper();

            if (containerEl) {
                containerResizeObserver.observe(containerEl.nativeElement);
            }

            if (childWrapperEl) {
                childResizeObserver.observe(childWrapperEl.nativeElement);
            }
        });

        this._destroyRef.onDestroy(() => {
            containerResizeObserver.disconnect();
            childResizeObserver.disconnect();
        });
    }

    private _setScale(): void {
        const container = this._containerEl()?.nativeElement;
        const childW = this._childWidth();
        const childH = this._childHeight();

        if (!container || childW === 0 || childH === 0) {
            return;
        }

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        if (containerWidth === 0 || containerHeight === 0) {
            return;
        }

        const scaleWidth = containerWidth / childW;
        const scaleHeight = containerHeight / childH;

        this._scaleFactor.set(Math.min(scaleWidth, scaleHeight));
    }
}
