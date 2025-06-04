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

import { SohlSpeakerData } from "@common";
import {
    FilePath,
    toHTMLWithContent,
    toHTMLWithTemplate,
    HTMLString,
} from "@utils";
import { SohlItem } from "@common/item";
import { SohlActor } from "@common/actor";
import { SohlTokenDocument } from "@common/token";
/*
 * =====================================================
 * Foundry VTT Wrapper Functions
 * =====================================================
 * These functions are wrappers around Foundry VTT's core functions
 * to enable easier mocking and access from Typescript.
 */

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
export function fromUuidSync(uuid: string, options: any = {}): any {
    return fvtt.utils.fromUuidSync(uuid, options);
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
export async function fromUuid(uuid: string, options: any = {}): Promise<any> {
    return await fvtt.utils.fromUuid(uuid, options);
}

// Dialog-related types
export type DialogButtonCallback = (
    event: PointerEvent | SubmitEvent,
    button: HTMLButtonElement,
    dialog: HTMLDialogElement,
) => Promise<any>;

export interface DialogButton {
    action: string;
    label: string;
    icon: string;
    class: string;
    default?: boolean;
    callback: DialogButtonCallback;
}

export type DialogRenderCallback = (
    event: Event,
    dialogElement: HTMLDialogElement,
) => Promise<void>;

export type DialogCloseCallback = (
    event: Event,
    dialog: Record<string, any>,
) => Promise<void>;

export type DialogSubmitCallback = (result: any) => Promise<void>;

export interface DialogConfig {
    template?: FilePath;
    title?: string;
    content?: HTMLString;
    data?: PlainObject;
    modal?: boolean;
    rejectClose?: boolean;
    render?: DialogRenderCallback;
    close?: DialogCloseCallback;
    submit?: DialogSubmitCallback;
    ok?: Partial<DialogButton>;
    yes?: Partial<DialogButton>;
    no?: Partial<DialogButton>;
    buttons?: Partial<DialogButton>[];
}

export interface AwaitDialogResult {
    value: any;
    action: string;
}

/**
 * @summary Create a dialog with a yes/no option.
 * @description
 * This function creates a dialog with yes and no buttons. If the user clicks the yes button,
 * the promise resolves to `true`. If the user clicks the no button, the promise resolves to `false`.
 * If the user dismisses the dialog, the promise resolves to `null`, or rejects with an error if `rejectClose` is `true`.
 *
 * @param {object} config - The configuration object for the dialog.
 * @returns A promise that resolves to the result of the button callback, or `null` if
 *          the dialog was dismissed. If `rejectClose` is `true` the promise will be rejected with an error.
 */
export async function yesNoDialog(
    config: Partial<DialogConfig> = {},
): Promise<any | null> {
    if (!config.template) {
        if (!config.content) {
            throw new Error("Dialog content or template is required");
        }
        config.content = await toHTMLWithContent(config.content, config.data);
    } else {
        config.content = await toHTMLWithTemplate(config.template, config.data);
    }
    return await foundry.applications.api.DialogV2.confirm(config as any);
}

/**
 * @summary Create a dialog with an OK option.
 * @description
 * This function creates a dialog with an OK button. If the user clicks the OK button,
 * the promise resolves to `true`. If the user dismisses the dialog, the promise resolves to `null`,
 * or rejects with an error if `rejectClose` is `true`.
 *
 * @param {object} config - The configuration object for the dialog.
 * @returns A promise that resolves to the result of the button callback, or `null` if
 *          the dialog was dismissed. If `rejectClose` is `true` the promise will be rejected with an error.
 */
export async function okDialog(
    config: Partial<DialogConfig> = {},
): Promise<any | null> {
    if (!config.template) {
        if (!config.content) {
            throw new Error("Dialog content or template is required");
        }
        config.content = await toHTMLWithContent(config.content, config.data);
    } else {
        config.content = await toHTMLWithTemplate(config.template, config.data);
    }
    return await (foundry.applications.api.DialogV2 as any).ok(config);
}

/**
 * @summary Create a dialog with a set of input fields to collect user input.
 * @description
 * This function creates a dialog with input fields and an OK button.  When the OK button is clicked,
 * the promise resolves to an object containing the values of the input fields.
 * If the user dismisses the dialog, the promise resolves to `null`, or rejects with an error if `rejectClose` is `true`.
 *
 * @param config - The configuration object for the dialog.
 * @returns A promise that resolves to a Foundry VTT FormDataExtended object if OK is pressed, or `null` if
 *          the dialog was dismissed. If `rejectClose` is `true` the promise will be rejected with an error.
 */
export async function inputDialog(
    config: Partial<DialogConfig & { callback: DialogButtonCallback }> = {},
): Promise<PlainObject | null> {
    if (!config.template) {
        if (!config.content) {
            throw new Error("Dialog content or template is required");
        }
        config.content = await toHTMLWithContent(config.content, config.data);
    } else {
        config.content = await toHTMLWithTemplate(config.template, config.data);
    }
    return await (foundry.applications.api.DialogV2 as any).input(config);
}

/**
 * @summary Create a dialog.
 * @description
 * This function creates a dialog with a set of buttons. When a button is clicked,
 * the promise resolves to the value of the button that was clicked.
 * If the user dismisses the dialog, the promise resolves to `null`, or rejects with an error if `rejectClose` is `true`.
 *
 * @param config - The configuration object for the dialog.
 * @returns A Promist containing the identifier of the button used to submit the dialog, or the value
 *          returned by that button's callback.  If `rejectClose` is `true` the promise will be rejected with an error.
 */
export async function awaitDialog(config: Partial<DialogConfig>): Promise<any> {
    if (!config.template) {
        if (!config.content) {
            throw new Error("Dialog content or template is required");
        }
        config.content = await toHTMLWithContent(config.content, config.data);
    } else {
        config.content = await toHTMLWithTemplate(config.template, config.data);
    }
    return await foundry.applications.api.DialogV2.wait(config as any);
}

/**
 * @summary Get a system setting
 * @param {string} key - The key of the setting.
 * @param namespace The namespace of the setting, defaults to `sohl`.
 * @returns {unknown} The stored value if present, otherwise `undefined`.
 */
export function getSystemSetting<T = unknown>(
    key: string,
    namespace = "sohl",
): T | undefined {
    return (game as any).settings?.get(namespace, key);
}

/**
 * @summary Set a system setting
 * @param key - The setting key.
 * @param value - The value to store. Must be a supported type.
 * @param namespace - The namespace of the setting, defaults to `sohl`.
 * @returns The stored value.
 */
export async function setSystemSetting<T>(
    key: string,
    value: T,
    namespace = "sohl",
): Promise<T> {
    return await (game as any).settings?.set(namespace, key, value);
}

/**
 * Unregister a custom sheet for a Foundry document class.
 * @param {typeof foundry.abstract.Document} documentClass - The document class.
 * @param {typeof FormApplication} sheetClass - The sheet class.
 * @param {Object} options - Options for unregistering the sheet.
 * @param {string[]} [options.types] - Specific types to unregister.
 */
export function unregisterSheet(
    documentClass: any,
    sheetClass: any,
    { types }: { types?: string[] },
): void {
    DocumentSheetConfig.unregisterSheet(documentClass, "sohl", sheetClass, {
        types,
    });
}

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
export function getTokenInCombat(
    token: any = null,
    forceAllow = false,
): { token: any; actor: any } | null {
    if (token && ((fvtt.game.user as any)?.isGM || forceAllow)) {
        return { token, actor: token.actor };
    }

    if (!fvtt.game.combat?.started) {
        fvtt.ui.notifications?.warn("No active combat.");
        return null;
    }

    if ((fvtt.game.combat as any).combatants.size === 0) {
        fvtt.ui.notifications?.warn(`No combatants.`);
        return null;
    }

    const combatant = fvtt.game.combat.combatant;

    if (combatant.isDefeated) {
        fvtt.ui.notifications?.warn(
            `Combatant ${combatant.token.name} has been defeated`,
        );
        return null;
    }

    if (token && token.id !== combatant.token.id) {
        fvtt.ui.notifications?.warn(
            `${combatant.token.name} is not the current combatant`,
        );
        return null;
    }

    if (!combatant.actor.isOwner) {
        fvtt.ui.notifications?.warn(
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
export function getUserTargetedToken(combatant: any): any {
    const targets = (fvtt.game.user as any)?.targets;
    if (!targets?.size) {
        fvtt.ui.notifications?.warn(
            `No targets selected, you must select exactly one target, combat aborted.`,
        );
        return null;
    } else if (targets.size > 1) {
        fvtt.ui.notifications?.warn(
            `${targets} targets selected, you must select exactly one target, combat aborted.`,
        );
    }

    const targetTokens = Array.from(targets);
    if (!targetTokens.length) {
        return null;
    }
    const targetTokenDoc = (targetTokens[0] as any).document;

    if (combatant?.token && targetTokenDoc.id === combatant.token.id) {
        fvtt.ui.notifications?.warn(
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
export function getTarget(
    options: {
        item?: SohlItem;
        actor?: SohlActor;
        speaker?: SohlSpeakerData;
    } = {},
): {
    item: SohlItem | null;
    actor: SohlActor | null;
    speaker: SohlSpeakerData;
} | null {
    const result = {
        item: options.item ?? null,
        actor: options.actor ?? null,
        speaker: options.speaker ?? ({} as SohlSpeakerData),
    };
    if (result.item) {
        result.speaker = ChatMessage.getSpeaker({
            actor: result.actor,
        }) as SohlSpeakerData;
        if (result.item.actor) {
            result.actor = result.item.actor;
        } else if (result.speaker?.actor) {
            result.actor = fromUuidSync(result.speaker.actor);
        }
    }

    if (result.actor) {
        result.speaker = ChatMessage.getSpeaker({
            actor: result.actor,
        }) as SohlSpeakerData;
    } else if (result.speaker?.actor) {
        result.actor = fromUuidSync(result.speaker.actor);
    }

    if (!result.actor && result.speaker?.token) {
        const token = canvas.tokens.get(result.speaker.token);
        result.actor = token?.actor;
    }

    return result;
}

/**
 * Calculates the distance from sourceToken to targetToken in "scene" units (e.g., feet).
 *
 * @param sourceToken - The source token.
 * @param targetToken - The target token.
 * @param gridUnits=false - Whether to return in grid units.
 * @returns {number|null} The distance, or null if not calculable.
 */
export function rangeToTarget(
    sourceToken: SohlTokenDocument,
    targetToken: SohlTokenDocument,
    gridUnits = false,
): number | null {
    if (!canvas.scene?.grid) {
        ui.notifications?.warn(`No scene active`);
        return null;
    }
    if (!gridUnits && !["feet", "ft"].includes(canvas.scene.grid.units)) {
        ui.notifications?.warn(
            `Scene uses units of ${canvas.scene.grid.units} but only feet are supported, distance calculation not possible`,
        );
        return 0;
    }

    if (canvas.scene.getFlag("sohl", "isTotm")) return 0;

    const result = canvas.grid.measurePath([
        (sourceToken as any).object.center,
        (targetToken as any).object.center,
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
export function getSingleSelectedToken(options: { quiet?: boolean } = {}): any {
    let quiet = options.quiet ?? false;
    const numTargets = canvas.tokens?.controlled?.length;
    if (!numTargets) {
        if (!quiet)
            fvtt.ui.notifications?.warn(`No selected tokens on the canvas.`);
        return null;
    }

    if (numTargets > 1) {
        if (!quiet)
            fvtt.ui.notifications?.warn(
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
export async function getDocsFromPacks(
    packNames: string[],
    options: { documentName?: string; docType?: string } = {},
): Promise<any[]> {
    let documentName = options.documentName ?? "Item";
    let docType = options.docType;

    let allDocs: any[] = [];
    for (let packName of packNames) {
        const pack = (fvtt.game.packs as any)?.get(packName);
        if (!pack) continue;
        if (pack.documentName !== documentName) continue;
        const query: any = {};
        if (docType) {
            query.type = docType;
        }
        const items = await pack.getDocuments(query);
        allDocs.push(...items.map((it: any) => it.toObject()));
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
export async function getDocumentFromPacks(
    docName: string,
    packNames: string[],
    options: { documentName?: string; docType?: string; keepId?: boolean } = {},
): Promise<any | null> {
    let documentName = options.documentName ?? "Item";
    let docType = options.docType;
    let keepId = options.keepId ?? false;

    let data = null;
    const allDocs = await getDocsFromPacks(packNames, {
        documentName,
        docType,
    });
    const doc = allDocs?.find((it: any) => it.name === docName);
    if (doc) {
        data = doc.toObject();
        if (!keepId) data._id = fvtt.utils.randomID();
        delete data.folder;
        delete data.sort;
        if (doc.pack)
            fvtt.utils.setProperty(data, "_stats.compendiumSource", doc.uuid);
        if ("ownership" in data) {
            data.ownership = {
                default: foundry.CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER,
                [(fvtt.game.user as any)?.id]:
                    foundry.CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER,
            };
        }
        if (doc.effects) {
            data.effects = doc.effects.contents.map((e: any) => e.toObject());
        }
    }

    return data;
}

/**
 * @summary Checks if the speaker is the owner of the actor or token.
 * @param {SohlSpeakerData} speaker - The speaker data to check.
 * @returns {boolean} True if the speaker is the owner, false otherwise.
 */
export function getSpeakerIsOwner(speaker: SohlSpeakerData): boolean {
    if (!speaker || typeof speaker !== "object") return false;
    if ((speaker as any)?.alias) {
        return true; // Alias is always considered owner
    }

    if ((speaker as any)?.token) {
        const token = canvas.tokens.get((speaker as any).token);
        if (token) {
            return token.isOwner;
        }
    } else if ((speaker as any)?.actor) {
        const actor = (fvtt.game.actors as any)?.get((speaker as any).actor);
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
export function getSpeakerName(speaker: SohlSpeakerData): string {
    if (!speaker || typeof speaker !== "object") {
        throw new Error("Invalid speaker data.");
    }

    // Use alias if provided
    if ((speaker as any).alias) {
        return (speaker as any).alias;
    }

    // Fallback to token name if alias is not available
    if ((speaker as any).token) {
        const token = fvtt.game.scenes?.active?.tokens?.get(
            (speaker as any).token,
        );
        if (token) {
            return token.name;
        }
    }

    // Fallback to actor name if token is not available
    if ((speaker as any).actor) {
        const actor = fvtt.game.actors?.get((speaker as any).actor);
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
export function getUser(userId: string | null = null): any {
    if (userId) {
        return fvtt.game.users?.get(userId) ?? null;
    } else {
        return fvtt.game.user ?? null;
    }
}

/**
 * @summary Retrieves the world actors.
 * @returns {Actor[]} The world actors.
 */
export function getWorldActors(): any[] {
    return fvtt.game.actors?.contents ?? [];
}

/**
 * @summary Retrieves the world items.
 * @returns {Item[]} The world items.
 */
export function getWorldItems(): any[] {
    return fvtt.game.items?.contents ?? [];
}

/**
 * @summary Retrieves the world canvas.
 * @returns {Canvas|null} The world canvas, or null if not found.
 */
export function getWorldCanvas(): any {
    return canvas ?? null;
}

/**
 * @summary Retrieves the active scene.
 * @returns {Scene|null} The active scene, or null if not found.
 */
export function getActiveScene(): any {
    return fvtt.game.scenes?.active ?? null;
}

/**
 * @summary Retrieves the active combat.
 * @returns {Combat|null} The active combat, or null if not found.
 */
export function getActiveCombat(): any {
    return fvtt.game.combat ?? null;
}

/**
 * @summary Retrieves the active combatant.
 * @returns {Combatant|null} The active combatant, or null if not found.
 */
export function getActiveCombatant(): any {
    return fvtt.game.combat?.combatant ?? null;
}
