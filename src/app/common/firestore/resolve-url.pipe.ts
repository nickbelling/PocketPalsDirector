import { Pipe, PipeTransform } from '@angular/core';
import { resolveStorageUrl } from './utils';

@Pipe({
    name: 'resolveUrl',
    pure: true,
})
export class FirebaseResolveUrlPipe implements PipeTransform {
    public transform(storagePath: string): string {
        return resolveStorageUrl(storagePath);
    }
}
