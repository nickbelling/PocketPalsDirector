export type ConfirmDialogResult = 'cancel' | 'yes' | 'no' | 'ok' | 'delete';

export type ConfirmDialogType =
    | 'okCancel'
    | 'yesNo'
    | 'yesNoCancel'
    | 'deleteCancel';

export interface ConfirmDialogData {
    title: string;
    description: string;
    type: ConfirmDialogType;
}
