import {
    animate,
    state,
    style,
    transition,
    trigger,
} from '@angular/animations';
import { Component, computed, contentChild, input, model } from '@angular/core';
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
    public readonly showingFront = model<boolean>(false);
    public readonly animated = input<boolean>(false);

    private _playingCardBack = contentChild(PlayingCardBack);
    private _playingCardFront = contentChild(PlayingCardFront);

    protected backClass = computed(() => {
        const cardBack = this._playingCardBack();

        if (cardBack) {
            return cardBack.class();
        } else {
            return '';
        }
    });

    protected frontClass = computed(() => {
        const cardFront = this._playingCardFront();

        if (cardFront) {
            return cardFront.class();
        } else {
            return '';
        }
    });
}

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
    public readonly class = input<string | undefined>(undefined);
}

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
    public readonly class = input<string | undefined>(undefined);
}
