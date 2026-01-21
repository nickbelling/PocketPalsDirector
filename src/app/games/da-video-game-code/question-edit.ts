import { Component, computed, effect, inject, signal } from '@angular/core';
import { v4 } from 'uuid';
import {
    every,
    hasAtLeast,
    isNotEmpty,
    isNotNull,
    resizeImage,
} from '../../common/utils';
import {
    BaseQuestionEditDialog,
    CommonControllerModule,
} from '../base/controller';
import { DaVideoGameCodeDatabase } from './database';
import { DA_VIDEO_GAME_CODE_BASE_PATH, DaVideoGameCodeQuestion } from './model';

interface PendingClue {
    title: string;
    imageFile: File | null;
    imageId: string | null;
}

@Component({
    imports: [CommonControllerModule],
    templateUrl: './question-edit.html',
    styleUrl: './question-edit.scss',
})
export class DaVideoGameCodeQuestionEditDialog extends BaseQuestionEditDialog<DaVideoGameCodeQuestion> {
    private _db: DaVideoGameCodeDatabase;

    protected readonly baseUrl = `${DA_VIDEO_GAME_CODE_BASE_PATH}/`;

    protected readonly title = signal<string>('');
    protected readonly notes = signal<string>('');
    protected readonly clues = signal<PendingClue[]>([]);

    protected readonly isValid = computed(
        () =>
            isNotEmpty(this.title) &&
            hasAtLeast(4, this.clues) &&
            every(
                this.clues,
                (clue) =>
                    isNotEmpty(clue.title) &&
                    (isNotNull(clue.imageId) || isNotNull(clue.imageFile)),
            ),
    );

    constructor() {
        const db = inject(DaVideoGameCodeDatabase);
        super(db);
        this._db = db;

        if (this.editing) {
            this.title.set(this.question?.title ?? '');
            this.notes.set(this.question?.notes ?? '');
            this.clues.set(
                this.question
                    ? this.question.clues.map((clue) => ({
                          ...clue,
                          imageFile: null,
                      }))
                    : [],
            );
        }

        effect(() => {
            const clues = this.clues();

            if (clues.length < 4) {
                this.clues.update((clues) => {
                    while (clues.length < 4) {
                        clues.push({
                            title: '',
                            imageFile: null,
                            imageId: null,
                        });
                    }
                    return [...clues];
                });
            }
        });
    }

    public updateClue(index: number, update: Partial<PendingClue>): void {
        this.clues.update((clues) => {
            clues[index] = { ...clues[index], ...update };
            return [...clues];
        });
    }

    public async submit(): Promise<void> {
        this.loading.set(true);

        try {
            const clues = this.clues();

            this.progress.start(clues.length + 1);

            for (const clue of clues) {
                if (clue.imageFile) {
                    this.progress.increment(
                        `Uploading image file for clue "${clue.title}"...`,
                    );
                    const resized = await resizeImage(
                        clue.imageFile,
                        600,
                        600,
                        true,
                    );
                    if (!clue.imageId) {
                        clue.imageId = v4();
                    }
                    await this.uploadFile(resized, clue.imageId);
                } else {
                    this.progress.increment('Image file already uploaded.');
                }
            }

            const question: DaVideoGameCodeQuestion = {
                title: this.title(),
                notes: this.notes(),
                clues: clues.map((clue) => ({
                    title: clue.title,
                    imageId: clue.imageId!,
                })),
            };

            if (this.editing) {
                this.progress.increment('Editing question...');
                await this.editQuestion(question);
            } else {
                this.progress.increment('Adding question...');
                await this.addQuestion(question);
            }
            this.dialog.close();
        } finally {
            this.progress.reset();
            this.loading.set(false);
        }
    }
}
