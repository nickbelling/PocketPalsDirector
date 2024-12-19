import { Component, inject } from '@angular/core';
import { StateYourBidnessQuestion, StateYourBidnessService } from './database';
import { CommonGameControllerModule } from '../common-game.module';
import { MatDialog } from '@angular/material/dialog';
import { StateYourBidnessQuestionEditDialog } from './question-edit';
import { Entity } from '../base-database.service';
import { SimpleDialogService } from '../../common/dialog/simple-dialog.service';
import { SimpleDialogType } from '../../common/dialog/model';

@Component({
    selector: 'state-your-bidness-controller',
    templateUrl: './controller.html',
    imports: [CommonGameControllerModule],
    providers: [StateYourBidnessService],
})
export class StateYourBidnessController {
    private _db = inject(StateYourBidnessService);
    private _dialog = inject(MatDialog);
    private _confirm = inject(SimpleDialogService);
    protected gameState = this._db.state;
    protected gameQuestions = this._db.questions;

    public editQuestion(question?: Entity<StateYourBidnessQuestion>): void {
        this._dialog.open(StateYourBidnessQuestionEditDialog, {
            data: question,
        });
    }

    public async deleteQuestion(
        question: Entity<StateYourBidnessQuestion>
    ): Promise<void> {
        await this._confirm.open(
            SimpleDialogType.DeleteCancel,
            'Delete question',
            'Are you sure you want to delete this question?',
            {
                onDelete: async () => {
                    await this._db.removeQuestion(question);
                },
            }
        );
    }

    public async change(): Promise<void> {
        const state = this.gameState();
        state.guessedAnswers.push('abc');
        state.committedTo = state.committedTo + 1;
        await this._db.setState(state);
    }

    public async reset(): Promise<void> {
        await this._db.resetState();
    }
}
