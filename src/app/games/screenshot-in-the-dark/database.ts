import { Injectable } from '@angular/core';
import { BaseGameDatabase } from '../base/database';
import {
    ScreenshotInTheDarkState,
    ScreenshotInTheDarkQuestion,
    SCREENSHOT_IN_THE_DARK_BASE_PATH,
    SCREENSHOT_IN_THE_DARK_STATE_DEFAULT,
} from './model';

@Injectable({
    providedIn: 'root',
})
export class ScreenshotInTheDarkDatabase extends BaseGameDatabase<
    ScreenshotInTheDarkState,
    ScreenshotInTheDarkQuestion
> {
    constructor() {
        super(
            SCREENSHOT_IN_THE_DARK_BASE_PATH,
            SCREENSHOT_IN_THE_DARK_STATE_DEFAULT);
    }
}
