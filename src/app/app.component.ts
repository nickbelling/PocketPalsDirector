import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, JsonPipe } from '@angular/common';
import { StateYourBidnessService } from './games/state-your-bidness/database.service';

@Component({
    standalone: true,
    imports: [CommonModule, RouterModule],
    providers: [StateYourBidnessService],
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
    private _db = inject(StateYourBidnessService);
    protected gameState = this._db.state;
    protected gameQuestions = this._db.questions;

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
