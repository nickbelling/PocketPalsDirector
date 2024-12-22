import { Component, model } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'card',
    imports: [MatCardModule],
    templateUrl: './card.html',
    styleUrl: './card.scss',
})
export class Card {
    public readonly isFlipped = model<boolean>(true);

    public flip(): void {
        this.isFlipped.update((val) => !val);
    }
}

@Component({
    selector: 'card-front',
    template: '<ng-content />',
    styles: `
        :host {
            display: contents;
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
        }
    `,
})
export class CardBack {}
