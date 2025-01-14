import { Injectable } from '@angular/core';
import { BaseGameDatabase } from '../base/database';
import {
    OrderUpState,
    OrderUpQuestion,
    ORDER_UP_BASE_PATH,
    ORDER_UP_STATE_DEFAULT,
} from './model';

@Injectable({
    providedIn: 'root',
})
export class OrderUpDatabase extends BaseGameDatabase<
    OrderUpState,
    OrderUpQuestion
> {
    constructor() {
        super(
            ORDER_UP_BASE_PATH,
            ORDER_UP_STATE_DEFAULT);
    }
}
