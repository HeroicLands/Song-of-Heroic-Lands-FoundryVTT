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

import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import {
    FilePath,
    HTMLString,
    isHTMLString,
    escapeHTML,
    setUuidResolver,
} from "@src/utils/helpers";
import type { DialogSpec } from "@src/utils/types";
import { AFFLICTION_SUBTYPE, ITEM_KIND } from "@src/utils/constants";
import type { AfflictionChoice } from "@src/document/actor/logic/affliction-contract";
import type { SohlItem } from "@src/document/item/foundry/SohlItem";
import type { SohlTokenDocument } from "@src/document/token/foundry/SohlTokenDocument";
import type { SohlScene } from "@src/document/scene/foundry/SohlScene";
import type { SohlLogic } from "@src/core/logic/SohlLogic";
import type { SohlCombatant } from "@src/document/combatant/foundry/SohlCombatant";
import type { SohlCombatantLogic } from "@src/document/combatant/logic/SohlCombatantLogic";
import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import type { SohlTokenDocumentLogic } from "@src/document/token/logic/SohlTokenDocumentLogic";
import { SohlCombat } from "@src/document/combat/foundry/SohlCombat";

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

// The dialog types are pure (Foundry-free) declarations and live in the shared
// util types module. They are re-exported here so the `dialog` boundary below
// and its consumers can keep importing them from the FoundryHelpers surface.
export type {
    DialogSpec,
    DialogButtonSpec,
    DialogResultCallback,
} from "@src/utils/types";

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Deep-merge two objects using Foundry's mergeObject.
 * @param original - The base object to merge into.
 * @param other - The object whose values are merged on top.
 * @param options - Foundry merge options.
 * @param options.inplace - Whether to mutate `original` in place.
 * @param options.insertKeys - Whether to insert keys absent from `original`.
 * @param options.insertValues - Whether to insert values for nested keys absent from `original`.
 * @returns The merged object.
 */
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

/**
 * Synchronously resolve a document by UUID.
 * @param uuid - The document UUID to resolve.
 * @returns The resolved document, or `undefined` if not found.
 */
export function fvttResolveUuid(uuid: string): any | undefined {
    return fromUuidSync(uuid) ?? undefined;
}

/**
 * Asynchronously resolve a document by UUID.
 * @param uuid - The document UUID to resolve.
 * @returns A promise resolving to the document, or `undefined` if not found.
 */
export async function fvttResolveUuidAsync(
    uuid: string,
): Promise<any | undefined> {
    return (await fromUuid(uuid)) ?? undefined;
}

/**
 * Resolve a Foundry Macro by UUID and run it via `Macro#execute`.
 *
 * @remarks
 * This is the sanctioned way to run author-supplied ("homebrew") behavior: the
 * command lives in a permission-gated `Macro` document, never in system data,
 * and `Macro#execute` enforces `canUserExecute` (ownership **and** the
 * `MACRO_SCRIPT` user permission) before running. No code is ever compiled from
 * serialized data. See {@link sohl.entity.action.SohlAction} and the Security Model doc.
 *
 * @param uuid - The Macro document UUID referenced by a Script action.
 * @param scope - Variables passed to the macro body (Foundry spreads these as
 *   `{ speaker, actor, token, ...scope }`).
 * @returns The macro's result, or `undefined` if the UUID does not resolve to a
 *   Macro (a non-Macro or missing document is ignored, not executed).
 */
export async function fvttExecuteMacro(
    uuid: string,
    scope: Record<string, unknown>,
): Promise<unknown> {
    const macro = await fromUuid(uuid);
    if (!macro || (macro as any).documentName !== "Macro") {
        sohl.log.warn(`fvttExecuteMacro: no Macro at uuid "${uuid}"`);
        return undefined;
    }
    return (macro as any).execute(scope);
}

