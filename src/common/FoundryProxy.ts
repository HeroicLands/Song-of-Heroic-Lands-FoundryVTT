/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import {
    FilePath,
    toHTMLWithContent,
    toHTMLWithTemplate,
    HTMLString,
} from "@utils/helpers";

/*
 * =====================================================
 * Foundry VTT Wrapper Functions
 * =====================================================
 * These functions are wrappers around Foundry VTT's core functions
 * to enable easier mocking and access from Typescript.
 */

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
    foundry.applications.apps.DocumentSheetConfig.unregisterSheet(
        documentClass,
        "sohl",
        sheetClass,
        {
            types,
        },
    );
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
    if (token && ((game as any).user?.isGM || forceAllow)) {
        return { token, actor: token.actor };
    }

    if (!(game as any).combat?.started) {
        sohl.log.uiWarn("No active combat.");
        return null;
    }

    if ((game as any).combat.combatants.size === 0) {
        sohl.log.uiWarn(`No combatants.`);
        return null;
    }

    const combatant = (game as any).combat.combatant;

    if (combatant.isDefeated) {
        sohl.log.uiWarn(`Combatant ${combatant.token.name} has been defeated`);
        return null;
    }

    if (token && token.id !== combatant.token.id) {
        sohl.log.uiWarn(`${combatant.token.name} is not the current combatant`);
        return null;
    }

    if (!combatant.actor.isOwner) {
        sohl.log.uiWarn(
            `You do not have permissions to control the combatant ${combatant.token.name}.`,
        );
        return null;
    }

    token = getCanvas().tokens?.get(combatant.token.id);
    if (!token) {
        throw new Error(`Token ${combatant.token.id} not found on canvas`);
    }

    return { token, actor: combatant.actor };
}

export function getCanvas(): foundry.canvas.Canvas {
    if (!(canvas instanceof foundry.canvas.Canvas)) {
        throw new Error("Canvas is not available");
    }
    return canvas;
}

export function getGame(): foundry.Game {
    if (!(game instanceof foundry.Game)) {
        throw new Error("Game is not available");
    }
    return game;
}

export function getUser(): User {
    if (!(game.user instanceof User)) {
        throw new Error("User is not available");
    }
    return game.user;
}

export function getScene(): Scene {
    if (!(canvas.scene instanceof Scene)) {
        throw new Error("Scene is not available");
    }
    return canvas.scene;
}

/**
 * Retrieves documents from specified packs based on document name and type.
 *
 * @param packNames - The names of the packs to search.
 * @param options
 * @param options.documentName The document name to search for.
 * @param options.docType The document type to filter by.
 * @returns A promise resolving to an array of documents.
 */
export async function getDocsFromPacks(
    packNames: string[],
    options: { documentName?: string; docType?: string } = {
        documentName: "Item",
    },
): Promise<any[]> {
    let allDocs: any[] = [];
    for (let packName of packNames) {
        const pack = ((game as any).packs as any)?.get(packName);
        if (!pack) continue;
        if (pack.documentName !== options.documentName) continue;
        const query: PlainObject = {};
        if (options.docType) {
            query.type = options.docType;
        }
        const items = await pack.getDocuments(query);
        allDocs.push(...items.map((it: any) => it.toObject()));
    }
    return allDocs;
}

/**
 * Retrieves a document from specified packs based on name and optional type.
 *
 * @param  docName The name of the document to retrieve.
 * @param  packNames The names of the packs to search.
 * @param options
 * @param options.documentName The document name to search for.
 * @param options.docType The document type to filter by.
 * @param options.keepId Whether to keep the original ID.
 * @returns A promise resolving to the document data, or undefined if not found.
 */
export async function getDocumentFromPacks(
    docName: string,
    packNames: string[],
    options: { documentName?: string; docType?: string; keepId?: boolean } = {
        docType: "Item",
        keepId: false,
    },
): Promise<Optional<any>> {
    let data;
    const allDocs = await getDocsFromPacks(packNames, {
        documentName: options.documentName,
        docType: options.docType,
    });
    const doc = allDocs?.find((it: any) => it.name === docName);
    if (doc) {
        data = doc.toObject();
        if (!options.keepId) data._id = foundry.utils.randomID();
        delete data.folder;
        delete data.sort;
        if (doc.pack)
            foundry.utils.setProperty(
                data,
                "_stats.compendiumSource",
                doc.uuid,
            );
        if ("ownership" in data) {
            data.ownership = {
                default: foundry.CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER,
                [((game as any).user as any)?.id]:
                    foundry.CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER,
            };
        }
        if (doc.effects) {
            data.effects = doc.effects.contents.map((e: any) => e.toObject());
        }
    }

    return data;
}
