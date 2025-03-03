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
    protected tagBreakpoint = computed(
        () => TAG_GROUPS[this.revealedTagIndex()],
    );
    protected tagsWithBreakpoint = computed(() => {
        let breakpoint = this.tagBreakpoint();
        let allTags = this.tags(),
            oldTags: Array<string> = [],
            newTags: Array<string> = [];

        if (allTags.length >= breakpoint[0])
            oldTags = allTags.slice(0, breakpoint[0]);

        if (allTags.length >= breakpoint[1])
            newTags = allTags.slice(breakpoint[0], breakpoint[1]);

        return [oldTags, newTags];
    });
}
