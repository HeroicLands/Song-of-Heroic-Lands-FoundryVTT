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

import { SohlItem } from "../item/SohlItem.mjs";

/**
 * @readonly
 * @enum {string}
 */
export const ContextMenuSortGroup = Object.freeze({
    DEFAULT: "default",
    ESSENTIAL: "essential",
    GENERAL: "general",
    HIDDEN: "hidden",
});

/**
 * @typedef {Object} ContextMenuEntry
 * @property {string} id - The context menu identifier.
 * @property {string} name - The context menu label. Can be localized.
 * @property {string} functionName - For intrinsic actions, this is the function name to call.
 * @property {string} iconClass - The context menu Font-Awesome icon class. This is used to set the icon for the menu item.
 * @property {string} icon - A string containing an HTML icon element for the menu item.
 * @property {string|undefined} [group="_none"] - An identifier for a group this entry belongs to.
 * @property {(target: HTMLElement | JQuery) => void} callback - The function to call when the menu item is clicked. Receives the HTML element of the entry that this context menu is for.
 * @property {boolean|((target: HTMLElement | JQuery) => boolean)|undefined} [condition] - A function to call or boolean value to determine if this entry appears in the menu.
 */

export class SohlContextMenu extends ContextMenu {
    _setPosition(html, tgt, { event }) {
        // Ensure element is a native HTMLElement
        const element = html instanceof jQuery ? html[0] : html;
        const target = tgt instanceof jQuery ? tgt[0] : tgt;

        // Find the container element (equivalent to target.parents("div.app"))
        let container = target.closest("div.app");
        if (!container) {
            throw new Error("Container not found");
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
        const mouseX = event.pageX - containerRect.left;
        const mouseY = event.pageY - containerRect.top;

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

    static _getContextItem(el) {
        const element = el instanceof HTMLElement ? el : el[0];
        const found = element.closest(".item");
        if (!found) return null;
        return sohl.game.fromUuidSync(found.dataset.uuid);
    }
}
