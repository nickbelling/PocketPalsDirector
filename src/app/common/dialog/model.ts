/** The possible results which can be returned from a confirmation dialog. */
export type ConfirmDialogResult = 'cancel' | 'yes' | 'no' | 'ok' | 'delete';

/** The combination of buttons which can appear in a confirmation dialog. */
export type ConfirmDialogType =
    | 'okCancel'
    | 'yesNo'
    | 'yesNoCancel'
    | 'deleteCancel';

export interface ConfirmDialogData {
    /** The type of dialog to display. */

    type: ConfirmDialogType;
    /** The title of the dialog as it will appear in the toolbar. */
    title: string;

    /** The question being asked of the user. */
    prompt: string;
}

export type Callback<T> = () => T | Promise<T>;

export interface ConfirmDialogOptions {
    /** Fired when the user clicks "Cancel" in the dialog. */
    onCancel?: Callback<void>;
    /** Fired when the user clicks "Yes" in the dialog. */
    onYes?: Callback<void>;
    /** Fired when the user clicks "No" in the dialog. */
    onNo?: Callback<void>;
    /** Fired when the user clicks "OK" in the dialog. */
    onOk?: Callback<void>;
    /** Fired when the user clicks "Delete" in the dialog. */
    onDelete?: Callback<void>;
}

export interface DocumentationDialogData {
    /** The title, as it should appear in the dialog's toolbar. */
    title: string;

    /** The main documentation to display, in Markdown format. */
    documentation: string;
}
