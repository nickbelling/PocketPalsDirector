import { Pipe, PipeTransform } from '@angular/core';

/**
 * Turns a number into an array of numbers. For example, `3` becomes `[1, 2, 3]`.
 */
@Pipe({
    name: 'numberArray',
    pure: true,
})
export class NumberArrayPipe implements PipeTransform {
    public transform(number: number): number[] {
        return Array.from({ length: number }, (_, index) => index + 1);
    }
}
