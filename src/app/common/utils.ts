import { assertInInjectionContext, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

/**
 * Injects any provided route data directly into the component and makes it
 * available as a Signal. A shortcut to skip getting the `Observable` from
 * `ActivatedRoute` and subscribing to it.
 */
export function injectRouteData<T>(): Signal<T> {
    assertInInjectionContext(injectRouteData);
    const route = inject(ActivatedRoute);
    const data = route.data;
    return toSignal(data) as Signal<T>;
}

/**
 * Given a `File` representing an image, resizes it to fit within the given
 * boundaries and returns a new `File` object.
 */
export function resizeImage(
    file: File,
    maxWidth: number,
    maxHeight: number,
): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (event: any) => {
            img.src = event.target.result;
        };

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            let width = img.width;
            let height = img.height;

            // Calculate the new dimensions
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.floor((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.floor((width * maxHeight) / height);
                    height = maxHeight;
                }
            }

            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;

            // Draw the resized image
            ctx?.drawImage(img, 0, 0, width, height);

            // Convert the canvas back to a blob
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(
                            new File([blob], file.name, { type: file.type }),
                        );
                    } else {
                        reject(new Error('Image resizing failed.'));
                    }
                },
                file.type, // Preserve the original file type
                0.5, // Compression quality (0.1 - 1, optional)
            );
        };

        img.onerror = (error) => reject(error);
        reader.onerror = (error) => reject(error);

        reader.readAsDataURL(file);
    });
}
