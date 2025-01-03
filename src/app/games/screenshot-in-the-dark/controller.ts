import { Component, inject } from '@angular/core';
import { BaseController, CommonControllerModule } from '../base/controller';
import { ScreenshotInTheDarkDatabase } from './database';
import {
    ScreenshotInTheDarkQuestion,
    ScreenshotInTheDarkState
} from './model';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './controller.html',
})
export class ScreenshotInTheDarkController extends BaseController<
    ScreenshotInTheDarkState,
    ScreenshotInTheDarkQuestion
> {
    protected data: ScreenshotInTheDarkDatabase;

    constructor() {
        const database = inject(ScreenshotInTheDarkDatabase);
        super(database);
        this.data = database;
    }
}
