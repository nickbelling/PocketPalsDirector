import { Component, input, output } from '@angular/core';
import { NumberArrayPipe } from '../../common/pipes/number-array.pipe';
import { MapGridColumnLabelPipe, MapGridReferencePipe } from './pipes';

export interface MapPin {
    gridReference: number;
    color: string;
    label: string;
}

@Component({
    selector: 'location-map',
    imports: [NumberArrayPipe, MapGridColumnLabelPipe, MapGridReferencePipe],
    standalone: true,
    templateUrl: './map.html',
    styleUrl: './map.scss',
})
export class Map {
    public readonly src = input.required<string>();
    public readonly rows = input.required<number>();
    public readonly cols = input.required<number>();
    public readonly pins = input<MapPin[]>([]);
    public readonly highlight = input<number | null>(null);
    public readonly gridRefClicked = output<number>();
}
