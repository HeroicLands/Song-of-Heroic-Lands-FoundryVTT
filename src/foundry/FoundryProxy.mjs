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

import { SohlSpeaker } from "@logic/common/core/SohlSpeaker";

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
    return foundryHelpers.fromUuidSync(uuid, options);
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
    return await foundryHelpers.fromUuid(uuid, options);
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
 * Notify that an error has occurred within fvtt.
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
    const json = await foundryHelpers.fetchJsonWithTimeout(
        foundryHelpers.getRoute(filepath, { prefix: ROUTE_PREFIX }),
    );
    return json;
}

/**
 * Register a custom sheet for a Foundry document class.
 * @param {typeof foundry.abstract.Document} documentClass - The document class.
 * @param {Function} sheetClass - The sheet class.
 * @param {Object} [config] - Configuration options for the sheet.
 */
function registerSheet(documentClass, sheetClass, config) {
    const documentSheetConfig = foundry.applications.apps.DocumentSheetConfig;
    documentSheetConfig.registerSheet(
        documentClass,
        "sohl",
        sheetClass,
        config,
    );
}

/**
 * Unregister a custom sheet for a Foundry document class.
 * @param {typeof foundry.abstract.Document} documentClass - The document class.
 * @param {typeof FormApplication} sheetClass - The sheet class.
 * @param {Object} options - Options for unregistering the sheet.
 * @param {string[]} [options.types] - Specific types to unregister.
 */
function unregisterSheet(documentClass, sheetClass, { types }) {
    const documentSheetConfig = foundry.applications.apps.DocumentSheetConfig;
    documentSheetConfig.unregisterSheet(documentClass, "sohl", sheetClass, {
        types,
    });
}

/**
 * @typedef {Object} GetActorResult
 * @property {SohlItem|null} item
 * @property {SohlActor|null} actor
 * @property {Object} speaker
 */

/**
 * Utility class containing various helper methods for the SoHL system.
 */

/**
 * Determines the identity of the current token/actor that is in combat.
 * If token is specified, tries to use token (and will allow it regardless if user is GM.),
 * otherwise returned token will be the combatant whose turn it currently is.
 *
 * @param {Token|null} [token=null] - The token to check.
 * @param {boolean} [forceAllow=false] - Whether to force allow the token.
 * @returns {{ token: Token, actor: Actor }|null} The token and actor in combat, or null if not found.
 */
export function getTokenInCombat(token = null, forceAllow = false) {
    if (token && (game.user.isGM || forceAllow)) {
        return { token, actor: token.actor };
    }

    if (!game.combat?.started) {
        ui.notifications.warn("No active combat.");
        return null;
    }

    if (game.combat.combatants.size === 0) {
        ui.notifications.warn(`No combatants.`);
        return null;
    }

    const combatant = game.combat.combatant;

    if (combatant.isDefeated) {
        ui.notifications.warn(
            `Combatant ${combatant.token.name} has been defeated`,
        );
        return null;
    }

    if (token && token.id !== combatant.token.id) {
        ui.notifications.warn(
            `${combatant.token.name} is not the current combatant`,
        );
        return null;
    }

    if (!combatant.actor.isOwner) {
        ui.notifications.warn(
            `You do not have permissions to control the combatant ${combatant.token.name}.`,
        );
        return null;
    }

    token = canvas.tokens.get(combatant.token.id);
    if (!token) {
        throw new Error(`Token ${combatant.token.id} not found on canvas`);
    }

    return { token, actor: combatant.actor };
}

/**
 * Gets the user-targeted token.
 *
 * @param {Combatant} combatant - The combatant to check against.
 * @returns {TokenDocument|null} The targeted token document, or null if invalid.
 */
export function getUserTargetedToken(combatant) {
    const targets = game.user.targets;
    if (!targets?.size) {
        ui.notifications.warn(
            `No targets selected, you must select exactly one target, combat aborted.`,
        );
        return null;
    } else if (targets.size > 1) {
        ui.notifications.warn(
            `${targets} targets selected, you must select exactly one target, combat aborted.`,
        );
    }

    const targetTokens = Array.from(targets);
    if (!targetTokens.length) {
        return null;
    }
    const targetTokenDoc = targetTokens[0].document;

    if (combatant?.token && targetTokenDoc.id === combatant.token.id) {
        ui.notifications.warn(
            `You have targetted the combatant, they cannot attack themself, combat aborted.`,
        );
        return null;
    }

    return targetTokenDoc;
}

/**
 * Gets the actor based on the provided parameters.
 *
 * @param {Object} [params={}] - The parameters to use.
 * @param {SohlItem} [params.item] - The item to check.
 * @param {SohlActor} [params.actor] - The actor to check.
 * @param {Object} [params.speaker] - The speaker to check.
 * @returns {GetActorResult|null} The actor result, or null if not found.
 */
