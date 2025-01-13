import { Component, inject } from '@angular/core';
import { BaseGame, CommonGameModule } from '../base/game';
import { LightlySteamedDatabase } from './database';
import {
    LightlySteamedQuestion,
    LightlySteamedState
} from './model';

@Component({
    imports: [CommonGameModule],
    templateUrl: './game.html',
    styleUrl: './game.scss',
    host: { class: 'pocket-pals-game size-1920x1080' },
})
export class LightlySteamedGame extends BaseGame<
    LightlySteamedState,
    LightlySteamedQuestion
> {
    protected data: LightlySteamedDatabase;

    constructor() {
        const database = inject(LightlySteamedDatabase);
        super(database);
        this.data = database;
    }
}
