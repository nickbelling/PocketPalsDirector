import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CommonPipesModule } from '../../pipes/pipes.module';
import { FitText } from '../fit-text/fit-text';

@Component({
    imports: [CommonModule, CommonPipesModule, MatCardModule, FitText],
    selector: 'player',
    templateUrl: './player.html',
    styleUrl: './player.scss',
})
export class Player {
    public readonly name = input.required<string>();
    public readonly image = input<string | null>(null);
    public readonly color = input<string | undefined>(undefined);
    public readonly animated = input<boolean>(true);
}