export function getActor(options = {}) {
    let item = options.item;
    let actor = options.actor;
    let speaker = options.speaker;

    const result = {
        item: null,
        actor: null,
        speaker: {},
    };
    if (item?.actor) {
        result.actor = item.actor;
        result.speaker = ChatMessage.getSpeaker({ actor: result.actor });
    } else {
        if (result.actor instanceof Actor) {
            result.speaker ||= ChatMessage.getSpeaker({
                actor: result.actor,
            });
        } else {
            if (!result.actor) {
                result.speaker = ChatMessage.getSpeaker();
                if (result.speaker?.token) {
                    const token = canvas.tokens.get(result.speaker.token);
                    result.actor = token.actor;
                } else {
                    result.actor = result.speaker?.actor;
                }
                if (!result.actor) {
                    ui.notifications.warn(`No actor selected, roll ignored.`);
                    return null;
                }
            } else {
                result.actor = foundry.utils.fromUuidSync(result.actor);
                result.speaker = ChatMessage.getSpeaker({
                    actor: result.actor,
                });
            }

            if (!result.actor) {
                ui.notifications.warn(`No actor selected, roll ignored.`);
                return null;
            }
        }
    }

    if (!cast(result.actor).isOwner) {
        ui.notifications.warn(
            `You do not have permissions to control ${cast(result.actor).name}.`,
        );
        return null;
    }

    return result;
}

/**
 * Calculates the distance from sourceToken to targetToken in "scene" units (e.g., feet).
 *
 * @param {Token|TokenDocument} sourceToken - The source token.
 * @param {Token|TokenDocument} targetToken - The target token.
 * @param {boolean} [gridUnits=false] - Whether to return in grid units.
 * @returns {number|null} The distance, or null if not calculable.
 */
export function rangeToTarget(sourceToken, targetToken, gridUnits = false) {
    sourceToken =
        sourceToken instanceof Token ? sourceToken.document : sourceToken;
    targetToken =
        targetToken instanceof Token ? targetToken.document : targetToken;
    if (!canvas.scene?.grid) {
        ui.notifications.warn(`No scene active`);
        return null;
    }
    if (!gridUnits && !["feet", "ft"].includes(canvas.scene.grid.units)) {
        ui.notifications.warn(
            `Scene uses units of ${canvas.scene.grid.units} but only feet are supported, distance calculation not possible`,
        );
        return 0;
    }

    if (canvas.scene.getFlag("sohl", "isTotm")) return 0;

    const result = canvas.grid.measurePath([
        sourceToken.object.center,
        targetToken.object.center,
    ]);

    return gridUnits ? result.spaces : result.distance;
}

/**
 * Returns the single selected token if there is exactly one token selected
 * on the canvas, otherwise issue a warning.
 *
 * @param {Object} [options]
 * @param {boolean} [options.quiet=false] - Suppress warning messages.
 * @returns {TokenDocument|null} The currently selected token, or null if not exactly one selected.
 */
export function getSingleSelectedToken(options = {}) {
    let quiet = options.quiet ?? false;
    const numTargets = canvas.tokens?.controlled?.length;
    if (!numTargets) {
        if (!quiet) ui.notifications.warn(`No selected tokens on the canvas.`);
        return null;
    }

    if (numTargets > 1) {
        if (!quiet)
            ui.notifications.warn(
                `There are ${numTargets} selected tokens on the canvas, please select only one`,
            );
        return null;
    }

    return canvas.tokens.controlled[0].document;
}

/**
 * Retrieves documents from specified packs based on document name and type.
 *
 * @param {string[]} packNames - The names of the packs to search.
 * @param {Object} [options]
 * @param {string} [options.documentName="Item"] - The document name to search for.
 * @param {string} [options.docType] - The document type to filter by.
 * @returns {Promise<any[]>} A promise resolving to an array of documents.
 */
export async function getDocsFromPacks(packNames, options = {}) {
    let documentName = options.documentName ?? "Item";
    let docType = options.docType;

    let allDocs = [];
    for (let packName of packNames) {
        const pack = game.packs.get(packName);
        if (!pack) continue;
        if (pack.documentName !== documentName) continue;
        const query = {};
        if (docType) {
            query.type = docType;
        }
        const items = await pack.getDocuments(query);
        allDocs.push(...items.map((it) => it.toObject()));
    }
    return allDocs;
}

/**
 * Retrieves a document from specified packs based on name and optional type.
 *
 * @param {string} docName - The name of the document to retrieve.
 * @param {string[]} packNames - The names of the packs to search.
 * @param {Object} [options]
 * @param {string} [options.documentName="Item"] - The document name to search for.
 * @param {string} [options.docType] - The document type to filter by.
 * @param {boolean} [options.keepId=false] - Whether to keep the original ID.
 * @returns {Promise<Object|null>} A promise resolving to the document data, or null if not found.
 */
