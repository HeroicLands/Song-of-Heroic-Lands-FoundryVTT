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

import { foundryHelpers } from "@utils";
/**
 * Options for configuring the context menu.
 */
export interface ContextMenuOptions {
    eventName?: string;
    onOpen?: ContextMenuCallback;
    onClose?: ContextMenuCallback;
    fixed?: boolean;
}

/**
 * Callback type for context menu open/close events.
 */
export type ContextMenuCallback = (target: HTMLElement) => unknown;

export type ContextMenuCondition = boolean | ((target: HTMLElement) => boolean);

/**
 * Options passed during rendering the context menu.
 */
export interface ContextMenuRenderOptions {
    event?: Event;
    animate?: boolean;
}

/**
 * Constants for context menu groups.
 */
export const ContextMenuSortGroup = {
    DEFAULT: "default",
    ESSENTIAL: "essential",
    GENERAL: "general",
    HIDDEN: "hidden",
} as const;

/**
 * Represents an entry in the context menu.
 */
export interface ContextMenuEntry {
    /**
     * The context menu entry identifier.
     */
    id: string;

    /**
     * The context menu entry label.
     */
    name: string;

    /**
     * If this is an intrinsic action, this is the function name to call.
     */
    functionName?: string;

    /**
     * The Font-Awesome CSS class to use for this menu item, such as "fas fa-plus".
     */
    iconClass?: string;

    /**
     * Additional CSS classes to apply to the menu item.
     */
    classes?: string;

    /**
     * HTML icon element for the menu item.
     */
    icon?: string;

    /**
     * Context menu group.
     */
    group?: string;

    /**
     * The function to call when the menu item is clicked.
     */
    callback: ContextMenuCallback;

    /**
     * A function to call or boolean value to determine if this entry appears in the menu.
     */
    condition: ContextMenuCondition;
}

export class SohlContextMenu extends foundry.applications.ux.ContextMenu {
    readonly implementation!: typeof SohlContextMenu;

    _setPosition(
        element: HTMLElement,
        target: HTMLElement,
        options?: foundry.applications.ux.ContextMenu.RenderOptions,
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
        return foundryHelpers.fromUuidSync(found.dataset.uuid);
    }
}