/**
 * Resolve a document UUID to its SoHL logic instance, synchronously.
 *
 * @remarks The logic-layer counterpart of `fromUuidSync`: it hides the Foundry
 * document entirely, returning only the logic, so the logic layer can treat a
 * UUID as an opaque token and round-trip it back to logic. Like `fromUuidSync`,
 * it returns `undefined` for documents not already in memory (e.g. unloaded
 * compendium entries) — use {@link fvttLogicFromUuid} when that is possible.
 * @param uuid - The (opaque) document UUID.
 * @returns The document's logic, or `undefined` if unresolved.
 */
export function fvttLogicFromUuidSync<
    T extends SohlLogic<any> = SohlLogic<any>,
>(uuid: string): T | undefined {
    return (fromUuidSync(uuid) as any)?.logic ?? undefined;
}

/**
 * Resolve a document UUID to its SoHL logic instance.
 *
 * @remarks The async logic-layer counterpart of `fromUuid`, resolving
 * compendium / not-yet-loaded documents as well. Hides the Foundry document,
 * returning only the logic.
 * @param uuid - The (opaque) document UUID.
 * @returns A promise resolving to the document's logic, or `undefined` if unresolved.
 */
export async function fvttLogicFromUuid<
    T extends SohlLogic<any> = SohlLogic<any>,
>(uuid: string): Promise<T | undefined> {
    return ((await fromUuid(uuid)) as any)?.logic ?? undefined;
}

// ---------------------------------------------------------------------------
// Dice
// ---------------------------------------------------------------------------

/**
 * Convert a {@link SimpleRoll} to a Foundry VTT Roll instance, preserving
 * the die results already recorded on the SimpleRoll so that Foundry can
 * display them in chat without re-rolling.
 * @param simpleRoll - The {@link SimpleRoll} to convert.
 * @returns A promise resolving to the equivalent Foundry {@link foundry.dice.Roll}.
 * @throws Error if the SimpleRoll's recorded results do not match its dice terms
 *   (the count of rolled values differs from the number of dice to seed).
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

/**
 * Call all hooks registered for the given event name.
 * @param name - The hook event name.
 * @param args - Arguments forwarded to each hook handler.
 */
export function fvttCallHook(name: string, ...args: unknown[]): void {
    Hooks.callAll(name as any, ...args);
}

/**
 * Call hooks with cancellation support. Returns false if any handler
 * returns false explicitly, indicating that processing should be skipped.
 * Used for pre-phase hooks (preInitialize, preEvaluate, preFinalize).
 * @param name - The hook event name.
 * @param args - Arguments forwarded to each hook handler.
 * @returns `false` if any handler returned `false`, otherwise `true`.
 */
export function fvttCallHookCancel(name: string, ...args: unknown[]): boolean {
    return Hooks.call(name as any, ...args);
}

/**
 * Report an error to the Foundry hook error handler.
 * @param source - The source identifier where the error originated.
 * @param error - The error to report.
 * @param data - Optional context data for the error handler.
 */
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

/**
 * Whether the current user has the GM role.
 * @returns `true` if the current user is a GM.
 */
export function fvttIsCurrentUserGM(): boolean {
    return !!(game as any).user?.isGM;
}

// ---------------------------------------------------------------------------
// Game state
// ---------------------------------------------------------------------------

/**
 * Get the current world time in seconds.
 * @returns The current world time in seconds.
 */
export function fvttWorldTime(): number {
    return game.time.worldTime;
}

/**
 * Retrieve a game setting value.
 * @param module - The module/system namespace the setting is registered under.
 * @param key - The setting key.
 * @returns The stored setting value.
 */
export function fvttGetSetting(module: string, key: string): unknown {
    return (game as any).settings.get(module, key);
}

/**
 * Persist a game setting value.
 * @param module - The module/system namespace the setting is registered under.
 * @param key - The setting key.
 * @param value - The value to store.
 * @returns A promise resolving once the setting is written.
 */
export function fvttSetSetting(
    module: string,
    key: string,
    value: unknown,
): Promise<unknown> {
    return (game as any).settings.set(module, key, value);
}

