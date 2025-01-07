import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'secondsToDuration',
    pure: true,
})
export class SecondsToDurationPipe implements PipeTransform {
    public transform(value: number, showMillis: boolean = false): string {
        const minutes = Math.abs(Math.floor(value / 60));
        const seconds = Math.abs(
            showMillis ? value % 60 : Math.floor(value % 60),
        );

        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
}
