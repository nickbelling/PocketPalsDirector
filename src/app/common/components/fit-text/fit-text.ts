import { Component, input } from '@angular/core';

@Component({
    selector: 'fit-text',
    templateUrl: './fit-text.html',
    styleUrl: './fit-text.scss',
})
export class FitText {
    public readonly text = input.required<string | number>();
}
