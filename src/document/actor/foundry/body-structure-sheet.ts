/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import { BodyPartConfig } from "@src/apps/foundry/BodyPartConfig";
import { BodyLocationConfig } from "@src/apps/foundry/BodyLocationConfig";
import { SohlContextMenu } from "@src/apps/foundry/SohlContextMenu";
import { SOHL_CONTEXT_MENU_SORT_GROUP } from "@src/utils/constants";

/**
 * Open the `BodyPartConfig` editor for a body part on an actor.
 * @param actor - The being whose body part is edited.
 * @param shortcode - The part's shortcode (its row key within the structure).
 */
export function openBodyPartEditor(actor: SohlActor, shortcode: string): void {
    void new BodyPartConfig(actor, shortcode).render(true);
}

/**
 * Open the `BodyLocationConfig` editor for a body location on an actor.
 * @param actor - The being whose body location is edited.
 * @param partShortcode - The shortcode of the owning body part.
 * @param shortcode - The location's shortcode (its row key within the part).
 */
export function openBodyLocationEditor(
    actor: SohlActor,
    partShortcode: string,
    shortcode: string,
): void {
    void new BodyLocationConfig(actor, partShortcode, shortcode).render(true);
}

/**
 * Bind the per-row `⋮` context menu to the Combat-tab Body Structure tree,
 * offering **Edit** on each body-part header and each body-location row. The
 * menu opens the relevant config editor; add / sort / delete of the tree itself
 * are wired separately (#720).
 *
 * Part headers carry `data-part-shortcode`; location rows carry
 * `data-part-shortcode` **and** `data-location-shortcode`, so a single handler
 * resolves the right editor from the clicked element's dataset.
 *
 * @param actor - The being the sheet edits.
 * @param element - The sheet root element to bind the menu within.
 */
export function bindBodyStructureContextMenu(
    actor: SohlActor,
    element: HTMLElement,
): void {
    const partEntry = new SohlContextMenu.Entry({
        id: "bodypart-edit",
        name: "Edit Body Part",
        iconFAClass: "fa-solid fa-pen-to-square",
        condition: () => true,
        callback: (target: HTMLElement) => {
            const el = target.closest(
                "[data-part-shortcode]",
            ) as HTMLElement | null;
            const code = el?.dataset.partShortcode;
            if (code) openBodyPartEditor(actor, code);
        },
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    });

    const locationEntry = new SohlContextMenu.Entry({
        id: "bodylocation-edit",
        name: "Edit Location",
        iconFAClass: "fa-solid fa-pen-to-square",
        condition: () => true,
        callback: (target: HTMLElement) => {
            const el = target.closest(
                "[data-location-shortcode]",
            ) as HTMLElement | null;
            const partCode = el?.dataset.partShortcode;
            const locCode = el?.dataset.locationShortcode;
            if (partCode && locCode) {
                openBodyLocationEditor(actor, partCode, locCode);
            }
        },
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    });

    new SohlContextMenu(element, ".bodypart-contextmenu", [partEntry], {
        eventName: "click",
        parent: (actor as any).logic,
    });
    new SohlContextMenu(element, ".bodylocation-contextmenu", [locationEntry], {
        eventName: "click",
        parent: (actor as any).logic,
    });
}
