import { Injectable } from '@angular/core';
import { BaseGameDatabase } from '../base/database';
import {
    BeatItState,
    BeatItQuestion,
    BEAT_IT_BASE_PATH,
    BEAT_IT_STATE_DEFAULT,
} from './model';

@Injectable({
    providedIn: 'root',
})
export class BeatItDatabase extends BaseGameDatabase<
    BeatItState,
    BeatItQuestion
> {
    constructor() {
        super(
            BEAT_IT_BASE_PATH,
            BEAT_IT_STATE_DEFAULT);
    }
}
