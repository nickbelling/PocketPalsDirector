import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FitTextDirective } from '../../directives';
import { CommonPipesModule } from '../../pipes/pipes.module';

@Component({
    imports: [CommonModule, CommonPipesModule, MatCardModule, FitTextDirective],
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
