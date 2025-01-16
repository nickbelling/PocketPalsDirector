import { NgModule, Type } from '@angular/core';
import { CallFunctionPipe } from './call-function.pipe';
import { ImageColorSourcePipe } from './image-color-source.pipe';
import { NumberArrayPipe } from './number-array.pipe';
import { SecondsToDurationPipe } from './seconds-to-duration.pipe';
import { SortPipe } from './sort.pipe';
import {
    SplitSentenceAtIndexPipe,
    SplitSentenceCountPipe,
    SplitSentencePipe,
} from './split-sentence.pipe';

const PIPES: Type<unknown>[] = [
    CallFunctionPipe,
    ImageColorSourcePipe,
    NumberArrayPipe,
    SortPipe,
    SecondsToDurationPipe,
    SplitSentencePipe,
    SplitSentenceCountPipe,
    SplitSentenceAtIndexPipe,
];

@NgModule({
    imports: PIPES,
    exports: PIPES,
})
export class CommonPipesModule {}
