export type SimpleDialogResult = 'cancel' | 'yes' | 'no' | 'ok' | 'delete';

export type SimpleDialogType =
    | 'okCancel'
    | 'yesNo'
    | 'yesNoCancel'
    | 'deleteCancel';

export interface SimpleDialogData {
    title: string;
    description: string;
    type: SimpleDialogType;
}
