import { Pipe, PipeTransform } from '@angular/core';

/**
 * Helper pipe to call a stateless function from a template and get its result
 * without needing to create a whole new Pipe to do so.
 *
 * @example
 * ```ts
 * public getDouble(value: number): number {
 *     return value * 2;
 * }
 * ```
 *
 * ```html
 * <span>Original number: {{num}}</span>
 * <span>Doubled: {{getDouble | call: num}}</span>
 * ```
 */
@Pipe({
    name: 'call',
    pure: true,
})
export class CallFunctionPipe implements PipeTransform {
    public transform(fn: Function, ...args: any[]): any {
        return fn(...args);
    }
}
