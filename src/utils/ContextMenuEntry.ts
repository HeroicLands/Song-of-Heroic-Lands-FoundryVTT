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

import type { SohlItem } from "@src/document/item/foundry/SohlItem";
import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import type { HTMLString } from "@src/utils/helpers";
import type { SohlContextMenuSortGroup } from "@src/utils/constants";
import { fvttGetActor, getContextItem } from "@src/core/FoundryHelpers";
import { SohlActionContext } from "@src/core/SohlActionContext";
import { SafeExpression, STANDARD_HELPERS } from "@src/utils/SafeExpression";

/**
 * The Foundry-free context-menu primitives shared by the logic layer and the
 * {@link import("./SohlContextMenu").SohlContextMenu} UI control.
 *
 * Logic classes build {@link ContextMenuEntry} lists describing their
 * available actions; the Foundry-side `SohlContextMenu` (which extends
 * Foundry's `ContextMenu` UI class) consumes them. Keeping the entry shape,
 * condition compilation, and DOM resolution helpers here lets the logic layer
 * stay importable without Foundry globals.
 */

/**
 * Callback type for context menu open/close events.
 */
export type ContextMenuCallback = (target: HTMLElement) => unknown;

/**
 * A context-menu predicate. Two forms are accepted:
 *
 * - **string** — evaluated as a SafeExpression (see
 *   {@link SafeExpression}) against a context with `target` (the
 *   triggering HTMLElement) plus lazy `item` and `actor` getters
 *   resolved from the nearest `data-item-id` / `data-actor-id`
 *   ancestor. Examples: `"true"`, `"item.system.canTransmit"`,
 *   `"defined(item) && item.type === 'skill'"`. This is the form
 *   stored in document data.
 * - **function** — a `(target) => boolean` predicate, passed through
 *   unchanged. Used for entries built programmatically (e.g. from a
 *   `SohlAction`'s trigger), where the predicate needs to close over
 *   runtime state that a SafeExpression source can't reference.
 */
export type ContextMenuCondition = string | ((target: HTMLElement) => boolean);

/**
 * The raw data describing a single context-menu entry, before it is
 * normalized into a {@link ContextMenuEntry} or compiled for Foundry's
 * ContextMenu base class.
 */
export interface ContextMenuEntryContext {
    /** Unique identifier for the entry. */
    id: string;
    /** Display label for the entry. */
    name: string;
    /** Pre-built HTML icon markup; mutually optional with `iconFAClass`. */
    icon?: HTMLString;
    /** Font-Awesome CSS class used to build an icon when `icon` is absent. */
    iconFAClass?: string;
    /** Name of the logic method to invoke when no explicit `callback` is given. */
    functionName?: string;
    /** Predicate (string SafeExpression or function) gating visibility. See {@link ContextMenuCondition}. */
    condition: ContextMenuCondition;
    /** Handler invoked when the entry is clicked; takes precedence over `functionName`. */
    callback?: ContextMenuCallback;
    /** Sort group the entry belongs to. */
    group: SohlContextMenuSortGroup;
}

/**
 * Build a callback that resolves the context item from the DOM and invokes
 * the named method on the item's logic object.
 * @param functionName The logic method to invoke.
 * @param entryName The owning entry's display name, used in log output.
 * @returns A context-menu callback delegating to the logic method.
 */
export function makeLogicMethodCallback(
    functionName: string,
    entryName: string,
): ContextMenuCallback {
    return (target: HTMLElement) => {
        const item = getContextItem(target);
        const ctx = new SohlActionContext({
            speaker: item?.actor?.getSpeaker(),
        });
        const logic = item?.logic as any;
        const fn = logic?.[functionName];
        if (typeof fn === "function") {
            fn.call(logic, ctx);
        } else {
            sohl.log.warn(
                `Function "${functionName}" not found on logic for context menu item "${entryName}".`,
            );
        }
    };
}

/**
 * Compile a context-menu `condition` into a predicate suitable for
 * Foundry's ContextMenu base class. Function-form conditions are
 * passed through unchanged; string-form conditions are evaluated as
 * SafeExpressions. Parse errors and evaluation errors on the string
 * form are caught and logged; the entry is treated as hidden
 * (predicate returns `false`) rather than allowed to bubble.
 * @param source The condition source (string SafeExpression or a
 *   ready-made predicate function).
 * @param entryName The owning entry's display name, used in log output.
 * @returns A predicate that evaluates the condition against a target.
 */
