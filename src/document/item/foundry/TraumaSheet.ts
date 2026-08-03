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

import { SohlItem } from "@src/document/item/foundry/SohlItem";
import { SohlItemSheetBase } from "@src/document/item/foundry/SohlItemSheetBase";
import { traumaSheetFields } from "@src/document/item/logic/trauma-sheet-view";
import {
    FatigueCategoryChoices,
    FearCategoryChoices,
    MoraleCategoryChoices,
    TraumaPhyscondCategoryChoices,
    TraumaPsycondCategoryChoices,
    TRAUMA_SUBTYPE,
} from "@src/utils/constants";

/** Category `choices` map for each sub-type that shows a sub-category select (#939). */
const CATEGORY_CHOICES_BY_SUBTYPE: Record<string, Record<string, string>> = {
    [TRAUMA_SUBTYPE.FATIGUE]: FatigueCategoryChoices,
    [TRAUMA_SUBTYPE.FEAR]: FearCategoryChoices,
    [TRAUMA_SUBTYPE.MORALE]: MoraleCategoryChoices,
    [TRAUMA_SUBTYPE.PSYCHOLOGICAL_CONDITION]: TraumaPsycondCategoryChoices,
    [TRAUMA_SUBTYPE.PHYSICAL_CONDITION]: TraumaPhyscondCategoryChoices,
};

/** @internal */
export class TraumaSheet extends SohlItemSheetBase {
    /** @inheritDoc */
    static override PARTS = {
        ...super.PARTS,
        properties: {
            container: { classes: ["tab-body"], id: "tabs" },
            template: "systems/sohl/templates/item/trauma-properties.hbs",
            scrollable: [""],
        },
    };

    /**
     * Adds trauma-specific fields (subtype, level, healing rate, aspect,
     * treatment/bleeding flags, body location) to the properties tab context.
     *
     * @param context - The sheet render context to extend.
     * @param options - The sheet render options.
     * @returns The context augmented with trauma properties.
     */
    protected override async _preparePropertiesContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        await super._preparePropertiesContext(context, options);
        const system = this.document.system as any;
        const logic = this.document.logic as any;
        const fieldsView = traumaSheetFields(system.subType);
        return Object.assign(context, {
            subType: system.subType,
            levelBase: system.levelBase,
            healingRateBase: system.healingRateBase,
            aspect: system.aspect,
            treatmentDate: system.treatmentDate,
            isBleeding: logic?.isBleeding ?? false,
            bodyLocationCode: system.bodyLocationCode,
            // Per-sub-type field visibility (#939).
            ...fieldsView,
            categoryChoices:
                fieldsView.showCategory ?
                    CATEGORY_CHOICES_BY_SUBTYPE[system.subType]
                :   undefined,
            // View-only next recovery/heal/course test date (nothing is
            // auto-armed — consent model #579); em-dash when unscheduled.
            nextTestDisplay: this.formatNextTest(logic?.nextRecoveryTestAt),
        });
    }

    /**
     * Format a trauma's next scheduled test world time as an absolute SoHL date
     * for the item sheet (#939), or an em-dash when no test is scheduled.
     *
     * @param at - The next-test world time (seconds), or `undefined`.
     * @returns A formatted date, or `"—"`.
     */
    private formatNextTest(at: number | undefined): string {
        const cal = sohl.calendar;
        if (at == null || !Number.isFinite(at) || !cal) return "—";
        // fvtt-types omits the named-formatter overload of CalendarData.format;
        // call it the way `displayWorldTime` does at runtime.
        const format = cal.format as (
            time: number,
            formatter: string,
        ) => string;
        try {
            return format.call(cal, at, "sohl.default") || "—";
        } catch {
            return "—";
        }
    }
}
