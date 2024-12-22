import { NgModule } from '@angular/core';
import { SlideGroupDirective, SlideItemDirective } from './slide.directive';

@NgModule({
    imports: [SlideGroupDirective, SlideItemDirective],
    exports: [SlideGroupDirective, SlideItemDirective],
})
export class SlideModule {}
