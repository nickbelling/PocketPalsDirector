import { Component, inject } from '@angular/core';
import { Entity } from '../../common/firestore';
import { BaseController, CommonControllerModule } from '../base/controller';
import { AvoidingTheDmcaDatabase } from './database';
import docs from './index.md';
import { AvoidingTheDmcaQuestion, AvoidingTheDmcaState } from './model';
import { AvoidingTheDmcaQuestionEditDialog } from './question-edit';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './controller.html',
})
export class AvoidingTheDmcaController extends BaseController<
    AvoidingTheDmcaState,
    AvoidingTheDmcaQuestion
> {
    protected docs = docs;

    constructor() {
        super(inject(AvoidingTheDmcaDatabase));
    }

    public addQuestion(): void {
        this._dialog.open(AvoidingTheDmcaQuestionEditDialog);
    }

    public async setQuestion(
        question?: Entity<AvoidingTheDmcaQuestion>,
    ): Promise<void> {
        await this.setState({
            currentQuestion: question?.id || null,
            playingBackwards: false,
            showingGame: false,
            showingTrack: false,
            playingForwards: false,
        });
    }

    public async togglePlayBackwards(playingBackwards: boolean): Promise<void> {
        await this.setState({ playingBackwards });
    }

    public async togglePlayForwards(playingForwards: boolean): Promise<void> {
        await this.setState({ playingForwards });
    }

    public async toggleShowGame(showingGame: boolean): Promise<void> {
        await this.setState({ showingGame });
    }

    public async toggleShowTrack(showingTrack: boolean): Promise<void> {
        await this.setState({ showingTrack });
    }

    public async resetQuestion(): Promise<void> {
        await this.setState({
            showingGame: false,
            showingTrack: false,
            playingBackwards: false,
            playingForwards: false,
        });
    }
}
