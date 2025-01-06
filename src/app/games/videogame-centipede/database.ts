import { Injectable } from '@angular/core';
import { BaseGameDatabase } from '../base/database';
import {
    VideogameCentipedeState,
    VideogameCentipedeQuestion,
    VIDEOGAME_CENTIPEDE_BASE_PATH,
    VIDEOGAME_CENTIPEDE_STATE_DEFAULT,
} from './model';

@Injectable({
    providedIn: 'root',
})
export class VideogameCentipedeDatabase extends BaseGameDatabase<
    VideogameCentipedeState,
    VideogameCentipedeQuestion
> {
    constructor() {
        super(
            VIDEOGAME_CENTIPEDE_BASE_PATH,
            VIDEOGAME_CENTIPEDE_STATE_DEFAULT);
    }
}
