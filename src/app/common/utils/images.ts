import { default as Pica } from 'pica';

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
