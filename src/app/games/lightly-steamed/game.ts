import { Component, effect, inject, signal } from '@angular/core';
import { fadeInOutAnimation } from '../../common/animations';
import { getRandomItem } from '../../common/utils';
import { BaseGame, CommonGameModule } from '../base/game';
import { LightlySteamedDatabase } from './database';
import { LightlySteamedQuestion, LightlySteamedState } from './model';

const RANDOM_AVATAR_NUMS = [1, 2, 3, 4, 5, 6, 7];
const RANDOM_AVATAR_COLORS = [
    'red',
    'yellow',
    'green',
    'blue',
    'pink',
    'purple',
];

@Component({
    imports: [CommonGameModule],
    templateUrl: './game.html',
    styleUrl: './game.scss',
    host: { class: 'pocket-pals-game' },
    animations: [fadeInOutAnimation()],
})
export class LightlySteamedGame extends BaseGame<
    LightlySteamedState,
    LightlySteamedQuestion
> {
    protected data: LightlySteamedDatabase;
    private _lastReviewNum: number = 0;

    protected randomAvatarNum = signal<number>(1);
    protected randomAvatarColor = signal<string>('blue');

    constructor() {
        const database = inject(LightlySteamedDatabase);
        super(database);
        this.data = database;

        effect(() => {
            const state = this.state();

            if (state.currentReview !== this._lastReviewNum) {
                let randomAvatarNum = getRandomItem(RANDOM_AVATAR_NUMS);
                while (this.randomAvatarNum() === randomAvatarNum) {
                    randomAvatarNum = getRandomItem(RANDOM_AVATAR_NUMS);
                }

                let randomAvatarColor = getRandomItem(RANDOM_AVATAR_COLORS);
                while (this.randomAvatarColor() === randomAvatarColor) {
                    randomAvatarColor = getRandomItem(RANDOM_AVATAR_COLORS);
                }

                this.randomAvatarNum.set(randomAvatarNum);
                this.randomAvatarColor.set(randomAvatarColor);
            }

            this._lastReviewNum = state.currentReview;
        });
    }
}
