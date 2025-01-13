import { Component, inject } from '@angular/core';
import { Entity } from '../../common/firestore';
import { VideogameDatabaseService } from '../../common/video-games';
import { BaseController, CommonControllerModule } from '../base/controller';
import { LightlySteamedDatabase } from './database';
import {
    LIGHTLY_STEAMED_STATE_DEFAULT,
    LightlySteamedQuestion,
    LightlySteamedState,
} from './model';
import { LightlySteamedQuestionEditDialog } from './question-edit';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './controller.html',
})
export class LightlySteamedController extends BaseController<
    LightlySteamedState,
    LightlySteamedQuestion
> {
    protected data: LightlySteamedDatabase;
    private _vgDb = inject(VideogameDatabaseService);

    constructor() {
        const database = inject(LightlySteamedDatabase);
        super(database);
        this.data = database;
    }

    public async setQuestion(questionId: string): Promise<void> {
        await this.setState({
            ...LIGHTLY_STEAMED_STATE_DEFAULT,
            currentQuestion: questionId,
        });
    }

    public addQuestion(): void {
        this._dialog.open(LightlySteamedQuestionEditDialog);
    }

    public editQuestion(question: Entity<LightlySteamedQuestion>): void {
        this._dialog.open(LightlySteamedQuestionEditDialog, {
            autoFocus: false,
            data: question,
        });
    }

    public confirmDeleteQuestion(
        question: Entity<LightlySteamedQuestion>,
    ): void {
        this._confirm.open(
            'deleteCancel',
            'Delete question',
            `Are you sure you want to delete '${this._vgDb.getGameName(question.gameId)}'?`,
            {
                onDelete: async () => {
                    await this.deleteQuestion(question);
                },
            },
        );
    }
}
