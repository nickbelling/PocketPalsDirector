import { assertInInjectionContext, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { default as Pica } from 'pica';

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
        const pica = new Pica();
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (event: any) => {
            img.src = event.target.result;
        };

        img.onload = async () => {
            // Calculate the new dimensions while maintaining aspect ratio
            let { width, height } = img;
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

            // Create source and destination canvases
            const srcCanvas = document.createElement('canvas');
            srcCanvas.width = img.width;
            srcCanvas.height = img.height;
            const srcCtx = srcCanvas.getContext('2d');
            srcCtx?.drawImage(img, 0, 0);

            const destCanvas = document.createElement('canvas');
            destCanvas.width = width;
            destCanvas.height = height;

            // Use Pica to resize the image
            await pica.resize(srcCanvas, destCanvas, {
                quality: 3, // 1 (fast) to 3 (high quality)
            });

            // Convert the canvas to a Blob
            const blob = await pica.toBlob(destCanvas, 'image/webp', 0.9);

            resolve(new File([blob], file.name, { type: 'image/webp' }));
        };

        img.onerror = (error) => reject(error);
        reader.onerror = (error) => reject(error);

        reader.readAsDataURL(file);
    });
}

export function arraysAreEqual<T>(a: T[], b: T[]): boolean {
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
}

/**
 * Preloads all of the given image URLs.
 */
export async function preloadImages(imageUrls: string[]): Promise<void> {
    const preloadImage = (src: string) =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = resolve;
            image.onerror = reject;
            image.src = src;
        });

    await Promise.all(imageUrls.map(preloadImage));
}

/**
 * Preloads all of the given audio URLs.
 */
export async function preloadAudio(audioUrls: string[]): Promise<void> {
    const preloadAudio = (src: string) =>
        new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.onload = resolve;
            audio.onerror = reject;
            audio.src = src;
            audio.load();
        });

    await Promise.all(audioUrls.map(preloadAudio));
}

export function isValidColor(strColor: string) {
    const style: CSSStyleDeclaration = new Option().style;
    style.color = strColor;

    // style.color is '' by default, if not '' then successfully set.
    return style.color !== '';
}
