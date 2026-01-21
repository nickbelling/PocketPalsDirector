import { inject, Injectable } from '@angular/core';
import { VideogameDatabaseService } from '../../common/video-games';
import { BaseGameDatabase } from '../base/database';
import {
    BP_WHY_FI_BASE_PATH,
    BP_WHY_FI_STATE_DEFAULT,
    BpWhyFiQuestion,
    BpWhyFiState,
} from './model';

@Injectable({
    providedIn: 'root',
})
export class BpWhyFiDatabase extends BaseGameDatabase<
    BpWhyFiState,
    BpWhyFiQuestion
> {
    private readonly _vgdb = inject(VideogameDatabaseService);

    constructor() {
        super(BP_WHY_FI_BASE_PATH, BP_WHY_FI_STATE_DEFAULT);
    }

    public override getQuestionString(question: BpWhyFiQuestion): string {
        return this._vgdb.getGameName(question.gameId);
    }
}
