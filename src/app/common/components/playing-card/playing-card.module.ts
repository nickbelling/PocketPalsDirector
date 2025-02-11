import { NgModule } from '@angular/core';
import { PlayingCard, PlayingCardBack, PlayingCardFront } from './playing-card';

/**
 * A module that groups the PlayingCard component with its front/back components
 * for ease of single-import.
 */
@NgModule({
    imports: [PlayingCard, PlayingCardFront, PlayingCardBack],
    exports: [PlayingCard, PlayingCardFront, PlayingCardBack],
})
export class PlayingCardModule {}
