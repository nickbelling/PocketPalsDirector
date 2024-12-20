import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'sort',
    pure: true,
})
export class SortPipe implements PipeTransform {
    public transform<T extends string | number>(value: T[]): T[] {
        return value.sort((a, b) => {
            if (a < b) {
                return -1;
            } else if (a > b) {
                return 1;
            } else {
                return 0;
            }
        });
    }
}
