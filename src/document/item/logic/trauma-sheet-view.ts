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

import { TRAUMA_SUBTYPE } from "@src/utils/constants";

/**
 * Foundry-free view-model for the Trauma item sheet's properties tab (#939):
 * which fields each sub-type displays and edits. The sheet
 * (`TraumaSheet._preparePropertiesContext`) turns these flags into rendered
 * controls and supplies the Foundry-facing pieces (schema `fields`, the category
 * `choices` map, the computed next-test date). `contractDate` is edited for
 * every sub-type, so it has no flag.
 */
export interface TraumaSheetFields {
    /** Show the graduated **level** (FL / PSL / PSY / ASL / Sev / Fear-Morale). */
    showLevel: boolean;
    /** Show the **healing rate** (Injury / Infection / Shock / Coma). */
    showHealingRate: boolean;
    /** Show the **sub-category** select (Fatigue / PsychCond / PhysCond). */
    showCategory: boolean;
    /** Show the one-line **notes** field (Fatigue / Fear / Morale / PhysCond). */
    showNotes: boolean;
    /** Show the **treatment date** (Injury / Infection). */
    showTreatmentDate: boolean;
    /** Show the **body location** code (Injury / Infection). */
    showBodyLocation: boolean;
    /** Show the impact **aspect** (Injury only). */
    showAspect: boolean;
    /** Show the **blood-loss interval** (Injury only). */
    showBloodLoss: boolean;
    /** Show the **healing-check duration** formula + base (Injury / Infection). */
    showHealDuration: boolean;
    /** Show the **course duration** formula + base (Shock / Coma). */
    showCourseDuration: boolean;
    /** Show the **infectable / permanent-impairment** flags (Injury only). */
    showInjuryFlags: boolean;
    /**
     * Localization key for the view-only "next test" label, or `undefined` for
     * sub-types with no recurring recovery/heal/course test. Pairs with the
     * computed {@link TraumaLogic.nextRecoveryTestAt} date the sheet supplies.
     */
    nextTestLabelKey?: string;
}

const COURSE_SUBTYPES = new Set<string>([
    TRAUMA_SUBTYPE.SHOCK,
    TRAUMA_SUBTYPE.COMA,
]);
const HEAL_SUBTYPES = new Set<string>([
    TRAUMA_SUBTYPE.INJURY,
    TRAUMA_SUBTYPE.INFECTION,
]);
const CATEGORY_SUBTYPES = new Set<string>([
    TRAUMA_SUBTYPE.FATIGUE,
    TRAUMA_SUBTYPE.PSYCHOLOGICAL_CONDITION,
    TRAUMA_SUBTYPE.PHYSICAL_CONDITION,
]);
const NOTES_SUBTYPES = new Set<string>([
    TRAUMA_SUBTYPE.FATIGUE,
    TRAUMA_SUBTYPE.FEAR,
    TRAUMA_SUBTYPE.MORALE,
    TRAUMA_SUBTYPE.PHYSICAL_CONDITION,
]);
// Sub-types with a graduated level — everything except the purely descriptive
// physical condition and the two healing-rate-only course traumas.
const LEVEL_SUBTYPES = new Set<string>([
    TRAUMA_SUBTYPE.FATIGUE,
    TRAUMA_SUBTYPE.FEAR,
    TRAUMA_SUBTYPE.MORALE,
    TRAUMA_SUBTYPE.PALL,
    TRAUMA_SUBTYPE.PSYCHOLOGICAL_CONDITION,
    TRAUMA_SUBTYPE.AURALSHOCK,
    TRAUMA_SUBTYPE.INJURY,
    TRAUMA_SUBTYPE.INFECTION,
]);
// Sub-type → the localization key of its "next test" label (undefined = none).
const NEXT_TEST_LABEL_KEY: Record<string, string> = {
    [TRAUMA_SUBTYPE.INJURY]: "SOHL.Trauma.COLUMN.nextHeal",
    [TRAUMA_SUBTYPE.INFECTION]: "SOHL.Trauma.COLUMN.nextHeal",
    [TRAUMA_SUBTYPE.SHOCK]: "SOHL.Trauma.COLUMN.nextCourse",
    [TRAUMA_SUBTYPE.COMA]: "SOHL.Trauma.COLUMN.nextCourse",
    [TRAUMA_SUBTYPE.PALL]: "SOHL.Trauma.COLUMN.nextPall",
    [TRAUMA_SUBTYPE.PSYCHOLOGICAL_CONDITION]: "SOHL.Trauma.COLUMN.nextPsyche",
    [TRAUMA_SUBTYPE.AURALSHOCK]: "SOHL.Trauma.COLUMN.nextAural",
};

/**
 * The field-visibility view-model for a Trauma sub-type's properties tab (#939).
 *
 * @param subType - The trauma `subType` value.
 * @returns Which controls the sheet renders for that sub-type.
 */
export function traumaSheetFields(subType: string): TraumaSheetFields {
    const isInjury = subType === TRAUMA_SUBTYPE.INJURY;
    return {
        showLevel: LEVEL_SUBTYPES.has(subType),
        showHealingRate:
            HEAL_SUBTYPES.has(subType) || COURSE_SUBTYPES.has(subType),
        showCategory: CATEGORY_SUBTYPES.has(subType),
        showNotes: NOTES_SUBTYPES.has(subType),
        showTreatmentDate: HEAL_SUBTYPES.has(subType),
        showBodyLocation: HEAL_SUBTYPES.has(subType),
        showAspect: isInjury,
        showBloodLoss: isInjury,
        showHealDuration: HEAL_SUBTYPES.has(subType),
        showCourseDuration: COURSE_SUBTYPES.has(subType),
        showInjuryFlags: isInjury,
        nextTestLabelKey: NEXT_TEST_LABEL_KEY[subType],
    };
}