/**
 * Whether the current user is the active GM.
 * @returns `true` if the current user is the active GM.
 */
export function fvttIsActiveGM(): boolean {
    return !!(game as any).user?.isActiveGM;
}

/**
 * Get the current user document.
 * @returns The current user document.
 */
export function fvttCurrentUser(): any {
    return (game as any).user;
}

/**
 * Get the Intl.ListFormat formatter for the current game locale.
 * @returns The locale-aware list formatter.
 */
export function fvttGetListFormatter(): Intl.ListFormat {
    return (game as any).i18n.getListFormatter();
}

// ---------------------------------------------------------------------------
// Document lookups
// ---------------------------------------------------------------------------

/**
 * Get an actor by ID from the world collection.
 * @param id - The actor document ID.
 * @returns The actor, or `undefined` if not found.
 */
export function fvttGetActor(id: string): any {
    return (game as any).actors?.get(id) ?? undefined;
}

/**
 * The active status-effect ids on an actor, read from its ActiveEffects.
 *
 * SoHL's custom data-prep lifecycle does not populate Foundry's core
 * `actor.statuses` set, so gather the ids from each effect's `statuses` field
 * (plus the legacy `flags.core.statusId`). Lets Foundry-free logic apply
 * status-driven rules (e.g. the health ceilings in `deriveHealth`) without
 * touching `actor.effects` directly.
 * @param actor - The actor whose active statuses to read.
 * @returns The set of active status-effect ids (empty when none/unavailable).
 */
export function fvttActorStatuses(
    actor: SohlActor | null | undefined,
): Set<string> {
    const statuses = new Set<string>();
    for (const effect of ((actor as any)?.effects ?? []) as Iterable<any>) {
        for (const sid of (effect.statuses ?? []) as Iterable<string>) {
            statuses.add(sid);
        }
        const legacyId = effect?.flags?.core?.statusId;
        if (legacyId) statuses.add(legacyId);
    }
    return statuses;
}

/**
 * Get a scene by ID from the world collection.
 * @param id - The scene document ID.
 * @returns The scene, or `undefined` if not found.
 */
export function fvttGetScene(id: string): any {
    return (game as any).scenes?.get(id) ?? undefined;
}

/**
 * Get a token by ID from the current canvas.
 * @param id - The token ID.
 * @returns The token, or `undefined` if not found.
 */
export function fvttGetToken(id: string): any {
    return (canvas as any)?.tokens?.get(id) ?? undefined;
}

/**
 * Get a user by ID from the world collection.
 * @param id - The user document ID.
 * @returns The user, or `undefined` if not found.
 */
