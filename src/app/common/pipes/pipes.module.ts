import { NgModule, Type } from '@angular/core';
import { CallFunctionPipe } from './call-function.pipe';
import { ImageColorSourcePipe } from './image-color-source.pipe';
import { NumberArrayPipe } from './number-array.pipe';
import { SecondsToDurationPipe } from './seconds-to-duration.pipe';
import { SortPipe } from './sort.pipe';

const PIPES: Type<unknown>[] = [
    CallFunctionPipe,
    ImageColorSourcePipe,
    NumberArrayPipe,
    SortPipe,
    SecondsToDurationPipe,
];

@NgModule({
    imports: PIPES,
    exports: PIPES,
})
export class CommonPipesModule {}
