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

import { SohlItem } from "@common/item/SohlItem";
import { HTMLString, toHTMLString } from "@utils/helpers";
import {
    SOHL_CONTEXT_MENU_SORT_GROUP,
    SohlContextMenuSortGroup,
} from "./constants";

export class SohlContextMenu extends (foundry.applications as any).ux
    .ContextMenu {
    declare readonly implementation: typeof SohlContextMenu;

    constructor(
        container: HTMLElement,
        selector: string,
        menuItems: SohlContextMenu.Entry[],
        options: SohlContextMenu.Options = {},
    ) {
        const mItems = menuItems.map((it: SohlContextMenu.Entry) => {
            const newItem: SohlContextMenu.Entry = new SohlContextMenu.Entry({
                id: it.id,
                name: it.name,
                group: it.group as SohlContextMenuSortGroup,
                callback: it.callback,
                functionName: it.functionName,
                condition:
                    typeof it.condition === "function" ?
                        it.condition
                    :   (_target: HTMLElement) => !!it.condition,
            });
            if (!it.callback) {
                if (it.functionName) {
                    newItem.callback = (target: HTMLElement) => {
                        const item = SohlContextMenu._getContextItem(target);
                        if (item) {
                            item.system.logic.execute({
                                element: target,
                                async: true,
                            });
                        }
                    };
                } else {
                    throw new Error(
                        `Context menu item "${name}" does not have a callback function.`,
                    );
                }
            }
        });
        options.jQuery = options.jQuery || false;
        super(container as any, selector, menuItems as any, options);
    }

    static _getContextItem(header: HTMLElement): SohlItem<any, any> | null {
        const element = header.closest(".item") as HTMLElement;
        const item =
            element?.dataset?.effectId && fromUuidSync(element.dataset.itemId);
        return item && typeof item === "object" ?
                (item as SohlItem<any, any>)
            :   null;
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

    static _getContextLogic(element: HTMLElement): any {
        const found = element.closest(".logic") as any;
        if (!found) return null;
        return fromUuidSync(found.dataset.uuid);
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

    export type Condition = boolean | ((target: HTMLElement) => boolean);

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
         * A function to call or boolean value to determine if this entry appears in the menu.
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
         * @param data.condition A function or boolean to determine if the entry should be shown.
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
