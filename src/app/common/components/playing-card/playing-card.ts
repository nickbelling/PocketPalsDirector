import {
    animate,
    state,
    style,
    transition,
    trigger,
} from '@angular/animations';
import { Component, computed, contentChild, input } from '@angular/core';
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
