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
import type { SohlLogic } from "@src/core/logic/SohlLogic";
import {
    ContextMenuEntry,
    type ContextMenuEntryContext,
    type ContextMenuCallback,
    type ContextMenuCondition,
    compileCondition,
    makeConditionContext,
    makeLogicMethodCallback,
    resolveContextActor,
    resolveContextItem,
} from "@src/apps/logic/ContextMenuEntry";

/**
 * SoHL's specialization of Foundry's `ContextMenu` UI control.
 *
 * Extends the base context menu to accept {@link SohlContextMenu.Entry}
 * definitions whose `condition` may be a string SafeExpression
 * (compiled to a predicate) and whose `callback` may be omitted in favour of a
 * named logic method (`functionName`). The constructor normalizes those entries
 * into the function-based shape Foundry expects, and the class adds custom
 * positioning (`_setPosition`) plus static helpers for resolving the
 * triggering item/actor from the DOM.
 *
 * @remarks
 * The Foundry-free entry shape, condition compilation, and DOM resolution
 * helpers live in `import` so the logic layer can
 * use them without loading this Foundry-coupled UI class. The static helpers
 * and namespace members here delegate to (and re-export) that module.
 */
export class SohlContextMenu
    extends (foundry.applications as any).ux.ContextMenu
{
    /** Back-reference to the concrete implementation class. @internal */
    declare readonly implementation: typeof SohlContextMenu;

    /**
     * Build a context menu, compiling each entry into the function-based shape
     * Foundry's base class expects.
     *
     * For every entry: the `condition` is compiled via
     * {@link compileCondition}, and when no explicit `callback` is supplied a
     * default one is generated that resolves the context item, builds a
     * SohlActionContext, and invokes the named `functionName` on the
     * item's logic object.
     * @param container - The DOM element the menu is bound to.
     * @param selector - CSS selector identifying the rows the menu attaches to.
     * @param menuItems - The SoHL entry definitions to display.
     * @param options - Optional context-menu configuration.
     * @throws Error if an entry has neither a `callback` nor a `functionName`.
     */
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
            const conditionFn = compileCondition(
                it.condition,
                it.name,
                options.parent,
            );
            let callback = it.callback;
            if (!callback) {
                if (!it.functionName) {
                    throw new Error(
                        `Context menu item "${it.name}" does not have a callback function.`,
                    );
                }
                callback = makeLogicMethodCallback(it.functionName, it.name);
            }
            return { ...it, condition: conditionFn, callback };
        });
        super(container as any, selector, compiled as any, options);
    }

    /**
     * Compile a context-menu `condition` into a predicate suitable for
     * Foundry's ContextMenu base class.
     * @see {@link compileCondition}
     * @param source - The condition source to compile.
     * @param entryName - The entry name, used for error reporting.
     * @param parent - The owning document's logic, used as the compiled
     *   expression's parent (required for string conditions).
     * @returns A predicate evaluating the condition against a target element.
     */
    static compileCondition(
        source: SohlContextMenu.Condition,
        entryName: string,
        parent?: SohlLogic,
    ): (target: HTMLElement) => boolean {
        return compileCondition(source, entryName, parent);
    }

    /**
     * Build the lazy evaluation context for a context-menu condition.
     * @see {@link makeConditionContext}
     * @param target - The element the context menu was opened on.
     * @returns The evaluation context exposed to the condition.
     */
    static makeConditionContext(target: HTMLElement): Record<string, unknown> {
        return makeConditionContext(target);
    }

    /**
     * Resolve the SohlItem indicated by the closest `[data-item-id]`
     * ancestor of `target`.
     * @see {@link resolveContextItem}
     * @param target - The element the context menu was opened on.
     * @returns The resolved item, or `undefined` if none is found.
     */
    static resolveItem(target: HTMLElement): SohlItem | undefined {
        return resolveContextItem(target);
    }

    /**
     * Resolve the SohlActor indicated by the closest `[data-actor-id]`
     * ancestor of `target`.
     * @see {@link resolveContextActor}
     * @param target - The element the context menu was opened on.
     * @returns The resolved actor, or `undefined` if none is found.
     */
    static resolveActor(target: HTMLElement): SohlActor | undefined {
        return resolveContextActor(target);
    }

    /**
     * Position the rendered menu element relative to the triggering target.
     *
     * Appends the menu into the nearest `div.app` container, measures it, and
     * chooses whether to expand upward or downward based on available space
     * before setting its final coordinates. Toggles the `expand-up`/
     * `expand-down` classes and marks the target with the `context` class.
     * @param element - The menu's root DOM element to position.
     * @param target - The element the menu was triggered on.
     * @param options - Render options; must include the originating mouse
     *   `event` (used to derive cursor coordinates).
     * @throws Error if no mouse event is supplied or no `div.app` container is
     *   found.
     * @internal
     */
    protected _setPosition(
        element: HTMLElement,
        target: HTMLElement,
        options?: PlainObject,
    ): void {
        const mouseEvent = options?.event;
        if (!mouseEvent) {
            throw Error("Mouse event is required");
        }

        // Find the application-frame container to append and position within.
        // ApplicationV2 (Foundry v13+) renders the frame with the `.application`
        // class — and for a DocumentSheetV2 the frame element is a `<form>`, not
        // a `<div>`. The pre-v13 `div.app` selector (and even `div.application`)
        // matched nothing here, so the menu threw "Container not found" on open
        // (#517). Match on the class alone so it finds the form or div frame.
        let container = target.closest(".application");
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
        /** DOM event name that triggers the menu (e.g. `"contextmenu"`). */
        eventName?: string;
        /** Invoked when the menu opens. */
        onOpen?: Callback;
        /** Invoked when the menu closes. */
        onClose?: Callback;
        /** When `true`, the menu uses fixed positioning. */
        fixed?: boolean;
        /** When `true`, the base class operates in jQuery-compatibility mode. */
        jQuery?: boolean;
        /**
         * The owning document's logic, used as the parent for any string
         * (SafeExpression) entry conditions compiled by the menu.
         */
        parent?: SohlLogic;
    }

    /**
     * Callback type for context menu open/close events.
     * @see {@link ContextMenuCallback}
     */
    export type Callback = ContextMenuCallback;

    /**
     * A context-menu predicate (string SafeExpression or function).
     * @see {@link ContextMenuCondition}
     */
    export type Condition = ContextMenuCondition;

    /**
     * Options passed during rendering the context menu.
     */
    export interface RenderOptions {
        /** The DOM event that triggered the render, if any. */
        event?: Event;
        /** Whether to animate the menu open/close transition. */
        animate?: boolean;
    }

    /**
     * The raw data describing a single context-menu entry.
     * @see {@link ContextMenuEntryContext}
     */
    export type EntryContext = ContextMenuEntryContext;

    /**
     * Represents an entry in the context menu.
     * @see {@link ContextMenuEntry}
     */
    export const Entry = ContextMenuEntry;
    /** Type alias for a single context-menu entry. @see {@link ContextMenuEntry} */
    export type Entry = ContextMenuEntry;
}
