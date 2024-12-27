import { NgModule } from '@angular/core';
import { BuzzerMiniController } from './buzzer-controller/buzzer-mini-controller';
import { BuzzerDisplay } from './buzzer-display/buzzer-display';
import { BuzzerPlayerButton } from './buzzer-player/buzzer-player';

@NgModule({
    imports: [BuzzerMiniController, BuzzerPlayerButton, BuzzerDisplay],
    exports: [BuzzerMiniController, BuzzerPlayerButton, BuzzerDisplay],
})
export class BuzzerModule {}
