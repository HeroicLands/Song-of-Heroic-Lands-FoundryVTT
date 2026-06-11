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
import type { SohlTokenDocument } from "@src/document/token/SohlTokenDocument";
import type { SohlScene } from "@src/document/scene/SohlScene";

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

/**
 * Handler invoked when a {@link DialogButton} is clicked.
 *
 * @param event - The pointer or submit event that triggered the button.
 * @param button - The clicked button element.
 * @param dialog - The host dialog element.
 * @returns A promise resolving to the value the dialog should yield.
 */
export type DialogButtonCallback = (
    event: PointerEvent | SubmitEvent,
    button: HTMLButtonElement,
    dialog: HTMLDialogElement,
) => Promise<any>;

/** Definition of a single button rendered in a dialog. */
export interface DialogButton {
    /** Unique action identifier returned when this button is selected. */
    action: string;
    /** Human-readable label shown on the button. */
    label: string;
    /** Icon (e.g. a Font Awesome class) displayed on the button. */
    icon: string;
    /** CSS class(es) applied to the button. */
    class: string;
    /** Whether this button is the default (activated on Enter). */
    default?: boolean;
    /** Handler invoked when the button is clicked. */
    callback: DialogButtonCallback;
}

/**
 * Handler invoked after a dialog's content is rendered.
 *
 * @param event - The render event.
 * @param dialogElement - The rendered dialog element.
 */
export type DialogRenderCallback = (
    event: Event,
    dialogElement: HTMLDialogElement,
) => Promise<void>;

/**
 * Handler invoked when a dialog is closed.
 *
 * @param event - The close event.
 * @param dialog - The dialog instance being closed.
 */
export type DialogCloseCallback = (
    event: Event,
    dialog: Record<string, any>,
) => Promise<void>;

/**
 * Handler invoked when a dialog is submitted.
 *
 * @param result - The value produced by the dialog's selected action.
 */
export type DialogSubmitCallback = (result: any) => Promise<void>;

/** Configuration options shared by the dialog helper functions in this module. */
export interface DialogConfig {
    /** Path to a Handlebars template rendered for the dialog body. Takes precedence over {@link DialogConfig.content}. */
    template?: FilePath;
    /** Title displayed in the dialog window header. */
    title?: string;
    /** Inline HTML used as the dialog body when no {@link DialogConfig.template} is given. */
    content?: HTMLString;
    /** Data passed to the template or inline content during rendering. */
    data?: PlainObject;
    /** Whether the dialog blocks interaction with the rest of the UI. */
    modal?: boolean;
    /** Whether dismissing the dialog rejects the promise instead of resolving to `null`. */
    rejectClose?: boolean;
    /** Handler invoked after the dialog content is rendered. */
    render?: DialogRenderCallback;
    /** Handler invoked when the dialog is closed. */
    close?: DialogCloseCallback;
    /** Handler invoked when the dialog is submitted. */
    submit?: DialogSubmitCallback;
    /** Overrides for the OK button (used by {@link okDialog}). */
    ok?: Partial<DialogButton>;
    /** Overrides for the Yes button (used by {@link yesNoDialog}). */
    yes?: Partial<DialogButton>;
    /** Overrides for the No button (used by {@link yesNoDialog}). */
    no?: Partial<DialogButton>;
    /** Custom set of buttons (used by {@link awaitDialog}). */
    buttons?: Partial<DialogButton>[];
}

