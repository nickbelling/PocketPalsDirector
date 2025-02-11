import { Pipe, PipeTransform } from '@angular/core';

/**
 * For the given number of seconds, converts it to a MM:SS display, with
 * optional milliseconds also shown.
 */
@Pipe({
    name: 'secondsToDuration',
    pure: true,
})
export class SecondsToDurationPipe implements PipeTransform {
    public transform(value: number, showMillis: boolean = false): string {
        const absValue = Math.abs(value);
        const minutes = Math.floor(absValue / 60);
        const seconds = showMillis ? absValue % 60 : Math.floor(absValue % 60);

        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
}
