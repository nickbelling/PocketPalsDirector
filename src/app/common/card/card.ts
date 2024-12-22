import {
    animate,
    state,
    style,
    transition,
    trigger,
} from '@angular/animations';
import { Component, model } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'card',
    imports: [MatCardModule],
    templateUrl: './card.html',
    styleUrl: './card.scss',
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
export class Card {
    public readonly showingFront = model<boolean>(false);
}

@Component({
    selector: 'card-front',
    template: '<ng-content />',
    styles: `
        :host {
            display: contents;
            height: inherit;
            width: inherit;
        }
    `,
})
export class CardFront {}

@Component({
    selector: 'card-back',
    template: '<ng-content />',
    styles: `
        :host {
            display: contents;
            height: inherit;
            width: inherit;
        }
    `,
})
export class CardBack {}
