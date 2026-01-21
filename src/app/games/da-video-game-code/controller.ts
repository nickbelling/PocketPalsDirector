import { Component, inject } from '@angular/core';
import { Entity } from '../../common/firestore';
import { BaseController, CommonControllerModule } from '../base/controller';
import { DaVideoGameCodeDatabase } from './database';
import {
    DA_VIDEO_GAME_CODE_STATE_DEFAULT,
    DaVideoGameCodeQuestion,
    DaVideoGameCodeState,
} from './model';
import { DaVideoGameCodeQuestionEditDialog } from './question-edit';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './controller.html',
})
export class DaVideoGameCodeController extends BaseController<
    DaVideoGameCodeState,
    DaVideoGameCodeQuestion
> {
    protected data: DaVideoGameCodeDatabase;

    constructor() {
        const database = inject(DaVideoGameCodeDatabase);
        super(database);
        this.data = database;
    }

    public async setQuestion(
        question?: Entity<DaVideoGameCodeQuestion>,
    ): Promise<void> {
        await this.setState({
            ...DA_VIDEO_GAME_CODE_STATE_DEFAULT,
            currentQuestion: question?.id || null,
        });
    }

    public async showNextClue(): Promise<void> {
        await this.setState({
            showingClues: this.state().showingClues + 1,
        });
    }

    public addQuestion(): void {
        this.editQuestion();
    }

    public editQuestion(question?: DaVideoGameCodeQuestion): void {
        this._dialog.open(DaVideoGameCodeQuestionEditDialog, {
            data: question,
        });
    }
}
