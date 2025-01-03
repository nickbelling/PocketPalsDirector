import { Component, inject } from '@angular/core';
import { BaseController, CommonControllerModule } from '../base/controller';
import { <%= classify(name) %>Database } from './database';
import {
    <%= classify(name) %>Question,
    <%= classify(name) %>State
} from './model';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './controller.html',
})
export class <%= classify(name) %>Controller extends BaseController<
    <%= classify(name) %>State,
    <%= classify(name) %>Question
> {
    protected data: <%= classify(name) %>Database;

    constructor() {
        const database = inject(<%= classify(name) %>Database);
        super(database);
        this.data = database;
    }
}
