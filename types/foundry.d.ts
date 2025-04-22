declare global {
    interface FormDataExtendedOptions {
        editors?: Record<string, object>;
        dtypes?: Record<string, string>;
        disabled?: boolean;
        readonly?: boolean;
    }

    /**
     * A callback function for a dialog button.
     * @param event The DOM event that triggered the callback.
     * @param button The button element that was clicked.
     * @param dialog The HTML dialog element containing the button.
     * @returns Any value.
     */
    type DialogButtonCallback = (
        event: PointerEvent | SubmitEvent,
        button: HTMLButtonElement,
        dialog: HTMLDialogElement,
    ) => any;

    /**
     * A single dialog button definition.
     * @param action The action identifier for the button.
     * @param label The label for the button (will be localized).
     * @param icon The FontAwesome icon class for the button.
     * @param class The CSS class to apply to the button.
     * @param default If true, this is the default button.
     * @param callback The async function to run when the button is clicked.
     */
    interface DialogButton {
        action: string;
        label: string;
        icon: string;
        class: string;
        default?: boolean;
        callback: DialogButtonCallback;
    }

    /**
     * Callback executed when the dialog renders.
     * @param event The event that triggered the callback.
     * @param dialogElement The HTML dialog element.
     */
    type DialogRenderCallback = (
        event: Event,
        dialogElement: HTMLDialogElement,
    ) => Promise<void>;

    /**
     * Callback executed when the dialog closes.
     * @param event The event that triggered the callback.
     * @param dialog The Foundry VTT dialog instance.
     */
    type DialogCloseCallback = (
        event: Event,
        dialog: Record<string, any>,
    ) => Promise<void>;

    /**
     * Callback executed when the dialog submits.
     */
    type DialogSubmitCallback = (result: any) => Promise<void>;
}
