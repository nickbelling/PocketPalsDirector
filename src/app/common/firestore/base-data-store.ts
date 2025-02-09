import { inject } from '@angular/core';
import { deleteObject, ref, uploadBytesResumable } from 'firebase/storage';
import { FIRESTORE, STORAGE } from './tokens';

export abstract class BaseFirestoreDataStore {
    protected _firestore = inject(FIRESTORE);
    protected _storage = inject(STORAGE);

    protected async uploadFile(
        file: File,
        path: string,
        onProgress?: (progress: number) => void,
    ): Promise<void> {
        const storageRef = ref(this._storage, path);

        // Upload the file
        const uploadTask = uploadBytesResumable(storageRef, file, {
            cacheControl: 'public, max-age=31536000',
        });

        return new Promise((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress =
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

                    // If the onProgress callback is defined, fire it
                    if (onProgress) {
                        onProgress(progress);
                    }
                },
                (error) => reject(error),
                async () => {
                    resolve();
                },
            );
        });
    }

    protected async deleteFile(path: string): Promise<void> {
        const storageRef = ref(this._storage, path);
        await deleteObject(storageRef);
    }
}
