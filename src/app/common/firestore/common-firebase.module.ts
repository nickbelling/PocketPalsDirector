import { NgModule } from '@angular/core';
import { FirebaseUploadedFileUrlPipe } from './firebase-file-url.pipe';

@NgModule({
    imports: [FirebaseUploadedFileUrlPipe],
    exports: [FirebaseUploadedFileUrlPipe],
})
export class CommonFirebaseModule {}
