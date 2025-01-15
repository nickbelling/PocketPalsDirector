import {
    Component,
    computed,
    ElementRef,
    inject,
    signal,
    viewChild,
} from '@angular/core';
import { ToastService } from '../../common/toast';
import { isNotEmpty } from '../../common/utils';
import {
    BaseQuestionEditDialog,
    CommonControllerModule,
} from '../base/controller';
import { SwitchThatReverseItDatabase } from './database';
import { SwitchThatReverseItQuestion } from './model';

@Component({
    imports: [CommonControllerModule],
    templateUrl: './question-edit.html',
})
export class SwitchThatReverseItQuestionEditDialog extends BaseQuestionEditDialog<SwitchThatReverseItQuestion> {
    private _db: SwitchThatReverseItDatabase;
    private _toast = inject(ToastService);
    private _firstControl =
        viewChild<ElementRef<HTMLInputElement>>('firstControl');

    protected prompt = signal<string>('');
    protected answer = signal<string>('');
    protected isValid = computed(
        () => isNotEmpty(this.prompt) && isNotEmpty(this.answer),
    );

    constructor() {
        const db = inject(SwitchThatReverseItDatabase);
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
            });

            this._toast.open(`Added '${this.answer()}'.`);

            // Don't close. Just reset
            this.prompt.set('');
            this.answer.set('');

            this._firstControl()?.nativeElement.focus();
        } finally {
            this.loading.set(false);
        }
    }
}
