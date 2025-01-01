import { Component, inject } from '@angular/core';
import { BaseController, CommonControllerModule } from '../base/controller';
import { AvoidingTheDmcaDatabase } from './database';
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
    constructor() {
        super(inject(AvoidingTheDmcaDatabase));
    }

    public addQuestion(): void {
        this._dialog.open(AvoidingTheDmcaQuestionEditDialog);
    }
}
