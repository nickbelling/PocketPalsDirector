import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'stat',
    pure: true,
})
export class TweetStatPipe implements PipeTransform {
    transform(value: number): string {
        if (value < 1_000) {
            return value.toString();
        }

        if (value < 1_000_000) {
            return this.format(value, 1_000, 'K');
        }

        if (value < 1_000_000_000) {
            return this.format(value, 1_000_000, 'M');
        }

        return this.format(value, 1_000_000_000, 'B');
    }

    private format(value: number, divisor: number, suffix: string): string {
        const scaled = value / divisor;

        // show 1 decimal only when < 100 (1.2K, 12.5K, 99.9K)
        const decimals = scaled < 100 ? 1 : 0;

        return `${this.trim(scaled.toFixed(decimals))}${suffix}`;
    }

    private trim(value: string): string {
        return value.replace(/\.0$/, '');
    }
}
