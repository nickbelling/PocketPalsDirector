import {
    contentChildren,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
} from '@angular/core';

@Directive({
    selector: '[slideGroup]',
})
export class SlideGroupDirective {
    private _destroyRef = inject(DestroyRef);
    private _styleSheet: HTMLStyleElement;
    public readonly items = contentChildren(SlideItemDirective);

    constructor() {
        // Create a new stylesheet with a ".slide-item" CSS rule.
        // We'll use this to dynamically apply the rule to each individual item
        // that we determined has moved.
        this._styleSheet = document.createElement('style');
        // Inject the stylesheet we just made into the <head>.
        const headElement = document.getElementsByTagName('head')[0];
        headElement.appendChild(this._styleSheet);
        this._styleSheet.sheet!.insertRule(
            '.slide-item { transition: transform 1s ease-in-out; }',
        );

        // On destroy, remove the stylesheet from the <head>.
        this._destroyRef.onDestroy(() => {
            headElement.removeChild(this._styleSheet);
        });

        // Monitor for contentChildren with the `slideItem` directive, and then
        // animate them.
        effect(() => {
            // The children we're interested in have changed in some way.
            const items = this.items();

            requestAnimationFrame(() => {
                // Set the "previous" position to whatever their last "new"
                // position was.
                items.forEach(
                    (item) => (item.prevPos = item.newPos || item.prevPos),
                );

                // If the item has a callback stored (i.e. it's mid-animation),
                // run it. This handles the scenario where the items change
                // while an existing animation is still running.
                items.forEach((item) => {
                    if (item.moveCallback) {
                        item.moveCallback();
                    }
                });

                // Now set the "new" position for each item by measuring its
                // newly rendered position. We're going to intercept that and
                // trigger an animation that moves it from the old position to
                // its new one.
                this.refreshPositions();

                // Handle the case where a new item without a prevPos may have
                // appeared.
                items.forEach(
                    (item) => (item.prevPos = item.prevPos || item.newPos),
                );

                // Set up an "animate" function for each item.
                const animate = () => {
                    // Apply any "translate()" transforms to the elements to
                    // visually move them to their old position
                    items.forEach(this.applyTranslation);
                    // Wait a frame for them to be applied, and then execute the
                    // transition animation by applying the global class and
                    // removing the translate.
                    requestAnimationFrame(() => {
                        items.forEach((item) => this.runTransition(item));
                    });
                };

                // Determine if any of the items are actually going to move.
                const willMoveSome = items.some((item) => {
                    const dx =
                        (item.prevPos?.left || 0) - (item.newPos?.left || 0);
                    const dy =
                        (item.prevPos?.top || 0) - (item.newPos?.top || 0);
                    return dx || dy;
                });

                // Finally, perform the animation.
                if (willMoveSome) {
                    animate();
                } else {
                    // Handle removed items
                    this.refreshPositions();
                    animate();
                }
            });
        });
    }

    /**
     * For the given item, determines if it has moved. If it has, it applies a
     * "translate()" transform to the element that transforms it by the delta
     * it was moved by. This "returns" it to its old position.
     *
     * Later (in "runTransition()"), we'll remove this, which will cause it to
     * animate to its "new" position.
     */
    private applyTranslation(item: SlideItemDirective): void {
        item.moved = false;
        const dx = (item.prevPos?.left || 0) - (item.newPos?.left || 0);
        const dy = (item.prevPos?.top || 0) - (item.newPos?.top || 0);

        if (dx || dy) {
            item.moved = true;
            const style: CSSStyleDeclaration = item.el.style;

            // Translate the item to its "old" position with no transition. This
            // means on the next rendered frame it will (visually) be in the
            // old position.
            style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
            style.transitionDuration = '0s';
        }
    }

    /**
     * For items which have been marked as moved, they're now currently
     * translated via a CSS style to their old position. Now, we add the
     * ".slide-move" class which causes a transition animation on the transform,
     * and then rip out the transform. This will then cause that item to animate
     * from the translated position to its new location.
     */
    private runTransition(item: SlideItemDirective): void {
        if (!item.moved) {
            return;
        }

        // First, set up an event listener for when the animation finishes, so
        // that we can remove the CSS class when it's done.
        item.el.addEventListener(
            'transitionend',
            (item.moveCallback = (e?: TransitionEvent) => {
                if (!e || /transform$/.test(e.propertyName)) {
                    item.el.removeEventListener(
                        'transitionend',
                        item.moveCallback!,
                    );
                    item.moveCallback = undefined;
                    item.el.classList.remove(moveCssClassName);
                }
            }),
        );

        // Now, add the .slide-item class to the element. This causes it to
        // translate its position if the transform changes. Then, set the
        // transform to "nothing", which will cause it to translate its position
        // to its new, correct location.
        const moveCssClassName = 'slide-item';
        const style: CSSStyleDeclaration = item.el.style;
        style.transform = '';
        style.transitionDuration = '';

        item.el.classList.add(moveCssClassName);
    }

    /**
     * Measures the current position of each item and sets its `newPos` to that.
     */
    private refreshPositions(): void {
        this.items().forEach((item) => {
            item.newPos = item.el.getBoundingClientRect();
        });
    }
}

@Directive({
    selector: '[slideItem]',
})
export class SlideItemDirective {
    /** The element this directive is bound to. */
    public readonly el: HTMLElement = inject(ElementRef).nativeElement;

    /** The last-known position of the element. Used to animate "from". */
    public prevPos?: DOMRect = undefined;

    /**
     * The new position of the element. Not used in animation, but used so that
     * the *next* `prevPos` can be set.
     */
    public newPos?: DOMRect = undefined;

    /** True if this item has recently moved and should be animated. */
    public moved: boolean = false;

    /** A callback fired when animation completes. */
    public moveCallback?: (e?: TransitionEvent) => void;
}
