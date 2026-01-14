import { Component, computed, inject } from '@angular/core';
import { BaseGame, CommonGameModule } from '../base/game';
import { TagYoureItDatabase } from './database';
import { TAG_GROUPS, TagYoureItQuestion, TagYoureItState } from './model';

@Component({
    imports: [CommonGameModule],
    templateUrl: './game.html',
    styleUrl: './game.scss',
    host: { class: 'pocket-pals-game' },
})
export class TagYoureItGame extends BaseGame<
    TagYoureItState,
    TagYoureItQuestion
> {
    protected data: TagYoureItDatabase;

    constructor() {
        const database = inject(TagYoureItDatabase);
        super(database);
        this.data = database;
    }

    protected gameId = computed(() => this.currentQuestion()?.gameId);
    protected tags = computed(() => this.currentQuestion()?.tags || []);
    protected revealedTagIndex = computed(() => this.state().revealedTagIndex);
    protected showingAnswer = computed(() => this.state().showingAnswer);

    protected minBreakpoint = computed(
        () => TAG_GROUPS[this.revealedTagIndex()][0],
    );
    protected maxBreakpoint = computed(
        () => TAG_GROUPS[this.revealedTagIndex()][1],
    );

    protected oldTags = computed(() => {
        const minBreakpoint = this.minBreakpoint();
        return minBreakpoint > 0 ? this.tags().slice(0, minBreakpoint) : [];
    });

    protected newTags = computed(() => {
        const minBreakpoint = this.minBreakpoint();
        const maxBreakpoint = this.maxBreakpoint();
        return maxBreakpoint > 0
            ? this.tags().slice(minBreakpoint, maxBreakpoint)
            : [];
    });
}
