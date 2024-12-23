import { NgModule } from '@angular/core';
import { PlayingCard, PlayingCardBack, PlayingCardFront } from './playing-card';

@NgModule({
    imports: [PlayingCard, PlayingCardFront, PlayingCardBack],
    exports: [PlayingCard, PlayingCardFront, PlayingCardBack],
})
export class PlayingCardModule {}
