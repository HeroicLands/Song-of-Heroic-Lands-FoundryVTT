/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2025 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export function registerClass(clazz, name, schemaVersion) {
    if (!sohl.classRegistry.has(name)) {
        const element = {
            name,
            schemaVersion,
            ctor: clazz.constructor,
            dataFields: {},
        };
        clazz._metadata = element;
        sohl.classRegistry.set(name, element);
        return element;
    }
}

/**
 * Registers a data field in a class metadata element.
 * @param {Object} element - The class metadata element.
 * @param {string} fieldName - The name of the data field.
 * @param {Object} [data={}] - The data field configuration.
 * @returns {Object} The updated class metadata element.
 */
export function registerDataField(element, fieldName, data = {}) {
    if (!element.dataFields[fieldName]) {
        element.dataFields[fieldName] = data;
    }
    return element;
}

/*
 * =====================================================
 * Foundry VTT Wrapper Functions
 * =====================================================
 * These functions are wrappers around Foundry VTT's core functions
 * to enable easier mocking and access from Typescript.
 */

/**
 * @summary Renders a Handlebars template.
 * @param {string} path
 * @param {PlainObject} data
 *
 * @returns {Promise<string>} Returns the compiled and rendered template
 */
export async function renderTemplate(path, data) {
    return foundry.applications.handlebars.renderTemplate(path, data);
}

/**
 * Resolves a UUID to its corresponding Document or compendium index entry, using a synchronous lookup.
 *
 * @param {string} uuid - A string UUID identifying the Document to resolve. May be absolute or relative.
 * @param {object} options - Optional settings to control resolution behavior.
 * @param {Document} [options.relative] - A Document to use as the base for resolving relative UUIDs.
 * @param {boolean} [options.invalid=false] - If true, allows retrieval of documents marked as invalid.
 * @param {boolean} [options.strict=true] - If true, throws an error if the UUID cannot be resolved synchronously.
 *
 * @returns {Document} The resolved Document object, or a compendium index entry if the target resides in a compendium.
 * Returns `null` if the UUID is null/undefined or cannot be resolved and `strict` is false.
 *
 * @throws An error if the UUID cannot be resolved synchronously and `strict` is true.
 */
export function fromUuidSync(uuid, options = {}) {
    return foundry.utils.fromUuidSync(uuid, options);
}

/**
 * Asynchronously resolves a UUID to its corresponding Document.
 *
 * @param {string} uuid - A string UUID identifying the Document to retrieve. May be absolute or relative.
 * @param {object} options - Optional settings to control resolution behavior.
 * @param {Document} [options.relative] - A Document to use as the base for resolving relative UUIDs.
 * @param {boolean} [options.invalid=false] - If true, allows retrieval of documents marked as invalid.
 *
 * @returns {Promise<any>} A Promise that resolves to the retrieved Document. Resolves to `null` if the UUID
 * cannot be resolved.
 */
export async function fromUuid(uuid, options = {}) {
    return await foundry.utils.fromUuid(uuid, options);
}

/**
 * @typedef {Object} FormDataExtendedOptions
 * @summary Configuration options for FormDataExtended.
 * @property {boolean} [disabled] - Whether to include disabled fields in the form data.
 * @property {boolean} [readonly] - Whether to include readonly fields in the form data.
 * @property {Record<string, string>} [dtypes] - A mapping of field names to their expected data types.
 * @property {Record<string, object>} [editors] - A mapping of TinyMCE editor metadata indexed by update key.
 */

/**
 * @summary Extended FormData class for Foundry VTT.
 * @description
 * Extends the native FormData object with additional features for Foundry-specific form handling,
 * such as data type mapping, TinyMCE support, and inclusion of readonly/disabled fields.
 */
export class FormDataExtended extends foundry.applications.ux.FormDataExtended {
    /**
     * @param {HTMLFormElement} form
     * @param {FormDataExtendedOptions} options
     */
    constructor(form, options = {}) {
        super(form, options);
    }

    /**
     * @summary A mapping of field names to their expected data types.
     * @returns {Record<string, string>}
     */
    get dtypes() {
        return super.dtypes;
    }

