import { Injectable } from '@angular/core';
import { BaseGameDatabase } from '../base/database';
import {
    <%= classify(name) %>State,
    <%= classify(name) %>Question,
    <%= underscore(name) %>_STATE_DEFAULT
} from './model';

@Injectable({
    providedIn: 'root',
})
export class <%= classify(name) %>Database extends BaseGameDatabase<
    <%= classify(name) %>State,
    <%= classify(name) %>Question
> {
    constructor() {
        super('games/<%= dasherize(name) %>', <%= underscore(name) %>_STATE_DEFAULT);
    }
}
