import { NgModule } from '@angular/core';
import { Card, CardBack, CardFront } from './card';

@NgModule({
    imports: [Card, CardFront, CardBack],
    exports: [Card, CardFront, CardBack],
})
export class CardModule {}