    /**
     * @summary A mapping of TinyMCE editor metadata indexed by update key.
     * @returns {Record<string, string>}
     */
    get editors() {
        return super.editors;
    }

    /**
     * @summary The object representation of the form data.
     * @returns {Record<string, any>}
     */
    get object() {
        return super.object;
    }
}

/**
 * @callback DialogButtonCallback
 * @summary Callback executed when a dialog button is clicked.
 * @param {PointerEvent|SubmitEvent} event  The event that triggered the callback.
 * @param {HTMLButtonElement} button The button element that was clicked.
 * @param {HTMLDialogElement} dialog The dialog element.
 * @returns {Promise<any>}
 */

/**
 * @typedef {object} DialogButton
 * @summary Definition for a dialog button.
 * @property {string} action - The identifier of the button
 * @property {string} label - The label of the button (will be localized)
 * @property {string} icon - The FontAwesome icon class for the button
 * @property {string} class - The CSS class for the button
 * @property {boolean} [default] - If `true`, this button will be the default button
 * @property {DialogButtonCallback} callback - The callback function to be executed when the button is clicked
 */

/**
 * @callback DialogRenderCallback
 * @summary Executed when the dialog is rendered.
 * @param {Event} event The event that triggered the callback.
 * @param {HTMLDialogElement} dialogElement The dialog element.
 * @returns {Promise<void>}
 */

/**
 * @callback DialogCloseCallback
 * @summary Executed when the dialog is closed.
 * @param {Event} event The event that triggered the callback.
 * @param {Record<string, any>} dialog The Foundry VTT Dialog instance.
 * @returns {Promise<void>}
 */

/**
 * @callback DialogSubmitCallback
 * @summary Executed when the dialog is submitted.
 * @param {any} result
 * @returns {Promise<void>}
 */

/**
 * @typedef {Object} DialogConfig
 * @summary Common dialog configuration shared across dialog helpers.
 * @property {string} [title] - Dialog title.
 * @property {string} [content] - HTML content inside the dialog.
 * @property {boolean} [modal] - Whether the dialog should be modal.
 * @property {boolean} [rejectClose] - Whether to reject if dialog is dismissed.
 * @property {DialogRenderCallback} [render] - Callback on dialog render.
 * @property {DialogCloseCallback} [close] - Callback on dialog close.
 * @property {DialogSubmitCallback} [submit] - Callback on dialog submit.
 * @property {Partial<DialogButton>} [ok] - OK button configuration.
 * @property {Partial<DialogButton>} [yes] - Yes button configuration.
 * @property {Partial<DialogButton>} [no] - No button configuration.
 * @property {Partial<DialogButton>[]} [buttons] - List of custom buttons.
 */

/**
 * @typedef {Object} AwaitDialogResult
 * @summary Result of a user-interaction dialog.
 * @property {any} value - The value returned by the clicked button.
 * @property {string} action - The action identifier of the clicked button.
 */

/**
 * @summary Create a dialog with a yes/no option.
 * @description
 * This function creates a dialog with yes and no buttons. If the user clicks the yes button,
 * the promise resolves to `true`. If the user clicks the no button, the promise resolves to `false`.
 * If the user dismisses the dialog, the promise resolves to `null`, or rejects with an error if `rejectClose` is `true`.
 *
 * @param {object} config - The configuration object for the dialog.
 * @param {string} [config.title] - The title of the dialog.
 * @param {string} [config.content] - The content of the dialog.
 * @param {Partial<DialogButton>} [config.yes] - The callback function to be executed when the `yes` button is clicked; if not specified,
 *          clicking the `yes` button will resolve to `true`.
 * @param {Partial<DialogButton>} [config.no] - The callback function to be executed when the `no` button is clicked; if not specified,
 *          clicking the `no` button will resolve to `false`.
 * @param {boolan} [config.modal] - If `true`, the dialog will be modal and prevent interaction with the rest of the application.
 * @param {boolean} [config.rejectClose] - If `true`, the promise will be rejected if the dialog is dismissed.
 * @returns {Promise<any | null>} A promise that resolves to the result of the button callback, or `null` if
 *          the dialog was dismissed. If `rejectClose` is `true` the promise will be rejected with an error.
 */
