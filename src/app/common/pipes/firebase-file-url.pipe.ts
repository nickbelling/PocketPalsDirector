import { inject, Pipe, PipeTransform } from '@angular/core';
import { getDownloadURL, ref } from 'firebase/storage';
import { STORAGE } from '../../app.config';

@Pipe({
    name: 'uploadedFileUrl',
    pure: true,
})
export class FirebaseUploadedFileUrlPipe implements PipeTransform {
    private _storage = inject(STORAGE);

    public async transform(path: string | null): Promise<string> {
        if (path === null) {
            return '';
        }

        const fileRef = ref(this._storage, path);
        return await getDownloadURL(fileRef);
    }
}
