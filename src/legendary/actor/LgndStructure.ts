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

import type { SohlActionContext } from "@common/SohlActionContext";
import { StructureData, StructureLogic } from "@common/actor/Structure";
import { SohlActorSheetBase } from "@common/actor/SohlActor";

export class LgndStructureLogic extends StructureLogic<StructureData> {
    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(context: SohlActionContext): void {
        super.initialize(context);
    }

    /** @inheritdoc */
    override evaluate(context: SohlActionContext): void {
        super.evaluate(context);
    }

    /** @inheritdoc */
    override finalize(context: SohlActionContext): void {
        super.finalize(context);
    }
}

export class LgndStructureSheet extends SohlActorSheetBase {
    static DEFAULT_OPTIONS: PlainObject = {
        id: "structure-sheet",
        tag: "form",
        position: { width: 900, height: 640 },
        classes: ["sohl", "sheet", "legendary", "actor", "structure"],
        window: {
            tabs: [
                {
                    navSelector: ".sheet-tabs",
                    contentSelector: ".tab-body",
                    initial: "facade",
                },
            ],
        },
        dragDrop: [
            {
                dragSelector: ".item-list .item",
                dropSelector: null,
            },
        ],
        // actions: {
        //     effectToggle: SMix._onEffectToggle,
        // },
    };

    static PARTS = {
        header: {
            template:
                "systems/sohl/templates/legendary/actor/assembly/header.hbs",
        },
        tabs: {
            template:
                "systems/sohl/templates/legendary/actor/assembly/tabs.hbs",
        },
        facade: {
            template:
                "systems/sohl/templates/legendary/actor/shared/facade.hbs",
        },
        profile: {
            template:
                "systems/sohl/templates/legendary/actor/assembly/profile.hbs",
        },
        nested: {
            template:
                "systems/sohl/templates/legendary/actor/assembly/nested.hbs",
        },
    } as const;

    static TABS = {
        sheet: {
            navSelector: ".tabs[data-group='sheet']",
            contentSelector: ".content[data-group='sheet']",
            initial: "facade",
            tabs: [
                { id: "facade", label: "SOHL.Actor.SHEET.tab.facade.label" },
                {
                    id: "profile",
                    label: "SOHL.Actor.SHEET.profile",
                },
                { id: "nested", label: "SOHL.Actor.SHEET.tab.nested.label" },
            ],
        },
    };
}
