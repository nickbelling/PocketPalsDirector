import { computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialog } from '../../../common/dialog';
import { Entity } from '../../../common/firestore';

/**
 * Base class for a dialog component for editing an entity of some description.
 * Abstracts away as much of the common stuff as possible.
 *
 * Assumes this is a `MatDialog`, with the given entity passed as `data` to the
 * `MatDialog.open()` call. Also assumes that if `data` is null or undefined
 * that the dialog will act as an "Add Entity" dialog instead.
 */
export class BaseEntityEditDialog<TEntity extends object> {
    protected dialog = inject(MatDialogRef<BaseEntityEditDialog<TEntity>>);
    protected confirm = inject(ConfirmDialog);

    /** The entity currently being edited. */
    public readonly entity = inject<Entity<TEntity> | undefined | null>(
        MAT_DIALOG_DATA,
    );

    /**
     * The ID of the entity currently being edited (or undefined if in add mode).
     */
    public readonly id = computed(() => this.entity?.id);

    /**
     * True if the component is loading in some way (used for disabling buttons,
     * preventing close, etc).
     */
    public readonly loading = signal<boolean>(false);

    /**
     * True if the dialog is in "editing" mode (if false, assumes "add" mode).
     */
    public readonly editing: boolean =
        this.entity !== undefined && this.entity !== null;
}
