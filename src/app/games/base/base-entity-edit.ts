import { computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialog } from '../../common/dialog';
import { Entity } from '../../common/firestore';

export class BaseEntityEditDialog<TEntity extends object> {
    protected dialog = inject(MatDialogRef<BaseEntityEditDialog<TEntity>>);
    protected entity = inject<Entity<TEntity> | undefined | null>(
        MAT_DIALOG_DATA,
    );
    protected confirm = inject(ConfirmDialog);

    protected loading = signal<boolean>(false);
    protected editing: boolean =
        this.entity !== undefined && this.entity !== null;
    protected id = computed(() => this.entity?.id);

    constructor() {
        console.log('entity:', this.entity);
    }
}
