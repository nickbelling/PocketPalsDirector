import { Pipe, PipeTransform } from '@angular/core';
import { numberToColumnLabel, toGridRefString } from './utils';

@Pipe({
    name: 'colLabel',
    pure: true,
    standalone: true,
})
export class MapGridColumnLabelPipe implements PipeTransform {
    public transform(colNumber: number): string {
        return numberToColumnLabel(colNumber);
    }
}

@Pipe({
    name: 'gridRef',
    pure: true,
    standalone: true,
})
export class MapGridReferencePipe implements PipeTransform {
    public transform([row, col]: number[], columns: number): number {
        return (row - 1) * columns + col;
    }
}

@Pipe({
    name: 'gridRefString',
    pure: true,
    standalone: true,
})
export class ToMapGridReferencePipe implements PipeTransform {
    public transform(
        value: number | null | undefined,
        [cols, rows]: number[],
    ): string {
        if (value === null || value === undefined) return '';

        return toGridRefString(value, cols, rows);
    }
}
