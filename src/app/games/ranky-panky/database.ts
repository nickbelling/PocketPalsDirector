import { Injectable } from '@angular/core';
import { BaseGameDatabase } from '../base/database';
import {
    RANKY_PANKY_STATE_DEFAULT,
    RankyPankyQuestion,
    RankyPankyState,
} from './model';

@Injectable({
    providedIn: 'root',
})
export class RankyPankyDatabase extends BaseGameDatabase<
    RankyPankyState,
    RankyPankyQuestion
> {
    constructor() {
        super('games/ranky-panky', RANKY_PANKY_STATE_DEFAULT);
    }
}
