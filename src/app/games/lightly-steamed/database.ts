import { Injectable } from '@angular/core';
import { BaseGameDatabase } from '../base/database';
import {
    LightlySteamedState,
    LightlySteamedQuestion,
    LIGHTLY_STEAMED_BASE_PATH,
    LIGHTLY_STEAMED_STATE_DEFAULT,
} from './model';

@Injectable({
    providedIn: 'root',
})
export class LightlySteamedDatabase extends BaseGameDatabase<
    LightlySteamedState,
    LightlySteamedQuestion
> {
    constructor() {
        super(
            LIGHTLY_STEAMED_BASE_PATH,
            LIGHTLY_STEAMED_STATE_DEFAULT);
    }
}
