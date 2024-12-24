import { NgModule } from '@angular/core';
import { BuzzerController } from './buzzer-controller/buzzer-controller';
import { BuzzerDisplay } from './buzzer-display/buzzer-display';
import { BuzzerPlayerButton } from './buzzer-player/buzzer-player';

@NgModule({
    imports: [BuzzerController, BuzzerPlayerButton, BuzzerDisplay],
    exports: [BuzzerController, BuzzerPlayerButton, BuzzerDisplay],
})
export class BuzzerModule {}
