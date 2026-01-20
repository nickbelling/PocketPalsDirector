import { Component, effect, inject, signal } from '@angular/core';
import { BuzzerDirectorDataStore } from '../../buzzers/data';
import { Entity } from '../../common/firestore';
import { BaseController, CommonControllerModule } from '../base/controller';
import { WhereInThisGameDatabase } from './database';
import {
    WHERE_IN_THIS_GAME_STATE_DEFAULT,
    WhereInThisGameQuestion,
    WhereInThisGameState,
} from './model';
import { ToMapGridReferencePipe } from './pipes';
import { WhereInThisGameQuestionEditDialog } from './question-edit';
import { fromGridRefString } from './utils';

@Component({
    imports: [CommonControllerModule, ToMapGridReferencePipe],
    templateUrl: './controller.html',
})
export class WhereInThisGameController extends BaseController<
    WhereInThisGameState,
    WhereInThisGameQuestion
> {
    private readonly _buzzers = inject(BuzzerDirectorDataStore);
    protected data: WhereInThisGameDatabase;

    protected readonly teams = this._buzzers.teams;

    protected readonly guesses = signal<Map<string, number>>(new Map());

    constructor() {
        const database = inject(WhereInThisGameDatabase);
        super(database);
        this.data = database;

        effect(() => {
            const state = this.state();
            const question = this.currentQuestion();

            if (question) {
                this.guesses.update((guesses) => {
                    for (const teamId of Object.keys(state.currentGuesses)) {
                        guesses.set(teamId, state.currentGuesses[teamId]);
                    }

                    return new Map(guesses);
                });
            }
        });
    }

    public async setQuestion(
        question?: Entity<WhereInThisGameQuestion>,
    ): Promise<void> {
        await this.setState({
            ...WHERE_IN_THIS_GAME_STATE_DEFAULT,
            currentQuestion: question?.id || null,
        });
    }

    public async setLocation(index: number | null): Promise<void> {
        await this.setState({
            currentLocation: index,
            currentGuesses: {},
            showingAnswer: false,
        });
    }

    public async showAnswer(): Promise<void> {
        await this.setState({
            showingAnswer: true,
        });
    }

    public updateGuess(teamId: string, location: string): void {
        const question = this.currentQuestion();

        if (question) {
            this.guesses.update((guesses) => {
                guesses.set(
                    teamId,
                    fromGridRefString(
                        location,
                        question.columns,
                        question.rows,
                    ),
                );
                return new Map(guesses);
            });
        }
    }

    public async updateGuesses(): Promise<void> {
        const question = this.currentQuestion();
        if (!question) return;
        const guesses: Record<string, number> = {};
        for (const [teamId, location] of this.guesses().entries()) {
            guesses[teamId] = location;
        }

        await this.setState({
            currentGuesses: guesses,
        });
    }

    public addQuestion(): void {
        this.editQuestion();
    }

    public editQuestion(question?: WhereInThisGameQuestion): void {
        this._dialog.open(WhereInThisGameQuestionEditDialog, {
            data: question,
            width: '80vw',
            minWidth: '80vw',
            height: '80vh',
        });
    }

    public override async deleteQuestion(
        question: Entity<WhereInThisGameQuestion>,
    ): Promise<void> {
        try {
            const deletions: Promise<unknown>[] = [
                // Delete the uploaded map file
                this.deleteFile(question.mapImageId),
            ];

            // Delete the location screenshots
            for (const location of question.locations) {
                deletions.push(this.deleteFile(location.locationImageId));
            }

            await Promise.all(deletions);

            // Finally, delete the actual question
            return await super.deleteQuestion(question);
        } catch (err: unknown) {
            this._toast.error(
                `Failed to delete question "${this.getQuestionString(question)}".`,
            );
        }
    }
}
