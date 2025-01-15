import { Injectable } from '@angular/core';
import { BaseGameDatabase } from '../base/database';
import {
    ImpockstersState,
    ImpockstersQuestion,
    IMPOCKSTERS_BASE_PATH,
    IMPOCKSTERS_STATE_DEFAULT,
} from './model';

@Injectable({
    providedIn: 'root',
})
export class ImpockstersDatabase extends BaseGameDatabase<
    ImpockstersState,
    ImpockstersQuestion
> {
    constructor() {
        super(
            IMPOCKSTERS_BASE_PATH,
            IMPOCKSTERS_STATE_DEFAULT);
    }
}