export function compileCondition(
    source: ContextMenuCondition,
    entryName: string,
): (target: HTMLElement) => boolean {
    if (typeof source === "function") return source;
    let expression: SafeExpression;
    try {
        expression = new SafeExpression(source, STANDARD_HELPERS);
    } catch (err) {
        sohl.log.warn(
            "Failed to compile context menu condition; entry will be hidden:",
            { entry: entryName, condition: source, error: err },
        );
        return () => false;
    }
    return (target: HTMLElement): boolean => {
        try {
            return !!expression.evaluate(makeConditionContext(target));
        } catch (err) {
            sohl.log.warn(
                "Context menu condition threw; entry will be hidden:",
                {
                    entry: entryName,
                    condition: source,
                    target,
                    error: err,
                },
            );
            return false;
        }
    };
}

/**
 * Build the lazy evaluation context for a context-menu condition.
 *
 * - `target` is always the HTMLElement the menu was triggered on.
 * - `item` is the nearest ancestor row's `data-item-id` resolved on the
 *   owning actor (or `undefined` if not found).
 * - `actor` is the nearest ancestor row's `data-actor-id` (or
 *   `undefined`).
 *
 * `item` and `actor` are getters, so the DOM walk and lookup happen only
 * when the condition actually references them.
 * @param target The HTMLElement the context menu was opened on.
 * @returns A context object with `target`, `item`, and `actor` bindings.
 */
export function makeConditionContext(
    target: HTMLElement,
): Record<string, unknown> {
    return {
        target,
        get item(): SohlItem | undefined {
            return resolveContextItem(target);
        },
        get actor(): SohlActor | undefined {
            return resolveContextActor(target);
        },
    };
}

/**
 * Resolve the SohlItem indicated by the closest `[data-item-id]`
 * ancestor of `target`. Lookup goes through the resolved actor's
 * embedded items so it works whether or not the sheet uses UUIDs.
 * @param target The HTMLElement the context menu was opened on.
 * @returns The resolved item, or `undefined`.
 */
export function resolveContextItem(target: HTMLElement): SohlItem | undefined {
    const row = target.closest("[data-item-id]") as HTMLElement | null;
    const itemId = row?.dataset?.itemId;
    if (!itemId) return undefined;
    const actor = resolveContextActor(target);
    return actor?.items.get(itemId) as SohlItem | undefined;
}

/**
 * Resolve the SohlActor indicated by the closest `[data-actor-id]`
 * ancestor of `target`.
 * @param target The HTMLElement the context menu was opened on.
 * @returns The resolved actor, or `undefined`.
 */
export function resolveContextActor(
    target: HTMLElement,
): SohlActor | undefined {
    const row = target.closest("[data-actor-id]") as HTMLElement | null;
    const actorId = row?.dataset?.actorId;
    if (!actorId) return undefined;
    const actor = fvttGetActor(actorId);
    return actor ? (actor as SohlActor) : undefined;
}

/**
 * Represents an entry in the context menu.
 */
export class ContextMenuEntry {
    /**
     * The context menu entry label.
     */
    name: string;

    /**
     * HTML icon element for the menu item.
     */
    icon?: HTMLString;

    /**
     * Context menu group.
     */
    group: string;

    /**
     * The function to call when the menu item is clicked.
     */
    callback?: ContextMenuCallback;

    /**
     * Safe-expression source determining whether this entry appears in
     * the menu. See {@link ContextMenuCondition}.
     */
    condition: ContextMenuCondition;

    /**
     * The context menu entry identifier.
     */
    id: string;

    /**
     * The function name to call when the entry is clicked.
     */
    functionName?: string;

    /**
     * Creates an instance of the context menu entry.
     * @param data The data for the context menu entry.
     * @param data.id The unique identifier for the entry.
     * @param data.name The name of the entry.
     * @param data.icon The HTML Icon element for the entry.
     * @param data.iconFAClass The Font-Awesome CSS class for the entry.
     * @param data.functionName The function name to call when the entry is clicked.
     * @param data.condition The safe-expression source determining whether the entry is shown.
     * @param data.callback The callback function to call when the entry is clicked.
     * @param data.group The group to which the entry belongs.
     */
    constructor(data: ContextMenuEntryContext) {
        if (!(data.icon || data.iconFAClass)) {
            throw new Error("Either icon or iconFAClass must be provided.");
        }
        if (!(data.callback || data.functionName)) {
            throw new Error(
                "Either callback or functionName must be provided.",
            );
        }
        this.id = data.id;
        this.name = data.name;
        this.icon = data.icon;
        this.condition = data.condition;
        this.callback =
            data.callback ||
            makeLogicMethodCallback(data.functionName!, data.name);
        this.group = data.group;
    }
}
