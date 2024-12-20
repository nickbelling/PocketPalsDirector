import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'numberArray',
    pure: true,
})
export class NumberArrayPipe implements PipeTransform {
    public transform(number: number): number[] {
        return Array.from({ length: number }, (_, index) => index + 1);
    }
}
