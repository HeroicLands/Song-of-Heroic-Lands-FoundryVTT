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

import { SimpleRoll } from "@src/utils/SimpleRoll";
import { FilePath, toSanitizedHTML, HTMLString } from "@src/utils/helpers";
import type { SohlItem } from "@src/document/item/foundry/SohlItem";

/**
 * Foundry VTT runtime shim.
 *
 * This module wraps all direct access to Foundry VTT globals (`game`,
 * `canvas`, `foundry.*`, `CONFIG`, `ChatMessage`, etc.) behind a stable
 * API. During testing, vitest swaps this module for a mock that provides
 * no-op or simple implementations, allowing logic classes and utilities
 * to be unit-tested without a running Foundry VTT environment.
 *
 * @module FoundryHelpers
 */

// ---------------------------------------------------------------------------
// Dialog types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/** Deep-merge two objects using Foundry's mergeObject. */
export function fvttMergeObject(
    original: object,
    other: object,
    options?: { inplace?: boolean; insertKeys?: boolean; insertValues?: boolean },
): object {
    return foundry.utils.mergeObject(original, other, options) as object;
}

// ---------------------------------------------------------------------------
// Document resolution
// ---------------------------------------------------------------------------

/** Synchronously resolve a document by UUID. */
export function fvttResolveUuid(uuid: string): any {
    return fromUuidSync(uuid);
}

/** Asynchronously resolve a document by UUID. */
export async function fvttResolveUuidAsync(uuid: string): Promise<any> {
    return fromUuid(uuid);
}


// ---------------------------------------------------------------------------
// Dice
// ---------------------------------------------------------------------------

/**
 * Convert a {@link SimpleRoll} to a Foundry VTT Roll instance, preserving
 * the die results already recorded on the SimpleRoll so that Foundry can
 * display them in chat without re-rolling.
 */
