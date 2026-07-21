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

/**
 * Injury Treatment tables (#553) — the Physician **Treatment Test** and its
 * consequences, as pure, Foundry-free lookups over the tables in the Injury
 * rules (`https://kb.heroiclands.org/dev/` → Injury → _Injury Treatment_).
 *
 * A new injury is untreated; treatment establishes its
 * {@link sohl.document.item.logic.TraumaData.healingRateBase | Healing Rate}
 * (which then governs {@link sohl.document.item.logic.TraumaLogic.healingCheck |
 * Injury Healing Tests}, #486). The Physician test's result and the wound's
 * severity band select the Healing Rate; the wound's aspect and severity select
 * the required treatment action and its difficulty; and the resulting Healing
 * Rate (with the aspect) determines the special injury effects — bleeders and
 * permanent-impairment eligibility.
 *
 * @remarks The `Frost` and `Projectile` (incl. broad-head) aspects and the
 *   amputation-for-grievous-frost path described in the rules have no
 *   representation in the current {@link sohl.utils.ImpactAspect} enum
 *   (`blunt`/`edged`/`piercing`/`fire`), so {@link requiredTreatment} covers only
 *   those four aspects; the remainder await an aspect-model extension.
 */

import {
    IMPACT_ASPECT,
    MARGINAL_SUCCESS,
    type ImpactAspect,
    type SuccessLevel,
} from "@src/utils/constants";

/**
 * The required-treatment action codes (Injury rules, _Injury Treatment_).
 */
export const TREATMENT_CODE = {
    /** Clean and dress the injury with water and bandages. */
    CLEAN: "CLN",
    /** Apply a cool, wet dressing to ease discomfort. */
    COMPRESS: "CMP",
    /** Surgically extract a lodged projectile. */
    EXTRACT: "EXT",
    /** Splint a simple fracture. */
    SET: "SET",
    /** Complex surgery (requires surgical tools). */
    SURGERY: "SUR",
    /** Warm the victim (blankets, hot drinks, warm compresses). */
    WARM: "WRM",
    /** Amputate the affected location. */
    AMPUTATE: "AMP",
} as const;

/** A required-treatment action code. */
export type TreatmentCode =
    (typeof TREATMENT_CODE)[keyof typeof TREATMENT_CODE];

/**
 * Sentinel returned by {@link treatmentHealingRate} when the roll heals the
 * wound outright rather than assigning a numeric Healing Rate.
 */
export const TREATMENT_HEAL = "HEAL" as const;

/** Severity band of a wound, grouping the 1–5 Injury Levels. */
export type InjuryBand = "minor" | "serious" | "grievous";

/**
 * The severity band of an Injury Level: `1 → minor`, `2–3 → serious`,
 * `4–5 → grievous`. A non-injuring level (`≤ 0`, i.e. healed) has no band.
 *
 * @param level - The numeric Injury Level.
 * @returns The severity band, or `undefined` when the level is healed.
 */
export function injuryBand(level: number): InjuryBand | undefined {
    if (level <= 0) return undefined;
    if (level === 1) return "minor";
    if (level <= 3) return "serious";
    return "grievous";
}

/**
 * Resulting Healing Rate by Treatment-Test result and severity band, indexed by
 * `normSuccessLevel + 1` (CF=0, MF=1, MS=2, CS=3). A cell of {@link
 * TREATMENT_HEAL} heals the wound immediately.
 */
const HEALING_RATE_TABLE: Record<
    InjuryBand,
    readonly (number | typeof TREATMENT_HEAL)[]
> = {
    minor: [4, 5, 6, TREATMENT_HEAL],
    serious: [3, 4, 5, 6],
    grievous: [2, 3, 4, 5],
};

/**
 * The Healing Rate a Treatment Test assigns, from its normalized success level
 * and the wound's severity band (Injury rules — Treatment table).
 *
 * @param normSuccessLevel - The test result (CF −1 / MF 0 / MS 1 / CS 2).
 * @param band - The wound's severity band.
 * @returns The numeric Healing Rate, or {@link TREATMENT_HEAL} when the wound
 *   heals immediately.
 */
export function treatmentHealingRate(
    normSuccessLevel: SuccessLevel,
    band: InjuryBand,
): number | typeof TREATMENT_HEAL {
    const row = HEALING_RATE_TABLE[band];
    const idx = Math.max(0, Math.min(row.length - 1, normSuccessLevel + 1));
    return row[idx];
}

/** A required treatment action and its Physician-test difficulty modifier. */
export interface RequiredTreatment {
    /** The action that must be taken. */
    code: TreatmentCode;
    /** The difficulty modifier applied to the Physician test. */
    modifier: number;
}

/**
 * Required-treatment table (Injury rules — Treatment actions), keyed by aspect
 * then band. Only the four representable {@link sohl.utils.ImpactAspect} values
 * are covered (see the module remarks).
 */
