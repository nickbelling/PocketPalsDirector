import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'secondsToDuration',
    pure: true,
})
export class SecondsToDurationPipe implements PipeTransform {
    public transform(value: number): string {
        const minutes = Math.floor(value / 60);
        const seconds = value % 60;

        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
}