export async function fvttToFoundryRoll(
    simpleRoll: SimpleRoll,
): Promise<foundry.dice.Roll> {
    const formulaParts: string[] = [];
    if (simpleRoll.numDice > 0 && simpleRoll.dieFaces > 0) {
        formulaParts.push(`${simpleRoll.numDice}d${simpleRoll.dieFaces}`);
    }
    if (simpleRoll.modifier !== 0) {
        formulaParts.push(
            (simpleRoll.modifier > 0 ? "+" : "") + simpleRoll.modifier,
        );
    }

    const formula = formulaParts.join(" ");
    const roll = new Roll(formula);
    for (const term of roll.terms) {
        if (term instanceof foundry.dice.terms.Die) {
            if (simpleRoll.rolls.length !== term.number) {
                throw new Error("Mismatch between term and provided rolls.");
            }
            term.results = simpleRoll.rolls.map((r) => ({
                result: r,
                active: true,
            }));
            await term.evaluate();
        }
    }
    return roll;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/** Call all hooks registered for the given event name. */
export function fvttCallHook(name: string, ...args: unknown[]): void {
    Hooks.callAll(name as any, ...args);
}

/**
 * Call hooks with cancellation support. Returns false if any handler
 * returns false explicitly, indicating that processing should be skipped.
 * Used for pre-phase hooks (preInitialize, preEvaluate, preFinalize).
 */
export function fvttCallHookCancel(name: string, ...args: unknown[]): boolean {
    return Hooks.call(name as any, ...args);
}

/** Report an error to the Foundry hook error handler. */
export function fvttHookOnError(source: string, error: Error, data?: object): void {
    Hooks.onError(source as any, error, data as any);
}

// ---------------------------------------------------------------------------
// System identity and CONFIG
// ---------------------------------------------------------------------------

/** Whether the current user has the GM role. */
export function fvttIsCurrentUserGM(): boolean {
    return !!(game as any).user?.isGM;
}

// ---------------------------------------------------------------------------
// Game state
// ---------------------------------------------------------------------------

/** Get the current world time in seconds. */
export function fvttWorldTime(): number {
    return game.time.worldTime;
}

/** Retrieve a game setting value. */
export function fvttGetSetting(module: string, key: string): unknown {
    return (game as any).settings.get(module, key);
}

/** Whether the current user is the active GM. */
export function fvttIsActiveGM(): boolean {
    return !!(game as any).user?.isActiveGM;
}

/** Get the current user document. */
export function fvttCurrentUser(): any {
    return (game as any).user;
}

/** Get the Intl.ListFormat formatter for the current game locale. */
export function fvttGetListFormatter(): Intl.ListFormat {
    return (game as any).i18n.getListFormatter();
}

// ---------------------------------------------------------------------------
// Document lookups
// ---------------------------------------------------------------------------

/** Get an actor by ID from the world collection. */
export function fvttGetActor(id: string): any {
    return (game as any).actors?.get(id) ?? null;
}

/** Get a scene by ID from the world collection. */
export function fvttGetScene(id: string): any {
    return (game as any).scenes?.get(id) ?? null;
}

/** Get a token by ID from the current canvas. */
export function fvttGetToken(id: string): any {
    return (canvas as any)?.tokens?.get(id) ?? null;
}

/** Get a user by ID from the world collection. */
export function fvttGetUser(id: string): any {
    return (game as any).users?.get(id) ?? null;
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

/** Create a chat message. */
export async function fvttCreateChatMessage(data: object): Promise<any> {
    return foundry.documents.ChatMessage.create(data);
}

/** Apply the specified roll mode to chat message data. */
export function fvttApplyRollMode(data: object, mode: string): void {
    ChatMessage.applyRollMode(data, mode as any);
}

// ---------------------------------------------------------------------------
// Rich text
// ---------------------------------------------------------------------------

/** Enrich HTML content using Foundry's TextEditor. */
export async function fvttEnrichHTML(content: string): Promise<string> {
    return foundry.applications.ux.TextEditor.implementation.enrichHTML(content);
}

// ---------------------------------------------------------------------------
// Template rendering
// ---------------------------------------------------------------------------

export async function toHTMLWithTemplate(
    template: FilePath,
    data: PlainObject = {},
): Promise<HTMLString> {
    const html = await foundry.applications.handlebars.renderTemplate(
        template,
        data,
    );
    return toSanitizedHTML(html);
}

export async function toHTMLWithContent(
    content: HTMLString,
    data: PlainObject = {},
): Promise<HTMLString> {
    const compiled = Handlebars.compile(content);
    const result = compiled(data, {
        allowProtoMethodsByDefault: true,
        allowProtoPropertiesByDefault: true,
    });
    return toSanitizedHTML(result);
}

// ---------------------------------------------------------------------------
// Dialogs
// ---------------------------------------------------------------------------

/**
 * Create a dialog with a yes/no option.
 *
 * If the user clicks yes, the promise resolves to `true`. If no, `false`.
 * If the user dismisses the dialog, the promise resolves to `null`, or
 * rejects with an error if `rejectClose` is `true`.
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
 * Create a dialog with an OK button.
 *
 * If the user clicks OK, the promise resolves to `true`. If dismissed,
 * resolves to `null`, or rejects if `rejectClose` is `true`.
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
 * Create a dialog with input fields to collect user input.
 *
 * When OK is clicked, resolves to a FormDataExtended object. If dismissed,
 * resolves to `null`, or rejects if `rejectClose` is `true`.
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
 * Create a dialog with a set of buttons.
 *
 * Resolves to the identifier of the clicked button or the value returned
 * by its callback. If dismissed, resolves to `null`, or rejects if
 * `rejectClose` is `true`.
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

// ---------------------------------------------------------------------------
// Sheet registration
// ---------------------------------------------------------------------------

/**
 * Unregister a custom sheet for a Foundry document class.
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

// ---------------------------------------------------------------------------
// Canvas and combat
// ---------------------------------------------------------------------------

/**
 * Determines the identity of the current token/actor that is in combat.
 * If token is specified, tries to use token (and will allow it regardless
 * if user is GM), otherwise returned token will be the combatant whose
 * turn it currently is.
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

export function getCurrentUser(): User {
    if (!(game.user instanceof User)) {
        throw new Error("User is not available");
    }
    return game.user;
}

export function getCurrentScene(): Scene {
    if (!(canvas.scene instanceof Scene)) {
        throw new Error("Scene is not available");
    }
    return canvas.scene;
}

// ---------------------------------------------------------------------------
// Pack / compendium helpers
// ---------------------------------------------------------------------------

/**
 * Retrieves documents from specified packs based on document name and type.
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

// ---------------------------------------------------------------------------
// Context menu helpers
// ---------------------------------------------------------------------------

/** Resolve the SohlItem for a context menu target element. */
export function getContextItem(header: HTMLElement): SohlItem | null {
    const element = header.closest(".item") as HTMLElement;
    const item =
        element?.dataset?.effectId && fromUuidSync(element.dataset.itemId);
    return item && typeof item === "object" ? (item as SohlItem) : null;
}

/** Resolve the Logic instance for a context menu target element. */
export function getContextLogic(element: HTMLElement): any {
    const found = element.closest(".logic") as any;
    if (!found) return null;
    return fromUuidSync(found.dataset.uuid);
}
