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

import { SohlItem } from "@src/document/item/foundry/SohlItem";
import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import { HTMLString, toHTMLString } from "@src/utils/helpers";
import {
    ITEM_KIND,
    SOHL_CONTEXT_MENU_SORT_GROUP,
    SohlContextMenuSortGroup,
} from "@src/utils/constants";
import { fvttGetActor, getContextItem } from "@src/core/FoundryHelpers";
import type { SohlAction } from "@src/domain/action/SohlAction";
import { SohlActionContext } from "@src/core/SohlActionContext";
import { SafeExpression, STANDARD_HELPERS } from "@src/utils/SafeExpression";

export class SohlContextMenu
    extends (foundry.applications as any).ux.ContextMenu
{
    declare readonly implementation: typeof SohlContextMenu;

    constructor(
        container: HTMLElement,
        selector: string,
        menuItems: SohlContextMenu.Entry[],
        options: SohlContextMenu.Options = {},
    ) {
        // Compile each entry's string `condition` into a function and wire up
        // a default callback when only `functionName` is provided. The result
        // is the shape Foundry's ContextMenu base class expects (condition
        // and callback both functions).
        const compiled = menuItems.map((it: SohlContextMenu.Entry) => {
            const conditionFn = SohlContextMenu.compileCondition(
                it.condition,
                it.name,
            );
            let callback = it.callback;
            if (!callback) {
                if (!it.functionName) {
                    throw new Error(
                        `Context menu item "${it.name}" does not have a callback function.`,
                    );
                }
                const functionName = it.functionName;
                callback = (target: HTMLElement) => {
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
                            `Function "${functionName}" not found on logic for context menu item "${it.name}".`,
                        );
                    }
                };
            }
            return { ...it, condition: conditionFn, callback };
        });
        super(container as any, selector, compiled as any, options);
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
    static compileCondition(
        source: SohlContextMenu.Condition,
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
                return !!expression.evaluate(
                    SohlContextMenu.makeConditionContext(target),
                );
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
    static makeConditionContext(target: HTMLElement): Record<string, unknown> {
        return {
            target,
            get item(): SohlItem | undefined {
                return SohlContextMenu.resolveItem(target);
            },
            get actor(): SohlActor | undefined {
                return SohlContextMenu.resolveActor(target);
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
    static resolveItem(target: HTMLElement): SohlItem | undefined {
        const row = target.closest("[data-item-id]") as HTMLElement | null;
        const itemId = row?.dataset?.itemId;
        if (!itemId) return undefined;
        const actor = SohlContextMenu.resolveActor(target);
        return actor?.items.get(itemId) as SohlItem | undefined;
    }

    /**
     * Resolve the SohlActor indicated by the closest `[data-actor-id]`
     * ancestor of `target`.
     * @param target The HTMLElement the context menu was opened on.
     * @returns The resolved actor, or `undefined`.
     */
    static resolveActor(target: HTMLElement): SohlActor | undefined {
        const row = target.closest("[data-actor-id]") as HTMLElement | null;
        const actorId = row?.dataset?.actorId;
        if (!actorId) return undefined;
        const actor = fvttGetActor(actorId);
        return actor ? (actor as SohlActor) : undefined;
    }

    // _getContextEffect(header: HTMLElement): SohlActiveEffectProxy | null {
    //     const element = header.closest(".effect") as HTMLElement;
    //     const item =
    //         element?.dataset?.effectId &&
    //         foundryHelpers.fromUuidSync(element.dataset.effectId);
    //     return item && typeof item === "object" ?
    //             (item as SohlItem)
    //         :   null;
    // }

    _setPosition(
        element: HTMLElement,
        target: HTMLElement,
        options?: PlainObject,
    ): void {
        const mouseEvent = options?.event;
        if (!mouseEvent) {
            throw Error("Mouse event is required");
        }

        // Find the container element (equivalent to target.parents("div.app"))
        let container = target.closest("div.app");
        if (!container) {
            throw Error("Container not found");
        }

        // Set styles on the target
        target.style.position = "relative";
        element.style.visibility = "hidden";
        element.style.width = "fit-content";

        // Append the element to the container
        container.appendChild(element);

        // Calculate context bounds
        const contextRect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const mouseX = mouseEvent.pageX - containerRect.left;
        const mouseY = mouseEvent.pageY - containerRect.top;

        const contextTopOffset = mouseY;
        let contextLeftOffset = Math.min(
            containerRect.width - contextRect.width,
            mouseX,
        );

        // Calculate whether the menu should expand upward
        const contextTopMax = mouseY - contextRect.height;
        const contextBottomMax = mouseY + contextRect.height;
        const canOverflowUp =
            contextTopMax > containerRect.top ||
            getComputedStyle(container).overflowY === "visible";

        // Determine if it should expand upward
        const expandUp =
            contextBottomMax > containerRect.height &&
            (contextTopMax >= 0 || canOverflowUp);

        // Calculate top and bottom positions
        const contextTop =
            expandUp ? contextTopOffset - contextRect.height : contextTopOffset;
        const contextBottom = contextTop + contextRect.height;

        // Update classes for expand-up/expand-down
        element.classList.toggle("expand-up", expandUp);
        element.classList.toggle("expand-down", !expandUp);

        // Set positioning styles
        element.style.top = `${contextTop}px`;
        element.style.bottom = `${contextBottom}px`;
        if (contextLeftOffset) {
            element.style.left = `${contextLeftOffset}px`;
        }

        // Make the element visible
        element.style.visibility = "visible";

        // Add context class to target
        target.classList.add("context");
    }
}

export namespace SohlContextMenu {
    /**
     * Options for configuring the context menu.
     */
    export interface Options {
        eventName?: string;
        onOpen?: Callback;
        onClose?: Callback;
        fixed?: boolean;
        jQuery?: boolean;
    }

    /**
     * Callback type for context menu open/close events.
     */
    export type Callback = (target: HTMLElement) => unknown;

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
    export type Condition = string | ((target: HTMLElement) => boolean);

    /**
     * Options passed during rendering the context menu.
     */
    export interface RenderOptions {
        event?: Event;
        animate?: boolean;
    }

    export interface EntryContext {
        id: string;
        name: string;
        icon?: HTMLString;
        iconFAClass?: string;
        functionName?: string;
        condition: Condition;
        callback?: Callback;
        group: SohlContextMenuSortGroup;
    }

    /**
     * Represents an entry in the context menu.
     */
    export class Entry {
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
        callback?: Callback;

        /**
         * Safe-expression source determining whether this entry appears in
         * the menu. See {@link Condition}.
         */
        condition: Condition;

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
        constructor(data: SohlContextMenu.EntryContext) {
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
            this.icon =
                data.icon ||
                toHTMLString(
                    `<i class="${data.iconFAClass}${data.group === SOHL_CONTEXT_MENU_SORT_GROUP.DEFAULT ? " fa-beat-fade" : ""}"></i>`,
                );
            this.condition = data.condition;
            this.callback =
                data.callback ||
                ((element: HTMLElement) => {
                    const a = SohlContextMenu._getContextLogic(element);
                    if (!a) return;
                    a.execute({
                        element,
                        async: true,
                    });
                });
            this.group = data.group;
        }
    }
}
