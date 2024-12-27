import { computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Entity, SimpleDialogService } from '../../common';

export class BaseEntityEditDialog<TEntity extends object> {
    protected dialog = inject(MatDialogRef<BaseEntityEditDialog<TEntity>>);
    protected entity = inject<Entity<TEntity> | undefined | null>(
        MAT_DIALOG_DATA,
    );
    protected confirm = inject(SimpleDialogService);

    protected loading = signal<boolean>(false);
    protected editing: boolean =
        this.entity !== undefined && this.entity !== null;
    protected firebaseId = computed(() => this.entity?.firebaseId);

    constructor() {
        console.log('entity:', this.entity);
    }
}
