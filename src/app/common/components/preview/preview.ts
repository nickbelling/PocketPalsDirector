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

/**
 * Component that renders a fixed-sized element (e.g. a game of a specific pixel
 * size such as 1920x1080px) as a scalable preview. The element will fit its
 * parent, shrinking anything inside while maintaining its internal aspect
 * ratio.
 *
 * NOTE: The child component *must* have a fixed width and height.
 *
 * @example
 * <preview>
 *     <my-game />
 * </preview>
 */
@Component({
    selector: 'preview',
    templateUrl: './preview.html',
    styleUrl: './preview.scss',
})
export class GamePreview {
    /** Used to dispose of ResizeObservers. */
    private _destroyRef = inject(DestroyRef);

    /** The container element, used to determine the size of the preview. */
    private _containerEl = viewChild<ElementRef>('previewContainer');

    /**
     * The wrapper around the child content, used to determine the child
     * content's desired size and aspect ratio.
     */
    private _childContentWrapper = viewChild<ElementRef>('childContentWrapper');

    /** The current width of the container (set by a ResizeObserver). */
    private _containerWidth = signal<number>(1920);

    /** The current height of the container (set by a ResizeObserver). */
    private _containerHeight = signal<number>(1080);

    /**
     * The desired width the child content wants to render at. Set by a
     * ResizeObserver that monitors the child's desired rendered width.
     */
    private _childWidth = signal<number>(1920);

    /**
     * The desired height the child content wants to render at. Set by a
     * ResizeObserver that monitors the child's desired rendered height.
     */
    private _childHeight = signal<number>(1080);

    /**
     * The scale factor that should be applied to the child content to make it
     * fit within the preview window, based on all of the values above.
     */
    public scaleFactor = computed<number>(() => {
        const containerW = this._containerWidth();
        const containerH = this._containerHeight();
        const childW = this._childWidth();
        const childH = this._childHeight();

        if (
            containerW === 0 ||
            containerH === 0 ||
            childW === 0 ||
            childH === 0
        ) {
            return 1;
        }

        const scaleWidth = containerW / childW;
        const scaleHeight = containerH / childH;

        return Math.min(scaleWidth, scaleHeight);
    });

    /**
     * The "preview-scale" container is positioned absolutely with top and left
     * at 50%. This then needs to be translated negatively, however cannot be
     * "-50%" because the container is scaled. This Signal calculates the -50%
     * translation multiplied by the scale factor so that it can be visually
     * centered in its parent.
     */
    public translatePercentage = computed(() => {
        const scaleFactor = this.scaleFactor();
        const value = scaleFactor * -50;

        return `${value}% ${value}%`;
    });

    /** The aspect ratio of the child content, derived from its desired size. */
    public readonly aspectRatio = computed<string>(() => {
        const w = this._childWidth();
        const h = this._childHeight();

        // Fallback to 16/9 if not available yet
        return w > 0 && h > 0 ? `${w}/${h}` : '16/9';
    });

    constructor() {
        // Observer for container resizing
        const containerResizeObserver = new ResizeObserver((entries) => {
            const cr = entries[0].contentRect;
            if (cr.width > 0 && cr.height > 0) {
                this._containerWidth.set(cr.width);
                this._containerHeight.set(cr.height);
            }
        });

        // Observer for the child's natural desired size
        const childResizeObserver = new ResizeObserver((entries) => {
            const cr = entries[0].contentRect;
            if (cr.width > 0 && cr.height > 0) {
                // Update the child's natural dimensions
                this._childWidth.set(cr.width);
                this._childHeight.set(cr.height);
            }
        });

        // Monitor the child element and the container element for resizes
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

        // On destroy, clean up the ResizeObservers
        this._destroyRef.onDestroy(() => {
            containerResizeObserver.disconnect();
            childResizeObserver.disconnect();
        });
    }
}