export async function yesNoDialog(config = {}) {
    return await foundry.applications.api.DialogV2.confirm(config);
}

/**
 * @summary Create a dialog with an OK option.
 * @description
 * This function creates a dialog with an OK button. If the user clicks the OK button,
 * the promise resolves to `true`. If the user dismisses the dialog, the promise resolves to `null`,
 * or rejects with an error if `rejectClose` is `true`.
 *
 * @param {object} config - The configuration object for the dialog.
 * @param {string} config.title - The title of the dialog.
 * @param {string} config.content - The content of the dialog.
 * @param {Partial<DialogButton>} [config.ok] - The callback function to be executed when the `ok` button is clicked.
 * @param {DialogRenderCallback} [config.render] - An event listener for the `render` event.
 * @param {DialogCloseCallback} [config.close] - A callback function to be executed when the dialog is closed.
 * @param {DialogSubmitCallback} [config.submit] - A callback function to be executed when the dialog is submitted.
 * @param {boolan} [config.modal] - If `true`, the dialog will be modal and prevent interaction with the rest of the application.
 * @param {boolean} [config.rejectClose] - If `true`, the promise will be rejected if the dialog is dismissed.
 * @returns {Promise<any | null>} A promise that resolves to the result of the button callback, or `null` if
 *          the dialog was dismissed. If `rejectClose` is `true` the promise will be rejected with an error.
 */
export async function okDialog(config = {}) {
    return await foundry.applications.api.DialogV2.ok(config);
}

/**
 * @summary Create a dialog with a set of input fields to collect user input.
 * @description
 * This function creates a dialog with input fields and an OK button.  When the OK button is clicked,
 * the promise resolves to an object containing the values of the input fields.
 * If the user dismisses the dialog, the promise resolves to `null`, or rejects with an error if `rejectClose` is `true`.
 *
 * @param {object} config - The configuration object for the dialog.
 * @param {string} config.title - The title of the dialog.
 * @param {string} config.content - The content of the dialog.
 * @param {DialogButtonCallback} [config.callback] - The callback function to be executed when the `ok` button is clicked.
 * @param {DialogRenderCallback} [config.render] - An event listener for the `render` event.
 * @param {DialogCloseCallback} [config.close] - A callback function to be executed when the dialog is closed.
 * @param {DialogSubmitCallback} [config.submit] - A callback function to be executed when the dialog is submitted.
 * @param {boolan} [config.modal] - If `true`, the dialog will be modal and prevent interaction with the rest of the application.
 * @param {boolean} [config.rejectClose] - If `true`, the promise will be rejected if the dialog is dismissed.
 * @returns {Promise<PlainObject | null>} A promise that resolves to a Foundry VTT FormDataExtended object if OK is pressed, or `null` if
 *          the dialog was dismissed. If `rejectClose` is `true` the promise will be rejected with an error.
 */
export async function inputDialog(config = {}) {
    return await foundry.applications.api.DialogV2.input(config);
}

/**
 * @summary Create a dialog.
 * @description
 * This function creates a dialog with a set of buttons. When a button is clicked,
 * the promise resolves to the value of the button that was clicked.
 * If the user dismisses the dialog, the promise resolves to `null`, or rejects with an error if `rejectClose` is `true`.
 *
 * @param {object} config - The configuration object for the dialog.
 * @param {string} config.title - The title of the dialog.
 * @param {string} config.content - The content of the dialog.
 * @param {Partial<DialogButton>[]} [config.buttons] - An array of button objects.
 * @param {DialogRenderCallback} [config.render] - An event listener for the `render` event.
 * @param {DialogCloseCallback} [config.close] - A callback function to be executed when the dialog is closed.
 * @param {DialogSubmitCallback} [config.submit] - A callback function to be executed when the dialog is submitted.
 * @param {boolan} [config.modal] - If `true`, the dialog will be modal and prevent interaction with the rest of the application.
 * @param {boolean} [config.rejectClose] - If `true`, the promise will be rejected if the dialog is dismissed.
 * @returns {Promise<any>} Resolves to the identifier of the button used to submit the dialog, or the value
 *          returned by that button's callback.  If `rejectClose` is `true` the promise will be rejected with an error.
 */
