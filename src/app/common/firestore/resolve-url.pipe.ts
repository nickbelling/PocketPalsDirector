import { Pipe, PipeTransform } from '@angular/core';
import { resolveStorageUrl } from './utils';
import { getDownloadURL } from 'firebase/storage';

/**
 * Resolves the publicly accessible URL of the given storage path.
 *
 * This can be done synchronously without needing to call Firebase's
 * {@link getDownloadURL} function IF the storage blob is publicly available
 * (which all of our uploaded assets are for the purposes of this application),
 * which saves a round-trip to the server for each asset we attempt to resolve.
 *
 * This makes images load instantly if the browser has seen them before.
 */
@Pipe({
    name: 'resolveUrl',
    pure: true,
})
export class FirebaseResolveUrlPipe implements PipeTransform {
    public transform(storagePath: string): string {
        return resolveStorageUrl(storagePath);
    }
}
