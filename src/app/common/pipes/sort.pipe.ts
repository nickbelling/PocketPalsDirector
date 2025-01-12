import { Pipe, PipeTransform } from '@angular/core';

/**
 * Sorts an array of string or number items based on their values.
 */
@Pipe({
    name: 'sort',
    pure: true,
})
export class SortPipe implements PipeTransform {
    public transform<T extends string | number | Record<keyof T, unknown>>(
        value: T[],
        property?: keyof T,
    ): T[] {
        if (!Array.isArray(value)) {
            return value;
        }

        return value.slice().sort((a, b) => {
            const aValue = property ? a[property] : a;
            const bValue = property ? b[property] : b;

            if (aValue < bValue) {
                return -1;
            } else if (aValue > bValue) {
                return 1;
            } else {
                return 0;
            }
        });
    }
}
