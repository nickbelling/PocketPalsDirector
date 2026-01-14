import { Component, computed, inject, signal } from '@angular/core';
import { isGreaterThanZero, isNotNullOrUndefined } from '../../common/utils';
import {
    BaseQuestionEditDialog,
    CommonControllerModule,
} from '../base/controller';
import { TagYoureItDatabase } from './database';
import { TagYoureItQuestion } from './model';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './question-edit.html',
})
export class TagYoureItQuestionEditDialog extends BaseQuestionEditDialog<TagYoureItQuestion> {
    private _db: TagYoureItDatabase;

    protected gameId = signal<string | null>(null);
    protected steamAppId = signal<number>(0);

    protected isValid = computed(
        () =>
            isNotNullOrUndefined(this.gameId()) &&
            isGreaterThanZero(this.steamAppId()),
    );

    constructor() {
        const db = inject(TagYoureItDatabase);
        super(db);
        this._db = db;
    }

    public async submit(): Promise<void> {
        this.loading.set(true);

        const steamAppId = this.steamAppId();

        const question: TagYoureItQuestion = {
            gameId: this.gameId()!,
            steamAppId: steamAppId,
            tags: [],
        };

        this.progress.start(2);

        try {
            this.progress.increment('Getting user tags from Steam...');
            question.tags = await this._db.getSteamGameTags(steamAppId);

            await this.addQuestion(question);

            this.progress.finish();
            this.dialog.close();
        } catch (error) {
            this._toast.error('Failed to add the question.', error);
        }

        this.progress.reset();
        this.loading.set(false);
    }
}