export async function getDocumentFromPacks(docName, packNames, options = {}) {
    let documentName = options.documentName ?? "Item";
    let docType = options.docType;
    let keepId = options.keepId ?? false;

    let data = null;
    const allDocs = await getDocsFromPacks(packNames, {
        documentName,
        docType,
    });
    const doc = allDocs?.find((it) => it.name === docName);
    if (doc) {
        data = doc.toObject();
        if (!keepId) data._id = foundryHelpers.randomID();
        delete data.folder;
        delete data.sort;
        if (doc.pack)
            foundryHelpers.setProperty(
                data,
                "_stats.compendiumSource",
                doc.uuid,
            );
        if ("ownership" in data) {
            data.ownership = {
                default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER,
                [game.user.id]: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER,
            };
        }
        if (doc.effects) {
            data.effects = doc.effects.contents.map((e) => e.toObject());
        }
    }

    return data;
}

/**
 * @summary Creates a SohlSpeaker instance.
 * @param {SohlSpeakerData} speaker - The speaker data.
 * @param {string} rollMode - The roll mode to use.
 * @returns {SohlSpeaker} A new SohlSpeaker instance.
 */
export function speakerFactory(speaker, rollMode) {
    if (speaker) {
        return new SohlSpeaker(speaker, rollMode);
    }
    return new SohlSpeaker(
        foundry.documents.ChatMessage.getSpeaker(),
        rollMode,
    );
}

/**
 * @summary Creates a chat message in Foundry VTT.
 * @param {PlainObject} messageData - The data for the chat message.
 * @returns {Promise<void>} A promise that resolves when the message is created.
 */
export async function createChatMessage(messageData) {
    if (!messageData || typeof messageData !== "object") {
        throw new Error("Invalid message data provided.");
    }

    if (messageData.rollMode) {
        foundry.documents.ChatMessage.applyRollMode(messageData.rollMode);
        delete messageData.rollMode;
    }

    await foundry.documents.ChatMessage.create(messageData);
}

/**
 * @summary Checks if the speaker is the owner of the actor or token.
 * @param {SohlSpeakerData} speaker - The speaker data to check.
 * @returns {boolean} True if the speaker is the owner, false otherwise.
 */
export function getSpeakerIsOwner(speaker) {
    if (!speaker || typeof speaker !== "object") return false;
    if (speaker?.alias) {
        return true; // Alias is always considered owner
    }

    if (speaker?.token) {
        const token = canvas.tokens.get(speaker.token);
        if (token) {
            return token.isOwner;
        }
    } else if (speaker?.actor) {
        const actor = game.actors?.get(speaker.actor);
        if (actor) {
            return actor.isOwner;
        }
    }

    // If no token or actor is found, return false
    return false;
}

/**
 * @summary Retrieves the name of the speaker.
 * @param {SohlSpeakerData} speaker - The speaker data to check.
 * @returns {string} The name of the speaker.
 */
export function getSpeakerName(speaker) {
    if (!speaker || typeof speaker !== "object") {
        throw new Error("Invalid speaker data.");
    }

    // Use alias if provided
    if (speaker.alias) {
        return speaker.alias;
    }

    // Fallback to token name if alias is not available
    if (speaker.token) {
        const token = game.scenes?.active?.tokens?.get(speaker.token);
        if (token) {
            return token.name;
        }
    }

    // Fallback to actor name if token is not available
    if (speaker.actor) {
        const actor = game.actors?.get(speaker.actor); // Assuming `game.actors` is available in Foundry VTT
        if (actor) {
            return actor.name;
        }
    }

    // Default to "Unknown Speaker" if no name can be determined
    return "Unknown Speaker";
}

/**
 * @summary Retrieves the specified user or the current user if none specified.
 * @param {string|null} userId - The ID of the user to retrieve.
 * @returns {User|null} The current user.
 */
export function getUser(userId = null) {
    if (userId) {
        return game.users?.get(userId) ?? null;
    } else {
        return game.user ?? null;
    }
}

/**
 * @summary Retrieves the world actors.
 * @returns {Actor[]} The world actors.
 */
export function getWorldActors() {
    return game.actors?.contents ?? [];
}

/**
 * @summary Retrieves the world items.
 * @returns {Item[]} The world items.
 */
export function getWorldItems() {
    return game.items?.contents ?? [];
}

/**
 * @summary Retrieves the world canvas.
 * @returns {Canvas|null} The world canvas, or null if not found.
 */
export function getWorldCanvas() {
    return canvas ?? null;
}

/**
 * @summary Retrieves the active scene.
 * @returns {Scene|null} The active scene, or null if not found.
 */
export function getActiveScene() {
    return game.scenes?.active ?? null;
}

/**
 * @summary Retrieves the active combat.
 * @returns {Combat|null} The active combat, or null if not found.
 */
export function getActiveCombat() {
    return game.combat ?? null;
}

/**
 * @summary Retrieves the active combatant.
 * @returns {Combatant|null} The active combatant, or null if not found.
 */
export function getActiveCombatant() {
    return game.combat?.combatant ?? null;
}
