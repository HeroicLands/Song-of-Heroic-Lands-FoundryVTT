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

import {
    SohlItem,
    SohlItemSheetBase,
} from "@src/document/item/foundry/SohlItem";

/** @internal */
export class AttributeSheet extends SohlItemSheetBase {
    static override PARTS = {
        ...super.PARTS,
        properties: {
            container: { classes: ["tab-body"], id: "tabs" },
            template: "systems/sohl/templates/item/attribute-properties.hbs",
            scrollable: [""],
        },
    };

    /**
     * Adds attribute-specific fields to the properties tab context.
     *
     * @remarks
     * `scoreBase` and `initDiceFormula` are editable scalar fields that save via
     * the standard sheet form submission. `valueDesc` and `impairedByRoles` are
     * arrays surfaced read-only; live array editing depends on the array-editor
     * wiring in {@link SohlDataModel}, which is not currently active.
     * @param context - The render context to augment.
     * @param options - Sheet render options.
     * @returns The context extended with attribute properties.
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
            scoreBase: system.scoreBase,
            initDiceFormula: system.initDiceFormula,
            valueDesc: system.valueDesc ?? [],
            impairedByRoles: system.impairedByRoles ?? [],
        });
    }
}
