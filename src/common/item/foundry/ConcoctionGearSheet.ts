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

import { SohlItem, SohlItemSheetBase } from "@common/item/foundry/SohlItem";

export class ConcoctionGearSheet extends SohlItemSheetBase {
    protected async _preparePropertiesContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        await super._preparePropertiesContext(context, options);
        const system = this.document.system as any;
        return Object.assign(context, {
            quantity: system.quantity,
            weightBase: system.weightBase,
            valueBase: system.valueBase,
            isCarried: system.isCarried,
            isEquipped: system.isEquipped,
            qualityBase: system.qualityBase,
            durabilityBase: system.durabilityBase,
            visibleToCohort: system.visibleToCohort,
            subType: system.subType,
            potency: system.potency,
            strength: system.strength,
        });
    }
}
