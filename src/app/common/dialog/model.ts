export enum SimpleDialogResult {
    Cancel = 0,
    Yes = 1,
    No = 2,
    Ok = 3,
    Delete = 4,
}

export enum SimpleDialogType {
    OkCancel = 0,
    YesNo = 1,
    YesNoCancel = 2,
    DeleteCancel = 3,
}

export interface SimpleDialogData {
    title: string;
    description: string;
    type: SimpleDialogType;
}
