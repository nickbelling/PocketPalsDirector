import { Component, inject } from '@angular/core';
import { fadeInOutAnimation } from '../../common/animations';
import { VideogameNamePipe } from '../../common/video-games';
import { BaseGame, CommonGameModule } from '../base/game';
import { BpWhyFiDatabase } from './database';
import { BpWhyFiQuestion, BpWhyFiState } from './model';

@Component({
    imports: [CommonGameModule, VideogameNamePipe],
    templateUrl: './game.html',
    styleUrl: './game.scss',
    host: { class: 'pocket-pals-game' },
    animations: [fadeInOutAnimation()],
})
export class BpWhyFiGame extends BaseGame<BpWhyFiState, BpWhyFiQuestion> {
    protected data: BpWhyFiDatabase;

    constructor() {
        const database = inject(BpWhyFiDatabase);
        super(database);
        this.data = database;
    }
}