/** Result returned from an awaited dialog interaction. */
export interface AwaitDialogResult {
    /** The value produced by the selected button's callback. */
    value: any;
    /** The action identifier of the selected button. */
    action: string;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/** Deep-merge two objects using Foundry's mergeObject. */
export function fvttMergeObject(
    original: object,
    other: object,
    options?: {
        inplace?: boolean;
        insertKeys?: boolean;
        insertValues?: boolean;
    },
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
export function fvttHookOnError(
    source: string,
    error: Error,
    data?: object,
): void {
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
    return foundry.applications.ux.TextEditor.implementation.enrichHTML(
        content,
    );
}

// ---------------------------------------------------------------------------
// Template rendering
// ---------------------------------------------------------------------------

/**
 * Render a Handlebars template file to sanitized HTML using Foundry's
 * template renderer.
 *
 * @param template - Path to the Handlebars template to render.
 * @param data - Context data supplied to the template.
 * @returns The rendered, sanitized HTML.
 */
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

/**
 * Compile and render inline Handlebars content to sanitized HTML.
 *
 * @param content - Inline Handlebars source to compile and render.
 * @param data - Context data supplied to the compiled template.
 * @returns The rendered, sanitized HTML.
 */
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
 *
 * @param token - An optional token to use; if the user is a GM or
 *   `forceAllow` is set it is used directly, otherwise it must match the
 *   current combatant.
 * @param forceAllow - When `true`, accept the supplied `token` even if the
 *   current user is not a GM.
 * @returns An object containing the resolved `token` and its `actor`, or
 *   `null` if no valid combatant could be determined (a UI warning is
 *   surfaced in that case).
 */
export function getTokenInCombat(
    token: any = null,
    forceAllow = false,
): {
    /** The token of the current combatant. */
    token: any;
    /** The actor associated with the resolved token. */
    actor: any;
} | null {
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

/**
 * Get the active Foundry canvas.
 *
 * @returns The current {@link foundry.canvas.Canvas} instance.
 * @throws If the canvas is not available.
 */
export function getCanvas(): foundry.canvas.Canvas {
    if (!(canvas instanceof foundry.canvas.Canvas)) {
        throw new Error("Canvas is not available");
    }
    return canvas;
}

/**
 * Get the active Foundry game instance.
 *
 * @returns The current {@link foundry.Game} instance.
 * @throws If the game is not available.
 */
export function getGame(): foundry.Game {
    if (!(game instanceof foundry.Game)) {
        throw new Error("Game is not available");
    }
    return game;
}

/**
 * Get the current user.
 *
 * @returns The current {@link User}.
 * @throws If the user is not available.
 */
export function getCurrentUser(): User {
    if (!(game.user instanceof User)) {
        throw new Error("User is not available");
    }
    return game.user;
}

/**
 * Get the scene currently shown on the canvas.
 *
 * @returns The current {@link Scene}.
 * @throws If no scene is available on the canvas.
 * @remarks Unlike {@link getActiveScene}, this returns the scene presently
 *   displayed on the canvas rather than the world's active scene.
 */
export function getCurrentScene(): Scene {
    if (!(canvas.scene instanceof Scene)) {
        throw new Error("Scene is not available");
    }
    return canvas.scene;
}

/**
 * The world's currently **active** scene (the one flagged active in the scene
 * navigation), or `null` when the game is unavailable or no scene is active.
 *
 * Unlike {@link getCurrentScene} (the scene presently shown on the canvas),
 * this returns `game.scenes.active` and never throws.
 */
export function getActiveScene(): Scene | null {
    if (!(game instanceof foundry.Game)) return null;
    return (game.scenes?.active as Scene | undefined) ?? null;
}

/**
 * The currently active combat encounter (`game.combat`), or `null` when the
 * game is unavailable or no combat is active. Never throws.
 */
export function getActiveCombat(): Combat | null {
    if (!(game instanceof foundry.Game)) return null;
    return (game.combat as Combat | undefined) ?? null;
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

// ---------------------------------------------------------------------------
// Token targeting helpers
// ---------------------------------------------------------------------------

/**
 * Gets the user-targeted tokens.
 *
 * @remarks
 * Note that this is the **targeted** tokens, not the selected tokens.
 *
 * @param single - Only return a single token if true, otherwise return an array of tokens.
 * @returns The targeted token document(s), or null if failed.
 */
export function fvttGetTargetedTokens(
    single: boolean = false,
): SohlTokenDocument[] | null {
    let result: SohlTokenDocument[] | null = null;
    const targetTokens: Set<Token> = ((game as any).user as User)
        ?.targets as unknown as Set<Token>;

    if (!targetTokens || targetTokens.size === 0) {
        sohl.log.uiWarn(`No tokens targeted.`);
    } else {
        if (single) {
            if (targetTokens.size > 1) {
                sohl.log.uiWarn(
                    `Multiple tokens targeted, please target only one token.`,
                );
            }
            result = [
                targetTokens.values().next().value!
                    .document as SohlTokenDocument,
            ];
        } else {
            result = Array.from(
                targetTokens.map((t) => t.document),
            ) as SohlTokenDocument[];
        }
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
export function fvttRangeToTarget(
    sourceToken: SohlTokenDocument,
    targetToken: SohlTokenDocument,
    gridUnits: boolean = false,
): number | null {
    if (!canvas.scene?.grid) {
        sohl.log.uiWarn(`No scene active`);
        return null;
    }
    if (!gridUnits && !["feet", "ft"].includes(canvas.scene.grid.units)) {
        sohl.log.uiWarn(
            `Scene uses units of ${canvas.scene.grid.units} but only feet are supported, distance calculation not possible`,
        );
        return 0;
    }

    if ((canvas.scene as unknown as SohlScene | null)?.logic?.isTotm) return 0;

    const result = getCanvas().grid?.measurePath(
        [
            (sourceToken as any).object.center,
            (targetToken as any).object.center,
        ],
        {},
    );

    if (!result) {
        sohl.log.uiWarn(
            `Could not calculate distance from ${sourceToken.id} to ${targetToken.id}`,
        );
        return null;
    }

    return gridUnits ? result.spaces : result.distance;
}