const TREATMENT_ACTION_TABLE: Partial<
    Record<ImpactAspect, Record<InjuryBand, RequiredTreatment>>
> = {
    [IMPACT_ASPECT.BLUNT]: {
        minor: { code: TREATMENT_CODE.COMPRESS, modifier: 30 },
        serious: { code: TREATMENT_CODE.SET, modifier: 10 },
        grievous: { code: TREATMENT_CODE.SURGERY, modifier: 0 },
    },
    [IMPACT_ASPECT.EDGED]: {
        minor: { code: TREATMENT_CODE.CLEAN, modifier: 20 },
        serious: { code: TREATMENT_CODE.CLEAN, modifier: 10 },
        grievous: { code: TREATMENT_CODE.SURGERY, modifier: 0 },
    },
    [IMPACT_ASPECT.PIERCING]: {
        minor: { code: TREATMENT_CODE.CLEAN, modifier: 10 },
        serious: { code: TREATMENT_CODE.CLEAN, modifier: 0 },
        grievous: { code: TREATMENT_CODE.SURGERY, modifier: -10 },
    },
    [IMPACT_ASPECT.FIRE]: {
        minor: { code: TREATMENT_CODE.COMPRESS, modifier: 20 },
        serious: { code: TREATMENT_CODE.CLEAN, modifier: 10 },
        grievous: { code: TREATMENT_CODE.CLEAN, modifier: 0 },
    },
};

/**
 * The action a wound requires and its Physician-test difficulty modifier, from
 * the wound's aspect and severity band.
 *
 * @param aspect - The wound's impact aspect.
 * @param band - The wound's severity band.
 * @returns The required treatment, or `undefined` when the aspect is not yet
 *   representable (see the module remarks).
 */
export function requiredTreatment(
    aspect: ImpactAspect,
    band: InjuryBand,
): RequiredTreatment | undefined {
    return TREATMENT_ACTION_TABLE[aspect]?.[band];
}

/**
 * Whether a surgical treatment mishap leaves a bleeder: an `EXT` (extraction) or
 * `SUR` (surgery) treatment on a marginal or critical **failure** causes a
 * bleeder (Injury rules — Treatment table notes).
 *
 * @param code - The treatment action taken (or `undefined` when unknown).
 * @param normSuccessLevel - The Treatment-Test result.
 * @returns `true` when the mishap produces a bleeder.
 */
export function treatmentCausesBleeder(
    code: TreatmentCode | undefined,
    normSuccessLevel: SuccessLevel,
): boolean {
    if (code !== TREATMENT_CODE.EXTRACT && code !== TREATMENT_CODE.SURGERY) {
        return false;
    }
    return normSuccessLevel < MARGINAL_SUCCESS;
}

/**
 * Whether the treated wound bleeds by virtue of its Healing Rate: a grievous
 * blunt/edged/piercing wound left at Healing Rate 2 or 3 is a bleeder (Injury
 * rules — Special Injury Effects).
 *
 * @param aspect - The wound's impact aspect.
 * @param band - The wound's severity band.
 * @param healingRate - The Healing Rate assigned by treatment.
 * @returns `true` when the wound is a bleeder.
 */
export function isBleederFromHealingRate(
    aspect: ImpactAspect,
    band: InjuryBand,
    healingRate: number,
): boolean {
    if (band !== "grievous") return false;
    if (healingRate !== 2 && healingRate !== 3) return false;
    return (
        aspect === IMPACT_ASPECT.BLUNT ||
        aspect === IMPACT_ASPECT.EDGED ||
        aspect === IMPACT_ASPECT.PIERCING
    );
}

/**
 * Permanent-impairment eligibility by aspect, band, and Healing Rate (Injury
 * rules — Special Injury Effects). An eligible wound that takes a long time to
 * heal leaves a lasting impairment (the magnitude is applied by the Impairment
 * system, #554).
 *
 * @param aspect - The wound's impact aspect.
 * @param band - The wound's severity band.
 * @param healingRate - The Healing Rate assigned by treatment.
 * @returns `true` when the wound is eligible for permanent impairment.
 */
export function isPermanentImpairmentEligible(
    aspect: ImpactAspect,
    band: InjuryBand,
    healingRate: number,
): boolean {
    const seriousHR34 =
        band === "serious" && (healingRate === 3 || healingRate === 4);
    const grievousHR234 =
        band === "grievous" && healingRate >= 2 && healingRate <= 4;
    switch (aspect) {
        case IMPACT_ASPECT.BLUNT:
            return seriousHR34 || grievousHR234;
        case IMPACT_ASPECT.EDGED:
            return grievousHR234;
        case IMPACT_ASPECT.PIERCING:
            return (band === "serious" && healingRate === 3) || grievousHR234;
        case IMPACT_ASPECT.FIRE:
            return band === "grievous" && healingRate >= 1 && healingRate <= 3;
        default:
            return false;
    }
}
