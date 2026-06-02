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

import type { BodyLocation } from "@src/domain/body/BodyLocation";
import type { BodyPart } from "@src/domain/body/BodyPart";
import type { BodyStructure } from "@src/domain/body/BodyStructure";
import type { TraumaData } from "@src/document/item/logic/TraumaLogic";
import {
    INJURY_LEVELS,
    TRAUMA_SUBTYPE,
    type ImpactAspect,
} from "@src/utils/constants";
import {
    amputationModifier,
    canAmputate,
    isBleeder,
    type InjurySeverity,
} from "@src/domain/body/InjuryDefaults";

/**
 * Inputs to the injury-resolution pipeline. Both combat modes feed this:
 *
 * - **Assisted** (Add Injury dialog) supplies an explicit `location` and/or
 *   `armorReduction` entered by the player.
 * - **Automated** carries `targetPart` + `accuracy` forward from the attack,
 *   letting the hit location be rolled here with no player input.
 */
export interface InjuryInput {
    /** Raw impact total delivered by the blow (post-roll, pre-armor). */
    impact: number;
    /** Weapon damage aspect — selects which armor value applies. */
    aspect: ImpactAspect;
    /** The target's anatomy, used to resolve the hit location. */
    body: BodyStructure;
    /** Aimed body part; with `accuracy`, drives weighted/drift selection. */
    targetPart?: BodyPart;
    /** Strike accuracy governing scatter from `targetPart`. */
    accuracy?: number;
    /** Explicit hit location override (assisted dialog / GM call). */
    location?: BodyLocation;
    /** Explicit armor reduction override (assisted dialog). When omitted,
     *  the location's natural protection for the aspect is used. */
    armorReduction?: number;
    /** Force the wound to bleed regardless of the bleeding table. */
    extraBleedRisk?: boolean;
}

/** The fully resolved outcome of a blow landing on a body location. */
export interface ResolvedInjury {
    /** The body location that was struck. */
    location: BodyLocation;
    /** Weapon damage aspect of the wound. */
    aspect: ImpactAspect;
    /** Armor value subtracted from impact for this aspect/location. */
    armorReduction: number;
    /** `max(0, impact - armorReduction)`. */
    effectiveImpact: number;
    /** Numeric injury level 0–5 (0 = no injury). */
    level: number;
    /** Severity code from {@link INJURY_LEVELS} (`"NA"`, `"M1"`, … `"G5"`). */
    levelCode: string;
    /** Whether the wound is a Bleeder. */
    isBleeder: boolean;
    /** Whether the wound can trigger an amputation test. */
    canAmputate: boolean;
    /** Strength-test modifier for the amputation check, or `null` if N/A. */
    amputationModifier: number | null;
}

/**
 * Map effective impact (post-armor) to a numeric injury level.
 *
 * Per the SoHL injury rules:
 *   ≤0 → none (0) · 1–4 → M1 (1) · 5–9 → S2 (2) · 10–14 → S3 (3) ·
 *   15–19 → G4 (4) · 20+ → G5 (5)
 */
export function injuryLevelFromImpact(effectiveImpact: number): number {
    if (effectiveImpact <= 0) return 0;
    if (effectiveImpact <= 4) return 1;
    if (effectiveImpact <= 9) return 2;
    if (effectiveImpact <= 14) return 3;
    if (effectiveImpact <= 19) return 4;
    return 5;
}

/**
 * Resolve the hit location: an explicit override wins; otherwise an aimed
 * (targetPart + accuracy) roll; otherwise a pure weighted random selection.
 */
function resolveLocation(input: InjuryInput): BodyLocation {
    if (input.location) return input.location;
    if (input.targetPart && input.accuracy != null) {
        return input.body.getRandomLocation({
            targetPart: input.targetPart,
            accuracy: input.accuracy,
        });
    }
    return input.body.getRandomLocation();
}

/**
 * Resolve a blow into a concrete injury: pick the hit location, subtract
 * armor, derive the injury level, and evaluate bleeding and amputation.
 *
 * Pure and Foundry-free — composes {@link BodyStructure.getRandomLocation},
 * {@link BodyLocation.protectionBase}, and the rule helpers in
 * {@link "@src/domain/body/InjuryDefaults"}. Consumed by both the assisted
 * Add Injury flow and automated combat's Calculate Injury step.
 */
export function resolveInjury(input: InjuryInput): ResolvedInjury {
    const location = resolveLocation(input);
    const armorReduction =
        input.armorReduction ?? location.protectionBase[input.aspect].effective;
    const effectiveImpact = Math.max(0, input.impact - armorReduction);
    const level = injuryLevelFromImpact(effectiveImpact);
    const levelCode = INJURY_LEVELS[level];

    // Bleeding and amputation are only defined for S3+ wounds; the bleeding
    // table has no entries for M1/S2.
    const severity: InjurySeverity | null =
        level >= 3 ? (levelCode as InjurySeverity) : null;
    const tableBleeder = severity
        ? isBleeder(location.bleedingSusceptibility, severity, input.aspect)
        : false;
    const amputates = severity
        ? canAmputate(location.amputability, severity, input.aspect)
        : false;

    return {
        location,
        aspect: input.aspect,
        armorReduction,
        effectiveImpact,
        level,
        levelCode,
        isBleeder: level >= 1 && (tableBleeder || !!input.extraBleedRisk),
        canAmputate: amputates,
        amputationModifier: amputates
            ? amputationModifier(location.amputability)
            : null,
    };
}

/**
 * Build the `system.*` data shape for a new physical Trauma item from a
 * resolved injury. Still Foundry-free — returns plain data the Foundry layer
 * passes to `createEmbeddedDocuments`.
 *
 * `healingRateBase` starts at 0: Healing Rate (1–6) is established by
 * treatment, not at the moment of wounding.
 */
export function buildTraumaData(injury: ResolvedInjury): Partial<TraumaData> {
    return {
        subType: TRAUMA_SUBTYPE.PHYSICAL,
        levelBase: injury.level,
        healingRateBase: 0,
        aspect: injury.aspect,
        isTreated: false,
        isBleeding: injury.isBleeder,
        bodyLocationCode: injury.location.shortcode,
    };
}
