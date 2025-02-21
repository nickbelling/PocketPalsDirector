import {
    animate,
    AnimationEvent,
    state,
    style,
    transition,
    trigger,
} from '@angular/animations';
import {
    Component,
    computed,
    contentChild,
    input,
    output,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';

/**
 * A component representing a "playing card" with two sides. By default, it's
 * showing the "back". Set `showingFront` to `true` to flip it over with an
 * animation.
 */
@Component({
    selector: 'playing-card',
    imports: [MatCardModule],
    templateUrl: './playing-card.html',
    styleUrl: './playing-card.scss',
    animations: [
        trigger('flipFront', [
            state('front', style({ transform: 'rotateY(0deg)', zIndex: 2 })),
            state('back', style({ transform: 'rotateY(180deg)', zIndex: 1 })),
            transition('front <=> back', animate('0.6s ease-in-out')),
        ]),
        trigger('flipBack', [
            state('front', style({ transform: 'rotateY(-180deg)', zIndex: 1 })),
            state('back', style({ transform: 'rotateY(0deg)', zIndex: 3 })),
            transition('front <=> back', animate('0.6s ease-in-out')),
        ]),
    ],
})
export class PlayingCard {
    /** True if the card is showing its front. */
    public readonly showingFront = input<boolean>(false);

    /** True if the card should gently rotate with a Balatro-like animation. */
    public readonly animated = input<boolean>(false);

    /** Fired when the front is fully shown. */
    public readonly shownFront = output<void>();

    /** Fired when the back is fully shown. */
    public readonly shownBack = output<void>();

    /** A reference to the child `<playing-card-back>`. */
    private _playingCardBack = contentChild(PlayingCardBack);

    /** A reference to the child `<playing-card-front>`. */
    private _playingCardFront = contentChild(PlayingCardFront);

    /**
     * The classlist applied to the `<playing-card-back>`, so that it can be
     * propagated to the internal `<mat-card>`.
     */
    protected backClass = computed(() => {
        const cardBack = this._playingCardBack();

        if (cardBack) {
            return cardBack.class();
        } else {
            return '';
        }
    });

    /**
     * The classlist applied to the `<playing-card-front>`, so that it can be
     * propagated to the internal `<mat-card>`.
     */
    protected frontClass = computed(() => {
        const cardFront = this._playingCardFront();

        if (cardFront) {
            return cardFront.class();
        } else {
            return '';
        }
    });

    /**
     * Fired when the flipFront animation is complete. If we're showing the
     * front when this happens, emit the "shownFront" event.
     */
    public onFlipFrontDone(event: AnimationEvent): void {
        if (event.totalTime > 0) {
            if (this.showingFront()) {
                this.shownFront.emit();
            } else {
                // Animation completed, but we're showing the back.
                // This means the front flipped OUT of view rather than in view.
            }
        } else {
            // The animation event fired due to the component being disposed.
            // Don't ever emit the event in this case
        }
    }

    /**
     * Fired when the flipBack animation is complete. If we're showing the
     * back when this happens, emit the "shownBack" event.
     */
    public onFlipBackDone(event: AnimationEvent): void {
        if (event.totalTime > 0) {
            if (!this.showingFront()) {
                this.shownBack.emit();
            } else {
                // Animation completed, but we're showing the front.
                // This means the back flipped OUT of view rather than in view.
            }
        } else {
            // The animation event fired due to the component being disposed.
            // Don't ever emit the event in this case
        }
    }
}

/** The "front" component of a `<playing-card>`. */
@Component({
    selector: 'playing-card-front',
    template: '<ng-content />',
    styles: `
        :host {
            display: contents;
            height: inherit;
            width: inherit;
        }
    `,
})
export class PlayingCardFront {
    /**
     * Passes the class applied to this element to the `mat-card` wrapper in the
     * parent `<playing-card>` element.
     */
    public readonly class = input<string | undefined>(undefined);
}

/** The "back" component of a `<playing-card>`. */
@Component({
    selector: 'playing-card-back',
    template: '<ng-content />',
    styles: `
        :host {
            display: contents;
            height: inherit;
            width: inherit;
        }
    `,
})
export class PlayingCardBack {
    /**
     * Passes the class applied to this element to the `mat-card` wrapper in the
     * parent `<playing-card>` element.
     */
    public readonly class = input<string | undefined>(undefined);
}
