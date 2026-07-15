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
import { SohlItemSheetBase } from "@src/document/item/foundry/SohlItemSheetBase";

/** @internal */
export class AfflictionSheet extends SohlItemSheetBase {
    /** @inheritDoc */
    static override PARTS = {
        ...super.PARTS,
        properties: {
            container: { classes: ["tab-body"], id: "tabs" },
            template: "systems/sohl/templates/item/affliction-properties.hbs",
            scrollable: [""],
        },
    };

    /**
     * Augments the render context for the affliction properties tab with the
     * affliction's system fields (subtype, category, dormant/treated state,
     * diagnosis bonus, level, etc.).
     * @param context - The sheet render context to extend.
     * @param options - The sheet render options.
     * @returns The render context augmented with affliction property data.
     */
    protected override async _preparePropertiesContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        await super._preparePropertiesContext(context, options);
        const system = this.document.system as any;
        return Object.assign(context, {
            subType: system.subType,
            category: system.category,
            isDormant: system.isDormant,
            treatmentDate: system.treatmentDate,
            diagnosisBonusBase: system.diagnosisBonusBase,
            levelBase: system.levelBase,
            healingRateBase: system.healingRateBase,
            contagionIndexBase: system.contagionIndexBase,
            transmission: system.transmission,
        });
    }
}
