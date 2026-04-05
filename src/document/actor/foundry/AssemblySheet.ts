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

import { SohlActorSheetBase } from "@src/document/actor/foundry/SohlActor";
import type { AssemblyLogic } from "@src/document/actor/logic/AssemblyLogic";

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
}
