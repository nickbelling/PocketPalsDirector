import { Component } from '@angular/core';
import { GamePreview } from '../common/preview/preview';
import { GameDefinition } from '../games/games';
import { CommonModule } from '@angular/common';
import { injectRouteData } from '../common/utils';

@Component({
    templateUrl: './game-director.html',
    imports: [CommonModule, GamePreview],
})
export class GameDirector {
    public readonly gameDefinition = injectRouteData<GameDefinition>();
}
