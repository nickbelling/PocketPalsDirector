import { NgModule } from '@angular/core';
import { FirebaseResolveUrlPipe } from './resolve-url.pipe';

@NgModule({
    imports: [FirebaseResolveUrlPipe],
    exports: [FirebaseResolveUrlPipe],
})
export class CommonFirebaseModule {}
