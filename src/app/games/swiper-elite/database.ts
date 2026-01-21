import { Injectable } from '@angular/core';
import { BaseGameDatabase } from '../base/database';
import {
    SWIPER_ELITE_BASE_PATH,
    SWIPER_ELITE_STATE_DEFAULT,
    SwiperEliteQuestion,
    SwiperEliteState,
} from './model';

@Injectable({
    providedIn: 'root',
})
export class SwiperEliteDatabase extends BaseGameDatabase<
    SwiperEliteState,
    SwiperEliteQuestion
> {
    constructor() {
        super(SWIPER_ELITE_BASE_PATH, SWIPER_ELITE_STATE_DEFAULT);
    }

    public override getQuestionString(question: SwiperEliteQuestion): string {
        return question.title;
    }
}
