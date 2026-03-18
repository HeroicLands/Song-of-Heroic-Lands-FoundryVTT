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

import { SohlActorSheetBase } from "@src/common/actor/foundry/SohlActor";
import type { AssemblyLogic } from "@src/common/actor/logic/AssemblyLogic";

export class AssemblySheet extends SohlActorSheetBase {
    static DEFAULT_OPTIONS: PlainObject = {
        id: "assembly-sheet",
        tag: "form",
        position: { width: 900, height: 640 },
        classes: ["sohl", "sheet", "actor", "assembly"],
        dragDrop: [
            {
                dragSelector: ".item-list .item",
                dropSelector: null,
            },
        ],
    };

    static PARTS = {
        header: {
            template: "systems/sohl/templates/actor/assembly/header.hbs",
        },
        tabs: {
            template: "templates/generic/tab-navigation.hbs",
        },
        facade: {
            template: "systems/sohl/templates/actor/parts/facade.hbs",
        },
        nestedItems: {
            template: "systems/sohl/templates/actor/assembly/nested-items.hbs",
        },
        actions: {
            template: "systems/sohl/templates/actor/parts/actions.hbs",
        },
        effects: {
            template: "systems/sohl/templates/actor/parts/effects.hbs",
        },
    } as const;

    static TABS = {
        primary: {
            initial: "facade",
            tabs: [
                {
                    id: "facade",
                    label: "SOHL.Actor.SHEET.tab.facade.label",
                    icon: "fas fa-masks-theater",
                },
                {
                    id: "nestedItems",
                    label: "SOHL.Actor.SHEET.tab.nested.label",
                    icon: "fas fa-sitemap",
                },
                {
                    id: "actions",
                    label: "SOHL.Actor.SHEET.tab.actions.label",
                    icon: "fas fa-cogs",
                },
                {
                    id: "effects",
                    label: "SOHL.Actor.SHEET.tab.effects.label",
                    icon: "fas fa-bolt",
                },
            ],
        },
    };

    /**
     * Delegate rendering to the canonical item's sheet when one exists.
     * If the Assembly is empty (invalid state), fall back to the Assembly's
     * own sheet to allow the user to manage the situation.
     */
    override async render(
        options?: boolean | Record<string, unknown>,
        _options?: Record<string, unknown>,
    ): Promise<this> {
        const logic = (this.document.system as any).logic as AssemblyLogic;
        const canonicalItem = logic?.canonicalItem;
        if (canonicalItem?.sheet) {
            canonicalItem.sheet.render(true);
            return this;
        }
        // TODO: The fallback renders the Assembly's own sheet (facade/nestedItems/actions/effects)
        // but there's no specific "empty Assembly" or "invalid Assembly" UI. Consider adding
        // a clear message explaining the state and providing a way to add items.
        return super.render(options as any, _options as any);
    }
}
