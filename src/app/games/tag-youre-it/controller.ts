import { Component, inject } from '@angular/core';
import { Entity } from '../../common/firestore';
import { BaseController, CommonControllerModule } from '../base/controller';
import { TagYoureItDatabase } from './database';
import {
    TAG_GROUPS,
    TAG_YOURE_IT_STATE_DEFAULT,
    TagYoureItQuestion,
    TagYoureItState,
} from './model';
import { TagYoureItQuestionEditDialog } from './question-edit';
import docs from './README.md';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './controller.html',
})
export class TagYoureItController extends BaseController<
    TagYoureItState,
    TagYoureItQuestion
> {
    protected docs = docs;
    protected data: TagYoureItDatabase;

    constructor() {
        const database = inject(TagYoureItDatabase);
        super(database);
        this.data = database;
    }

    public async setQuestion(
        question?: Entity<TagYoureItQuestion>,
    ): Promise<void> {
        await this.setState({
            ...TAG_YOURE_IT_STATE_DEFAULT,
            currentQuestion: question?.id || null,
        });
    }

    public addQuestion(): void {
        this.editQuestion();
    }

    public editQuestion(question?: TagYoureItQuestion): void {
        this._dialog.open(TagYoureItQuestionEditDialog, {
            data: question,
        });
    }

    public async revealNextTagGroup(): Promise<void> {
        const state = this.state();
        let newRevealedTagIndex = state.revealedTagIndex + 1;
        if (newRevealedTagIndex >= TAG_GROUPS.length) return;

        await this.setState({
            revealedTagIndex: newRevealedTagIndex,
        });
    }

    public async showAnswer(): Promise<void> {
        await this.setState({
            showingAnswer: true,
        });
    }

    public allTagsRevealed(): boolean {
        const state = this.state();
        return state.revealedTagIndex >= TAG_GROUPS.length - 1;
    }

    public groupedTags(): Array<Array<string>> {
        let allTags = this.currentQuestion()?.tags;
        if (!allTags) return [];

        let groupedTags = [];

        for (let i = 1; i < TAG_GROUPS.length; i++) {
            groupedTags.push(
                allTags?.slice(TAG_GROUPS[i][0], TAG_GROUPS[i][1]),
            );
        }

        return groupedTags;
    }
}