export async function awaitDialog(config) {
    return await foundry.applications.api.DialogV2.wait(config);
}

/**
 * Notify that an error has occurred within foundry.
 * @param {string} location                The method where the error was caught.
 * @param {Error} error                    The error.
 * @param {Record<string, any>} [options={}]            Additional options to configure behaviour.
 * @param {string} [options.msg=""]        A message which should prefix the error or notification.
 * @param {?string} [options.log=null]     The level at which to log the error to console (if at all).
 * @param {?string} [options.notify=null]  The level at which to spawn a notification in the UI (if at all).
 * @param {Record<string, any>} [options.data={}]       Additional data to pass to the hook subscribers.
 */
export function onError(location, error, options = {}) {
    return foundry.helpers.Hooks.onError(location, error, {
        msg: options.msg ?? "",
        notify: options.notify ?? null,
        options: options.log ?? null,
        ...options.data,
    });
}

/**
 * @summary Get a system setting
 * @param {string} key - The key of the setting.
 * @param {string} [namespace="sohl"] - The namespace of the setting.
 * @returns {unknown} The stored value if present, otherwise `undefined`.
 */
export function getSystemSetting(key, namespace = "sohl") {
    return game.settings?.get(namespace, key);
}

/**
 * @summary Set a system setting
 * @param {string} key - The setting key.
 * @param {any} value - The value to store. Must be a supported type.
 * @param {string} [namespace="sohl"] - The namespace of the setting.
 * @returns {Promise<unknown>} The stored value.
 */
export async function setSystemSetting(key, value, namespace = "sohl") {
    return await game.settings?.set(namespace, key, value);
}

/**
 * @summary Send a warning message to the UI.
 * @param {string} message - The localizable message to display.
 * @param {Record<string, any>} [data={}] - Additional data to pass to the message.
 * @returns
 */
export function uiWarn(message, data = {}) {
    return ui.notifications?.warn(message, data);
}

/**
 * @summary Send an informational message to the UI.
 * @param {string} message - The localizable message to display.
 * @param {Record<string, any>} [data={}] - Additional data to pass to the message.
 * @returns
 */
export function uiInfo(message, data = {}) {
    return ui.notifications?.info(message, data);
}

/**
 * @summary Send a error message to the UI.
 * @param {string} message - The localizable message to display.
 * @param {Record<string, any>} [data={}] - Additional data to pass to the message.
 * @returns
 */
export function uiError(message, data = {}) {
    return ui.notifications?.error(message, data);
}

/**
 * @summary Retrieve the current game world time.
 * @returns {number} The current game world time.
 */
export function gameTimeNow() {
    return game.time.worldTime;
}

/**
 * Loads a JSON file and returns an object representing the JSON structure.
 *
 * @param {string} filepath path to the JSON file
 * @returns {JsonValue} The parsed JSON structure
 */
export async function loadJSONFromFile(filepath) {
    const json = await foundry.utils.fetchJsonWithTimeout(
        foundry.utils.getRoute(filepath, { prefix: ROUTE_PREFIX }),
    );
    return json;
}

/**
 * @summary Generates a unique name based on a prefix.
 * @description
 * Generates a unique name by appending numerical suffixes to the specified prefix
 * if necessary. Iterates over the provided items to ensure the generated name does
 * not already exist in the list.
 *
 * @param {string} prefix
 * @param {Map<any, any> | any[]} items
 * @returns {string} A unique name based on the provided prefix.
 * @example
 * const uniqueName = uniqueName("My Item", game.items);
 * console.log(uniqueName); // "My Item 1" or "My Item 2" if "My Item" already exists
 */
export function uniqueName(prefix, items) {
    let candidate = prefix;
    if (items instanceof Map || items instanceof Array) {
        const ary = Array.from(items);
        let ord = 0;
        while (ary.some((n) => n.name === candidate)) {
            ord++;
            candidate = `${prefix} ${ord}`;
        }
    }

    return candidate;
}