export function fvttGetUser(id: string): any {
    return (game as any).users?.get(id) ?? undefined;
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

/**
 * Create a chat message.
 * @param data - The chat message creation data.
 * @returns A promise resolving to the created chat message.
 */
export async function fvttCreateChatMessage(data: object): Promise<any> {
    return foundry.documents.ChatMessage.create(data);
}

// ---------------------------------------------------------------------------
// Embedded documents
// ---------------------------------------------------------------------------

/**
 * Create embedded `Item` documents on an actor, addressed through its *logic*.
 *
 * @remarks The Foundry-free way for the logic layer to add items to an actor:
 * the caller passes an actor logic (or any logic that resolves to an owning
 * actor via {@link sohl.core.logic.SohlLogic.actor}) and plain item-creation data; this boundary
 * resolves the Foundry actor and performs the write. No-op when the logic has no
 * owning actor.
 * @param actorLogic - The actor's logic (or a logic whose `.actor` resolves it).
 * @param itemsData - Plain item-creation data objects.
 * @returns A promise resolving to the created items (empty when there is no actor).
 */
export async function fvttCreateEmbeddedItems(
    actorLogic: any,
    itemsData: object[],
): Promise<any[]> {
    const actor = actorLogic?.actor;
    if (!actor) return [];
    return (await actor.createEmbeddedDocuments("Item", itemsData)) as any[];
}

/**
 *  Delete embedded `Item` documents from an actor, addressed through its *logic*.
 *
 * @remarks The Foundry-free way for the logic layer to remove items from an actor:
 * the caller passes an actor logic (or any logic that resolves to an owning
 * actor via {@link sohl.core.logic.SohlLogic.actor}) and item IDs; this boundary
 * resolves the Foundry actor and performs the write. No-op when the logic has no
 * owning actor.
 * @param actorLogic - The actor's logic (or a logic whose `.actor` resolves it).
 * @param itemIds - The IDs of the items to delete.
 * @returns A promise that resolves when the items have been deleted.
 */
export async function fvttDeleteEmbeddedItems(
    actorLogic: any,
    itemIds: string[],
): Promise<void> {
    const actor = actorLogic?.actor;
    if (!actor) return;
    await actor.deleteEmbeddedDocuments("Item", itemIds);
}

/**
 * Gather every contractable disease — `affliction` items whose subtype is
 * `disease` — found in the world and in the Item compendium packs, as
 * {@link AfflictionChoice} records. Only diseases can be contracted. The
 * `source` of each is the affliction's creation data (`toObject()`), ready to
 * copy onto an actor.
 *
 * @remarks Raw Foundry access (`game.items`, `game.packs`) lives here at the
 * boundary so the logic layer receives plain data.
 * @returns The diseases, world entries first then pack entries.
 */
export async function fvttFindDiseases(): Promise<AfflictionChoice[]> {
    const out: AfflictionChoice[] = [];
    const isDisease = (doc: any): boolean =>
        doc?.type === ITEM_KIND.AFFLICTION &&
        doc.system?.subType === AFFLICTION_SUBTYPE.DISEASE;
    const toChoice = (doc: any): AfflictionChoice => ({
        name: doc.name,
        contagionIndex: doc.system?.contagionIndexBase ?? 0,
        source: doc.toObject(),
    });

    for (const item of ((game as any).items ?? []) as Iterable<any>) {
        if (isDisease(item)) out.push(toChoice(item));
    }

    for (const pack of ((game as any).packs ?? []) as Iterable<any>) {
        if (pack?.documentName !== "Item") continue;
        const docs = await pack.getDocuments({ type: ITEM_KIND.AFFLICTION });
        for (const doc of docs) if (isDisease(doc)) out.push(toChoice(doc));
    }

    return out;
}

/**
 * Apply the specified roll mode to chat message data.
 * @param data - The chat message data to mutate in place.
 * @param mode - The roll mode to apply.
 */
export function fvttApplyRollMode(data: object, mode: string): void {
    ChatMessage.applyRollMode(data, mode as any);
}

// ---------------------------------------------------------------------------
// Rich text
// ---------------------------------------------------------------------------

/**
 * Enrich HTML content using Foundry's TextEditor.
 * @param content - The raw HTML/text content to enrich.
 * @returns A promise resolving to the enriched HTML.
 */
export async function fvttEnrichHTML(content: string): Promise<string> {
    return foundry.applications.ux.TextEditor.implementation.enrichHTML(
        content,
    );
}

// ---------------------------------------------------------------------------
// HTML sanitization
// ---------------------------------------------------------------------------

/**
 * Sanitize a raw HTML string with Foundry's built-in **allowlist** sanitizer,
 * `foundry.utils.cleanHTML` — the same sanitizer Foundry applies to dialog and
 * journal-entry HTML. It rebuilds the fragment through the browser parser and
 * keeps only tags in `ALLOWED_HTML_TAGS` and attributes in
 * `ALLOWED_HTML_ATTRIBUTES`, and validates URL-bearing attributes (`href`,
 * `src`, …) against `ALLOWED_URL_SCHEMES` via `URL.parse`. This neutralizes
 * `<script>`, `on*` event handlers, whitespace/entity-obfuscated `javascript:`
 * URLs, `<base>`, SVG `xlink:href`, surviving inline `style`, and the
 * sanitize→serialize→reparse mutation-XSS (mXSS) that a tag/attribute denylist
 * misses (issue #161).
 *
 * `foundry.utils.cleanHTML` is a real client-side v14 API but is currently
 * absent from `fvtt-types`, so it is reached through an explicit cast here — the
 * one sanctioned place to touch the Foundry global.
 *
 * Note: `ALLOWED_URL_SCHEMES` includes `data`, so `data:` URLs are permitted,
 * matching Foundry's system-wide stance rather than being additionally blocked.
 * See the HTML-rendering guardrail in the
 * [Security Model](https://kb.heroiclands.com/dev/concepts/security-model/) doc.
 *
 * @param raw - Untrusted HTML markup to sanitize.
 * @returns The sanitized HTML markup.
 */
export function fvttCleanHTML(raw: string): string {
    return (
        foundry.utils as unknown as { cleanHTML(raw: string): string }
    ).cleanHTML(raw);
}

/**
 * Convert a string or {@link HTMLString} into a sanitized {@link HTMLString}.
 * Plain text (anything {@link isHTMLString} does not recognize as markup) is
 * HTML-escaped and wrapped in `wrapperTag`; markup is passed through Foundry's
 * allowlist sanitizer ({@link fvttCleanHTML}), which drops every disallowed tag
 * and attribute. This is the single HTML sanitizer for chat-card and dialog
 * content, reached via {@link toHTMLWithTemplate} / {@link toHTMLWithContent}.
 *
 * @param value - Plain text or HTML markup to sanitize.
 * @param wrapperTag - Element used to wrap plain-text input (default `"p"`).
 * @returns The sanitized HTML markup.
 */
export function toSanitizedHTML(
    value: string | HTMLString,
    wrapperTag: "p" | "div" | "span" = "p",
): HTMLString {
    const raw =
        isHTMLString(value) ? value : (
            `<${wrapperTag}>${escapeHTML(value)}</${wrapperTag}>`
        );
    return fvttCleanHTML(raw) as HTMLString;
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
    const result = compiled(data);
    return toSanitizedHTML(result);
}

// ---------------------------------------------------------------------------
// Dialogs
// ---------------------------------------------------------------------------

/**
 * The single, logic-level dialog primitive.
 *
 * Renders `template` (or `content`) with `data`, shows the buttons (a single
 * confirming `ok` button by default), and resolves to:
 * - the `callback` return value, when a `callback` is provided;
 * - otherwise `{ action, data }` — the pressed button's action plus the parsed
 *   form data;
 * - `null` if the dialog is dismissed (unless `rejectClose` is set, which
 *   rejects instead).
 *
 * All Foundry/DOM work — template rendering, `FormDataExtended` form parsing,
 * and `DialogV2` — lives here at the boundary, so callers in the logic layer
 * describe the dialog purely and receive a plain-object result.
 * @param spec - The dialog specification.
 * @returns The dialog result (see above), or `null` if dismissed.
 * @throws Error if the spec supplies neither `content` nor `template`.
 */
export async function dialog(spec: DialogSpec = {}): Promise<any> {
    let content: HTMLString;
    if (spec.template) {
        content = await toHTMLWithTemplate(spec.template, spec.data);
    } else if (spec.content) {
        content = await toHTMLWithContent(spec.content, spec.data);
    } else {
        throw new Error("Dialog content or template is required");
    }

    const buttonSpecs =
        spec.buttons && spec.buttons.length > 0 ?
            spec.buttons
        :   [{ action: "ok", label: "OK", default: true }];

    const buttons = buttonSpecs.map((b) => ({
        action: b.action,
        label: b.label ?? b.action,
        icon: b.icon,
        default: b.default ?? false,
        // Boundary: parse the rendered form into a plain object, then hand it to
        // the caller's pure `callback`. Callers never touch the DOM/DialogV2.
        callback: (_event: unknown, _button: unknown, dlg: any): unknown => {
            const form: HTMLFormElement | null =
                dlg?.element?.querySelector?.("form") ?? null;
            const formData = (
                form ?
                    new (foundry.applications as any).ux.FormDataExtended(form)
                        .object
                :   {}) as PlainObject;
            return spec.callback ?
                    spec.callback(formData, b.action)
                :   { action: b.action, data: formData };
        },
    }));

    return await (foundry.applications.api.DialogV2 as any).wait({
        window: { title: spec.title },
        content,
        modal: spec.modal ?? false,
        rejectClose: spec.rejectClose ?? false,
        // Foundry fires "render" on the initial render and every re-render; hand
        // the caller the dialog's root element for dynamic form behaviour.
        render:
            spec.render ?
                (_event: unknown, dlg: any) => spec.render!(dlg.element)
            :   undefined,
        buttons,
    });
}

// ---------------------------------------------------------------------------
// Sheets
// ---------------------------------------------------------------------------

/**
 * Open (and bring to front) a document's sheet.
 *
 * @remarks `Document#sheet` is typed as the union of the legacy
 * `FormApplication` and `ApplicationV2`, whose `render` signatures disagree —
 * only the deprecated ApplicationV1-compat overload (`render(true)`) satisfies
 * both. SoHL targets Foundry v14, where every sheet is an `ApplicationV2`, so
 * this wrapper narrows the union once, here at the boundary, and calls the
 * modern `render({ force: true })` form. Logic-layer callers get a
 * Foundry-free, deprecation-free entry point.
 * @param doc - The document whose sheet to render; a missing sheet is a no-op.
 */
export async function fvttRenderSheet(
    doc: { sheet?: unknown } | null | undefined,
): Promise<void> {
    const sheet = doc?.sheet as
        | { render?: (options: { force: boolean }) => unknown }
        | null
        | undefined;
    await sheet?.render?.({ force: true });
}

/**
 * Unregister a custom sheet for a Foundry document class.
 * @param documentClass - The Foundry document class the sheet was registered for.
 * @param sheetClass - The sheet class to unregister.
 * @param options
 * @param options.types - The document subtypes to unregister the sheet for.
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
 * The world's currently **active** scene (the one flagged active in the scene
 * navigation), or `undefined` when the game is unavailable or no scene is active.
 *
 * @returns The active `SohlScene`, or `undefined` if none is active.
 */
export function getActiveScene(): SohlScene | undefined {
    if (!(game instanceof foundry.Game)) return undefined;
    return game.scenes?.active as SohlScene;
}

/**
 * The currently active combat encounter (`game.combat`), or `undefined` when the
 * game is unavailable or no combat is active. Never throws.
 * @returns The active {@link Combat}, or `undefined` if none is active.
 */
export function getActiveCombat(): SohlCombat | undefined {
    if (!(game instanceof foundry.Game)) return undefined;
    return game.combat as SohlCombat;
}

/**
 * The {@link sohl.document.combatant.logic.SohlCombatantLogic} for the given actor's combatant in the active
 * combat, or `undefined` when the game is unavailable, no combat is active, or the
 * actor is not a combatant. The actor's active token (when one exists) is used
 * to disambiguate; otherwise the first combatant for the actor is taken.
 *
 * Lets Foundry-free logic (e.g. weapon/technique item logic) reach the
 * combatant action layer without touching `game`/`canvas` directly.
 * @param actor - The actor whose active combatant to resolve.
 * @returns The combatant's logic, or `undefined`.
 */
export function fvttActiveCombatantForActor(
    actor: SohlActor | null,
): SohlCombatantLogic | undefined {
    if (!actor) return undefined;
    const combat = getActiveCombat();
    if (!combat) return undefined;
    const tokenId = (actor.getActiveTokens?.()?.[0] as any)?.document?.id;
    const combatants = combat.combatants as any;
    const combatant = combatants.find?.(
        (c: any) =>
            (tokenId != null && c.tokenId === tokenId) ||
            c.actor?.id === actor.id,
    ) as SohlCombatant | undefined;
    return combatant?.logic as SohlCombatantLogic | undefined;
}

/**
 * The {@link sohl.document.combatant.logic.SohlCombatantLogic} of every combatant in the same combat as the given
 * combatant (including it), or an empty array when it is not in a combat.
 *
 * Lets the Foundry-free {@link sohl.document.combatant.logic.SohlCombatantLogic} reach its peers (for ally /
 * threat queries) without walking `combatant.combat.combatants` directly.
 * @param combatant - The combatant whose peers to resolve.
 * @returns The peer combatant logics, or an empty array.
 */
export function fvttCombatantLogics(
    combatant: SohlCombatant | null,
): SohlCombatantLogic[] {
    const combat = (combatant as any)?.combat;
    if (!combat) return [];
    return (combat.combatants as any).map(
        (c: any) => c.logic,
    ) as SohlCombatantLogic[];
}

/**
 * Prompt the GM to move a combatant into a {@link CombatantGroup}, delegating
 * the dialog and group creation/assignment to the document. Lets the
 * Foundry-free {@link sohl.document.combatant.logic.SohlCombatantLogic.moveToGroup} action trigger the operation
 * without invoking document methods directly.
 * @param combatant - The combatant to reassign.
 */
export async function fvttPromptMoveCombatantToGroup(
    combatant: SohlCombatant | null,
): Promise<void> {
    await (combatant as any)?.moveToGroup?.();
}

/**
 * The {@link sohl.document.token.logic.SohlTokenDocumentLogic} for the given actor's active token on the
 * canvas, or `undefined` when the game is unavailable or the actor has no token.
 *
 * Lets Foundry-free logic (e.g. skill/attribute item logic) reach the
 * token-logic layer — where opposed tests live — without touching `canvas`.
 * @param actor - The actor whose active token logic to resolve.
 * @returns The token's logic, or `undefined`.
 */
export function fvttActiveTokenLogicForActor(
    actor: SohlActor | null,
): SohlTokenDocumentLogic | undefined {
    if (!actor) return undefined;
    const token = (actor.getActiveTokens?.()?.[0] as any)?.document as
        | { logic?: SohlTokenDocumentLogic }
        | undefined;
    return token?.logic ?? undefined;
}

// ---------------------------------------------------------------------------
// Pack / compendium helpers
// ---------------------------------------------------------------------------

/**
 * Retrieves documents from specified packs based on document name and type.
 * @param packNames - The compendium pack names to search.
 * @param options - Filtering options.
 * @param options.documentName - The document type the pack must hold (e.g. `"Item"`).
 * @param options.docType - Optional document subtype to filter by.
 * @returns The matching documents as plain objects.
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
 * @param docName - The name of the document to find.
 * @param packNames - The compendium pack names to search.
 * @param options - Lookup options.
 * @param options.documentName - The document type the pack must hold.
 * @param options.docType - Optional document subtype to filter by.
 * @param options.keepId - Whether to preserve the source `_id` (otherwise a new ID is assigned).
 * @returns The matching document data prepared for import, or `undefined` if not found.
 */
export async function getDocumentFromPacks(
    docName: string,
    packNames: string[],
    options: { documentName?: string; docType?: string; keepId?: boolean } = {
        docType: "Item",
        keepId: false,
    },
): Promise<any | undefined> {
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

/**
 * Resolve the SohlItem for a context menu target element.
 * @param header - The context menu target element.
 * @returns The resolved `SohlItem`, or `undefined` if none could be resolved.
 */
export function getContextItem(header: HTMLElement): SohlItem | undefined {
    const element = header.closest(".item") as HTMLElement;
    const item =
        element?.dataset?.effectId && fromUuidSync(element.dataset.itemId);
    return item && typeof item === "object" ? (item as SohlItem) : undefined;
}

/**
 * Resolve the Logic instance for a context menu target element.
 * @param element - The context menu target element.
 * @returns The resolved Logic instance, or `null` if none could be resolved.
 */
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
 * @returns The targeted token document(s), or `undefined` if failed.
 */
export function fvttGetTargetedTokens(
    single: boolean = false,
): SohlTokenDocument[] | undefined {
    let result: SohlTokenDocument[] | undefined = undefined;
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
 * @param sourceToken - The source token logic.
 * @param targetToken - The target token logic.
 * @param gridUnits - Whether to return the distance in grid units rather than scene units.
 * @returns The distance, or `undefined` if not calculable.
 */
export function fvttRangeToTarget(
    sourceToken: SohlTokenDocumentLogic,
    targetToken: SohlTokenDocumentLogic,
    gridUnits: boolean = false,
): number | undefined {
    if (!canvas.scene?.grid) {
        sohl.log.uiWarn(`No scene active`);
        return undefined;
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
            (sourceToken.parent as any).object.center,
            (targetToken.parent as any).object.center,
        ],
        {},
    );

    if (!result) {
        sohl.log.uiWarn(
            `Could not calculate distance from ${sourceToken.id} to ${targetToken.id}`,
        );
        return undefined;
    }

    return gridUnits ? result.spaces : result.distance;
}

/**
 * The point used to measure distance to/from a combatant — its token center
 * (with elevation), or `undefined` when no placed token is available.
 * @param combatant - The combatant whose token center to read.
 * @returns The measure point, or `undefined`.
 */
function combatantMeasurePoint(
    combatant: SohlCombatant,
): { x: number; y: number; elevation: number } | undefined {
    const token = (combatant as any).token;
    const center = token?.object?.center ?? token?.center;
    if (!center) return undefined;
    return { x: center.x, y: center.y, elevation: token?.elevation ?? 0 };
}

/**
 * The center-to-center grid distance (feet) between two combatants' tokens, or
 * `undefined` when either token position is unavailable. The scene-coupled geometry
 * behind `CombatantLogic.reaches`.
 * @param a - The first combatant.
 * @param b - The second combatant.
 * @returns The grid distance in feet, or `undefined`.
 */
export function combatantGridDistance(
    a: SohlCombatant,
    b: SohlCombatant,
): number | undefined {
    const from = combatantMeasurePoint(a);
    const to = combatantMeasurePoint(b);
    if (!from || !to) return undefined;
    return getCanvas().grid?.measurePath([from, to], {})?.distance ?? undefined;
}

/**
 * The number of grid spaces a combatant has moved from a start location to its
 * token's current position.
 * @param combatant - The combatant whose movement to measure.
 * @param start - The turn-start location.
 * @param start.x - The start X coordinate.
 * @param start.y - The start Y coordinate.
 * @param start.elevation - The start elevation.
 * @returns The number of spaces moved.
 */
export function combatantSpacesMoved(
    combatant: SohlCombatant,
    start: { x: number; y: number; elevation: number },
): number {
    const current = combatantMeasurePoint(combatant) ?? {
        x: start.x,
        y: start.y,
        elevation: 0,
    };
    const result = getCanvas().grid?.measurePath(
        [
            { x: start.x, y: start.y, elevation: start.elevation },
            { x: current.x, y: current.y, elevation: current.elevation },
        ],
        {},
    );
    return result?.spaces ?? 0;
}

// ---------------------------------------------------------------------------
// Serialization boundary registration
// ---------------------------------------------------------------------------

// The pure serialization core in `helpers.ts` revives a `ClientDocument`
// reference (a UUID) through an injected resolver rather than importing this
// shim (which would make it Foundry-coupled and create an import cycle).
// Registering here — a load-time side effect of the shim — wires Foundry's
// UUID resolution in for every runtime code path, since any Foundry-side module
// imports FoundryHelpers.
setUuidResolver(fvttResolveUuid);
