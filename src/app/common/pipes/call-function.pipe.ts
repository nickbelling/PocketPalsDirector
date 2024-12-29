import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'call',
    pure: true,
})
export class CallFunctionPipe implements PipeTransform {
    public transform(fn: Function, ...args: any[]): any {
        return fn(...args);
    }
}
