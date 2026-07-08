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
export class TraitSheet extends SohlItemSheetBase {
    /** @inheritDoc */
    static override PARTS = {
        ...super.PARTS,
        properties: {
            container: { classes: ["tab-body"], id: "tabs" },
            template: "systems/sohl/templates/item/trait-properties.hbs",
            scrollable: [""],
        },
    };

    /**
     * Adds trait-specific fields to the properties tab context.
     * @param context - The render context to augment.
     * @param options - Sheet render options.
     * @returns The context extended with trait properties.
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
            skillBaseFormula: system.skillBaseFormula,
            masteryLevelBase: system.masteryLevelBase,
            improveFlag: system.improveFlag,
            subType: system.subType,
            textValue: system.textValue,
            max: system.max,
            isNumeric: system.isNumeric,
            intensity: system.intensity,
            valueDesc: system.valueDesc,
            choices: system.choices,
            diceFormula: system.diceFormula,
        });
    }
}
