import { NgModule, Type } from '@angular/core';
import { FirebaseUploadedFileUrlPipe } from './firebase-file-url.pipe';
import { ImageColorSourcePipe } from './image-color-source.pipe';
import { NumberArrayPipe } from './number-array.pipe';
import { SortPipe } from './sort.pipe';

const PIPES: Type<unknown>[] = [
    FirebaseUploadedFileUrlPipe,
    ImageColorSourcePipe,
    NumberArrayPipe,
    SortPipe,
];

@NgModule({
    imports: PIPES,
    exports: PIPES,
})
export class CommonPipesModule {}
