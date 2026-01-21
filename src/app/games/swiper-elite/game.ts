import { Component, computed, inject } from '@angular/core';
import { fadeInOutAnimation } from '../../common/animations';
import { BaseGame, CommonGameModule } from '../base/game';
import { SwiperEliteDatabase } from './database';
import { SwiperEliteQuestion, SwiperEliteState } from './model';

@Component({
    imports: [CommonGameModule],
    templateUrl: './game.html',
    styleUrl: './game.scss',
    host: { class: 'pocket-pals-game' },
    animations: [fadeInOutAnimation()],
})
export class SwiperEliteGame extends BaseGame<
    SwiperEliteState,
    SwiperEliteQuestion
> {
    protected data: SwiperEliteDatabase;

    constructor() {
        const database = inject(SwiperEliteDatabase);
        super(database);
        this.data = database;
    }

    protected readonly items = computed(
        () => {
            const state = this.state();
            if (state.currentItems) {
                const reversed = [...state.currentItems].reverse();
                return reversed;
            } else {
                return [];
            }
        },
        {
            equal: (a, b) =>
                a.length === b.length &&
                a.every((item, i) => item.title === b[i].title),
        },
    );
}
