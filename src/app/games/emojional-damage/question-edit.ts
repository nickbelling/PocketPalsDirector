import {
    Component,
    computed,
    ElementRef,
    inject,
    signal,
    viewChild,
} from '@angular/core';
import { isNotEmpty } from '../../common/utils';
import {
    BaseQuestionEditDialog,
    CommonControllerModule,
} from '../base/controller';
import { EmojionalDamageDatabase } from './database';
import { EmojionalDamageQuestion } from './model';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './question-edit.html',
})
export class EmojionalDamageQuestionEditDialog extends BaseQuestionEditDialog<EmojionalDamageQuestion> {
    private _db: EmojionalDamageDatabase;
    private _firstControl =
        viewChild<ElementRef<HTMLInputElement>>('firstControl');

    protected prompt = signal<string>('');
    protected answer = signal<string>('');
    protected explanation = signal<string>('');
    protected isValid = computed(
        () => isNotEmpty(this.prompt) && isNotEmpty(this.answer),
    );

    constructor() {
        const db = inject(EmojionalDamageDatabase);
        super(db);
        this._db = db;
    }

    public async submit(): Promise<void> {
        if (!this.isValid()) return;

        this.loading.set(true);

        try {
            await this.addQuestion({
                prompt: this.prompt(),
                answer: this.answer(),
                explanation: this.explanation().length
                    ? this.explanation()
                    : null,
            });

            // Don't close. Just reset
            this.prompt.set('');
            this.answer.set('');
            this.explanation.set('');

            this._firstControl()?.nativeElement.focus();
        } finally {
            this.loading.set(false);
        }
    }
}
