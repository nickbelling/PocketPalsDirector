import { Injectable } from '@angular/core';
import { BaseGameDatabase } from '../base/database';
import {
    SWITCH_THAT_REVERSE_IT_BASE_PATH,
    SWITCH_THAT_REVERSE_IT_STATE_DEFAULT,
    SwitchThatReverseItQuestion,
    SwitchThatReverseItState,
} from './model';

@Injectable({
    providedIn: 'root',
})
export class SwitchThatReverseItDatabase extends BaseGameDatabase<
    SwitchThatReverseItState,
    SwitchThatReverseItQuestion
> {
    constructor() {
        super(
            SWITCH_THAT_REVERSE_IT_BASE_PATH,
            SWITCH_THAT_REVERSE_IT_STATE_DEFAULT,
        );
    }
}
