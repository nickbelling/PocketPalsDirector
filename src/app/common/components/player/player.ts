import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import {
    BuzzerPlayer,
    BUZZERS_STORAGE_IMAGES_PATH,
    BuzzerTeam,
} from '../../../buzzers';
import { FitTextDirective } from '../../directives';
import { CommonPipesModule } from '../../pipes/pipes.module';

@Component({
    imports: [CommonModule, CommonPipesModule, MatCardModule, FitTextDirective],
    selector: 'player',
    templateUrl: './player.html',
    styleUrl: './player.scss',
})
export class Player {
    public readonly player = input.required<BuzzerPlayer>();
    public readonly team = input<BuzzerTeam>();
    public readonly animated = input<boolean>(true);

    protected hasImage = computed(() => this.player().image !== null);
    protected imageSrc = computed(() => {
        const player = this.player();
        if (player.image) {
            return `${BUZZERS_STORAGE_IMAGES_PATH}/${player.image}`;
        } else {
            return '';
        }
    });

    protected teamColor = computed(() => {
        const team = this.team();

        if (team) {
            return team.color;
        }

        return 'rgb(59, 149, 237)';
    });
}
