import { Component } from '@angular/core';
import { GamePreview } from '../common/preview/preview';
import { StateYourBidnessGame } from './state-your-bidness/game';

@Component({
    selector: 'game-selector',
    templateUrl: './game-selector.html',
    imports: [GamePreview, StateYourBidnessGame],
})
export class GameSelectorComponent {}
