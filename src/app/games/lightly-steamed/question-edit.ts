import { Component, computed, inject, signal } from '@angular/core';
import {
    BaseQuestionEditDialog,
    CommonControllerModule,
} from '../base/controller';
import { LightlySteamedDatabase } from './database';
import { LightlySteamedQuestion, LightlySteamedQuestionReview } from './model';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './question-edit.html',
})
export class LightlySteamedQuestionEditDialog extends BaseQuestionEditDialog<LightlySteamedQuestion> {
    private _db: LightlySteamedDatabase;

    protected gameId = signal<string | null>(null);
    protected reviews = signal<LightlySteamedQuestionReview[]>([]);
    protected isValid = computed(
        () =>
            this.gameId() !== null &&
            this.reviews().length >= 5 &&
            this.reviews().every(
                (r) =>
                    r.username.trim().length > 0 &&
                    r.hoursPlayed > 0 &&
                    r.review.trim().length > 0,
            ),
    );

    protected reviewUsername = signal<string>('');
    protected reviewHours = signal<number>(0);
    protected reviewIsPositive = signal<boolean>(false);
    protected reviewContent = signal<string>('');
    protected reviewIsValid = computed(
        () =>
            this.reviewUsername().trim().length > 0 &&
            this.reviewHours() > 0 &&
            this.reviewContent().trim().length > 0,
    );

    constructor() {
        const db = inject(LightlySteamedDatabase);
        super(db);
        this._db = db;

        if (this.editing) {
            this.gameId.set(this.question?.gameId || 'dragon-age:-origins');
            this.reviews.set(this.question?.reviews || []);
        }
    }

    public async submit(): Promise<void> {
        this.loading.set(true);

        try {
            if (this.editing) {
                await this.editQuestion({
                    gameId: this.gameId()!,
                    reviews: this.reviews(),
                });
            } else {
                await this.addQuestion({
                    gameId: this.gameId()!,
                    reviews: this.reviews(),
                });
            }
            this.dialog.close();
        } finally {
            this.loading.set(false);
        }
    }

    public addReview(): void {
        if (this.reviewIsValid()) {
            const review: LightlySteamedQuestionReview = {
                username: this.reviewUsername(),
                hoursPlayed: this.reviewHours(),
                isPositive: this.reviewIsPositive(),
                review: this.reviewContent(),
            };

            this.reviews.update((reviews) => [...reviews, review]);

            this.reviewUsername.set('');
            this.reviewHours.set(0);
            this.reviewIsPositive.set(false);
            this.reviewContent.set('');
        }
    }

    public deleteReview(index: number): void {
        this.reviews.update((reviews) => {
            const updated = [...reviews];
            updated.splice(index, 1);
            return updated;
        });
    }
}
