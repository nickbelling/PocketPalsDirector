import { default as Pica } from 'pica';

/**
 * Given a `File` representing an image, resizes it to fit within the given
 * boundaries and returns a new `File` object.
 */
export function resizeImage(
    file: File,
    maxWidth: number,
    maxHeight: number,
    cropToNewRatio = false,
): Promise<File> {
    return new Promise((resolve, reject) => {
        const pica = new Pica();
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (event: any) => {
            img.src = event.target.result;
        };

        img.onload = async () => {
            const srcWidth = img.width;
            const srcHeight = img.height;

            let destWidth: number;
            let destHeight: number;

            let sx = 0;
            let sy = 0;
            let sWidth = srcWidth;
            let sHeight = srcHeight;

            if (cropToNewRatio) {
                const srcRatio = srcWidth / srcHeight;
                const targetRatio = maxWidth / maxHeight;

                if (srcRatio > targetRatio) {
                    // Source is wider → crop left/right
                    sHeight = srcHeight;
                    sWidth = Math.floor(srcHeight * targetRatio);
                    sx = Math.floor((srcWidth - sWidth) / 2);
                } else {
                    // Source is taller → crop top/bottom
                    sWidth = srcWidth;
                    sHeight = Math.floor(srcWidth / targetRatio);
                    sy = Math.floor((srcHeight - sHeight) / 2);
                }

                destWidth = maxWidth;
                destHeight = maxHeight;
            } else {
                const srcRatio = srcWidth / srcHeight;
                const maxRatio = maxWidth / maxHeight;

                if (srcRatio > maxRatio) {
                    destWidth = maxWidth;
                    destHeight = Math.floor(maxWidth / srcRatio);
                } else {
                    destHeight = maxHeight;
                    destWidth = Math.floor(maxHeight * srcRatio);
                }
            }

            // Source canvas
            const srcCanvas = document.createElement('canvas');
            srcCanvas.width = sWidth;
            srcCanvas.height = sHeight;

            const srcCtx = srcCanvas.getContext('2d');
            srcCtx?.drawImage(
                img,
                sx,
                sy,
                sWidth,
                sHeight,
                0,
                0,
                sWidth,
                sHeight,
            );

            // Destination canvas
            const destCanvas = document.createElement('canvas');
            destCanvas.width = destWidth;
            destCanvas.height = destHeight;

            await pica.resize(srcCanvas, destCanvas, { quality: 3 });

            const blob = await pica.toBlob(destCanvas, 'image/webp', 0.9);

            resolve(new File([blob], file.name, { type: 'image/webp' }));
        };

        img.onerror = (error) => reject(error);
        reader.onerror = (error) => reject(error);

        reader.readAsDataURL(file);
    });
}
