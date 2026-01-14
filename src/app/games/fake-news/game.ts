import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { timer } from 'rxjs';
import { fadeInOutAnimation } from '../../common/animations';
import { BaseGame, CommonGameModule } from '../base/game';
import { FakeNewsFactCheckersDatabase } from './database';
import {
    FakeNewsFactCheckersQuestion,
    FakeNewsFactCheckersState,
} from './model';
import { TweetStatPipe } from './stat.pipe';

@Component({
    imports: [CommonGameModule, TweetStatPipe],
    templateUrl: './game.html',
    styleUrl: './game.scss',
    host: { class: 'pocket-pals-game' },
    animations: [fadeInOutAnimation()],
})
export class FakeNewsFactCheckersGame extends BaseGame<
    FakeNewsFactCheckersState,
    FakeNewsFactCheckersQuestion
> {
    protected data: FakeNewsFactCheckersDatabase;
    protected readonly comments = signal<number>(0);
    protected readonly likes = signal<number>(0);
    protected readonly retweets = signal<number>(0);
    protected readonly views = signal<number>(Math.floor(Math.random() * 1000));

    // Current per-tick increments (these grow over time)
    private dv = 800; // +views per 2s

    // Growth factors per tick (exponential-ish)
    private readonly gv = 1.045; // views accelerate fastest
    private readonly gl = 1.03;
    private readonly gr = 1.02;
    private readonly gc = 1.015;

    constructor() {
        const database = inject(FakeNewsFactCheckersDatabase);
        super(database);
        this.data = database;

        const timerSub = timer(0, 2000).subscribe(() => {
            // 1) Views grow exponentially-ish
            this.dv *= this.gv;
            this.views.update((views) => (views += Math.round(this.dv)));

            const dl = this.dv * 0.03 * this.gl; // likes ≈ 3% of new views
            const dr = dl * 0.16 * this.gr; // retweets ≈ 16% of new likes
            const dc = dl * 0.1 * this.gc; // comments ≈ 10% of new likes

            this.likes.update((likes) => (likes += Math.round(dl)));
            this.retweets.update((retweets) => (retweets += Math.round(dr)));
            this.comments.update((comments) => (comments += Math.round(dc)));
        });

        inject(DestroyRef).onDestroy(() => timerSub.unsubscribe());

        effect(() => {
            const questionChanged = this.currentQuestionId();

            this.dv = 800;
            this.comments.set(0);
            this.likes.set(0);
            this.retweets.set(0);
            this.views.set(Math.floor(Math.random() * 1000));
        });
    }
}
