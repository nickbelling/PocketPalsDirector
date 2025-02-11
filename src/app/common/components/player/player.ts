import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CommonPipesModule } from '../../pipes/pipes.module';
import { FitText } from '../fit-text/fit-text';

/**
 * A component to display a player as they would appear on the buzzer. Handles
 * animating them on first appearance if set.
 */
@Component({
    imports: [CommonModule, CommonPipesModule, MatCardModule, FitText],
    selector: 'player',
    templateUrl: './player.html',
    styleUrl: './player.scss',
})
export class Player {
    /** The player's name, as displayed. */
    public readonly name = input.required<string>();

    /** The player's avatar image. If unset, will use the default Pockety. */
    public readonly image = input<string | null>(null);

    /** The player's team color. If unset, uses the default blue color. */
    public readonly color = input<string | undefined>(undefined);

    /** True if animations should be used on element entry/exit. */
    public readonly animated = input<boolean>(true);
}
