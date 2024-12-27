import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'imageColorSrc',
})
export class ImageColorSourcePipe implements PipeTransform {
    public transform(colorValue: string): string {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return '';
        }

        ctx.fillStyle = colorValue;
        ctx.fillRect(0, 0, 1, 1);

        return canvas.toDataURL('image/png');
    }
}
