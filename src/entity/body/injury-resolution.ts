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

import type { BodyLocation } from "@src/entity/body/BodyLocation";
import type { BodyStructure } from "@src/entity/body/BodyStructure";
import type { TraumaData } from "@src/document/item/logic/TraumaLogic";
import {
    INJURY_LEVELS,
    BASE_INJURY_THRESHOLDS,
    IMPACT_ASPECT,
    TRAUMA_SUBTYPE,
    type ImpactAspect,
} from "@src/utils/constants";
import {
    amputationModifier,
    canAmputate,
    isBleeder,
    type InjurySeverity,
} from "@src/entity/body/injury-defaults";

/**
 * Inputs to the injury-resolution pipeline. The hit location is resolved
 * upstream — by Zone-Number + Zone-Die aiming ({@link BodyStructure.aimZone}) or
 * a manual pick — and handed in as `location`; with none, an unaimed weighted
 * location is drawn here as a fallback.
 */
export interface InjuryInput {
    /** Raw impact total delivered by the blow (post-roll, pre-armor). */
    impact: number;
    /** Weapon damage aspect — selects which armor value applies. */
    aspect: ImpactAspect;
    /** The target's anatomy, used to resolve the hit location. */
    body: BodyStructure;
    /** The struck hit location (from zone-die aiming or a manual pick). When
     *  omitted, an unaimed weighted location is drawn from {@link body}. */
    location?: BodyLocation;
    /** Override the total protection at the location. When omitted, the value
     *  is derived from the location's natural protection plus worn armor for
     *  the aspect. */
    armorValue?: number;
    /** Manual reduction applied to the armor value (assisted dialog), e.g. for
     *  armor-defeating effects. Defaults to 0. */
    armorReduction?: number;
    /**
     * Extra impact added to the post-armor effective impact **for bleeding
     * determination only** (never for the injury level). A barbed, envenomed,
     * or otherwise bleed-prone strike can bleed at a higher effective severity
     * than its injury level implies. Defaults to 0, in which case the bleed
     * severity equals the injury severity. See the Resolve Injury flow.
     */
    bleedImpactPenalty?: number;
    /** Force the wound to bleed regardless of the bleeding table. */
    extraBleedRisk?: boolean;
}

/** Whether a flagged stumble/fumble is required, automatic, or not in play. */
export type StumbleFumble = "none" | "roll" | "auto";

/** The fully resolved outcome of a blow landing on a body location. */
export interface ResolvedInjury {
    /** The body location that was struck. */
    location: BodyLocation;
    /** Weapon damage aspect of the wound. */
    aspect: ImpactAspect;
    /** Total protection at the location for this aspect (natural + worn armor). */
    armorValue: number;
    /** Manual reduction applied to {@link armorValue}. */
    armorReduction: number;
    /** Comma-joined armor materials covering the location (from the location). */
    armorType: string;
    /** `max(0, impact - max(0, armorValue - armorReduction))`. */
    effectiveImpact: number;
    /** Numeric injury level 0–5 (0 = no injury). */
    level: number;
    /** Severity code from {@link INJURY_LEVELS} (`"NA"`, `"M1"`, … `"G5"`). */
    levelCode: string;
    /** Whether the wound is a Bleeder. */
    isBleeder: boolean;
    /**
     * The struck location's bleeding-susceptibility tier
     * (`none`/`low`/`medium`/`high`). A `none` tier means the location cannot
     * bleed from the table; consulted by the amputation-outcome rule (a
     * marginal-failure severance bleeds only at a non-`none` location).
     */
    bleedRisk: string;
    /**
     * A glancing blow: an edged/piercing strike of effective impact 1–4 against
     * a rigid location, which produces no Minor injury (level 0) but adds an
     * Injury Shock point and a +10 Shock Roll bonus.
     */
    isGlancingBlow: boolean;
    /** Shock Index = location shock value + injury level (+1 if glancing). */
    shockIndex: number;
    /** Whether a Shock Roll is warranted (only meaningful once index > 4). */
    needsShockRoll: boolean;
    /** Bonus added to the Shock Roll (+10 for a glancing blow, else 0). */
    shockRollBonus: number;
    /** Stumble disposition at the struck location. */
    stumble: StumbleFumble;
    /** Fumble disposition at the struck location. */
    fumble: StumbleFumble;
    /** Whether the wound can trigger an amputation test. */
    canAmputate: boolean;
    /** Strength-test modifier for the amputation check, or `null` if N/A. */
    amputationModifier: number | null;
}

/**
 * Map effective impact (post-armor) to a numeric injury level, against a
 * per-creature threshold table.
 *
 * The level is the count of `thresholds` the impact reaches. With the default
 * (human) table `[1, 5, 10, 15, 20]` this reproduces the canonical bands
 * (`1–4 → M1, 5–9 → S2, 10–14 → S3, 15–19 → G4, 20+ → G5`).
 *
 * Impact stays an absolute quantity; a bigger/tougher creature carries a table
 * scaled up by its body `bodyScale`, so the same absolute impact reads
 * differently by size — a 2-impact blow is `S2` on a cat but is **ignored** by a
 * cow (whose scaled `M1` threshold is ≈ 2.9, so it takes ≥ 3 to leave even a
 * minor wound). An impact below the smallest (scaled) threshold is trivial
 * relative to that body and produces no injury. See {@link BASE_INJURY_THRESHOLDS}.
 *
 * @param effectiveImpact - Impact remaining after armor reduction.
 * @param thresholds - The per-creature level thresholds; defaults to the human {@link BASE_INJURY_THRESHOLDS}.
 * @returns The numeric injury level (0–5).
 */
export function injuryLevelFromImpact(
    effectiveImpact: number,
    thresholds: readonly number[] = BASE_INJURY_THRESHOLDS,
): number {
    if (effectiveImpact <= 0) return 0;
    let level = 0;
    for (const threshold of thresholds) {
        if (effectiveImpact >= threshold) level++;
        else break;
    }
    return level;
}

/**
 * Resolve the hit location: the upstream-resolved {@link InjuryInput.location}
 * wins; otherwise a pure weighted random selection across the body.
 * @param input - The injury input describing the blow and target body.
 * @returns The resolved body location.
 */
function resolveLocation(input: InjuryInput): BodyLocation {
    if (input.location) return input.location;
    return input.body.getRandomLocation();
}

/**
 * Resolve a blow into a concrete injury: pick the hit location, subtract
 * armor, derive the injury level, and evaluate bleeding and amputation.
 *
 * Pure and Foundry-free — composes {@link BodyStructure.getRandomLocation},
 * {@link BodyLocation.protectionBase}, and the rule helpers in
 * `InjuryDefaults`. Consumed by both the assisted
 * Add Injury flow and automated combat's Calculate Injury step.
 * @param input - The blow parameters (impact, aspect, target body, overrides).
 * @returns The fully resolved injury.
 */
export function resolveInjury(input: InjuryInput): ResolvedInjury {
    const location = resolveLocation(input);
    const aspect = input.aspect;

    // Total protection: an explicit override wins; otherwise natural protection
    // for the aspect plus any worn armor aggregated onto the location.
    const armorValue =
        input.armorValue ??
        location.protectionBase[aspect].effective +
            location.armorProtection[aspect];
    const armorReduction = input.armorReduction ?? 0;
    const effectiveProtection = Math.max(0, armorValue - armorReduction);
    const effectiveImpact = Math.max(0, input.impact - effectiveProtection);

    // Glancing blow is judged on the pre-glancing injury level: an edged or
    // piercing strike that would deal a Minor (effective impact 1–4) against a
    // rigid location glances off instead, producing no injury.
    // Level is judged against the struck creature's own (bodyScale-scaled)
    // threshold table, so an absolute impact reads size-correct on any body.
    let level = injuryLevelFromImpact(effectiveImpact, input.body.injuryTable);
    const isGlancingBlow =
        (aspect === IMPACT_ASPECT.EDGED || aspect === IMPACT_ASPECT.PIERCING) &&
        effectiveImpact >= 1 &&
        effectiveImpact <= 4 &&
        location.isRigid;
    if (isGlancingBlow) level = 0;
    const levelCode = INJURY_LEVELS[level];

    // Shock Index drives the Shock Roll; a glancing blow adds one Injury Shock
    // point. An index of 4 or less can never produce a Shock State.
    const shockIndex =
        location.shockValue.effective + level + (isGlancingBlow ? 1 : 0);
    const needsShockRoll = shockIndex > 4;
    const shockRollBonus = isGlancingBlow ? 10 : 0;

    // Stumble/fumble apply only at flagged locations: a roll for Serious
    // injuries, automatic for Grievous, nothing for Minor or no injury.
    const disposition = (flagged: boolean): StumbleFumble => {
        if (!flagged) return "none";
        if (level === 2 || level === 3) return "roll";
        if (level >= 4) return "auto";
        return "none";
    };

    // Amputation is defined only for a G5 injury (keyed to the injury level).
    const severity: InjurySeverity | null =
        level >= 3 ? (levelCode as InjurySeverity) : null;
    const amputates =
        severity ? canAmputate(location.amputability, severity, aspect) : false;

    // Bleeding is judged on its own (possibly boosted) impact: the post-armor
    // effective impact plus `bleedImpactPenalty`. With no penalty this equals
    // the effective impact, so the bleed severity equals the injury severity
    // and behavior is unchanged; a penalty lets a bleed-prone strike bleed at a
    // higher effective severity than its injury level implies. The bleeding
    // table itself has no S3-below entries, so M1/S2-equivalent never bleeds.
    const bleedImpact = effectiveImpact + (input.bleedImpactPenalty ?? 0);
    const bleedLevel = injuryLevelFromImpact(
        bleedImpact,
        input.body.injuryTable,
    );
    const bleedSeverity: InjurySeverity | null =
        bleedLevel >= 3 ? (INJURY_LEVELS[bleedLevel] as InjurySeverity) : null;
    const tableBleeder =
        bleedSeverity ?
            isBleeder(location.bleedingSusceptibility, bleedSeverity, aspect)
        :   false;

    return {
        location,
        aspect,
        armorValue,
        armorReduction,
        armorType: location.armorType,
        effectiveImpact,
        level,
        levelCode,
        isBleeder: level >= 1 && (tableBleeder || !!input.extraBleedRisk),
        bleedRisk: location.bleedingSusceptibility,
        isGlancingBlow,
        shockIndex,
        needsShockRoll,
        shockRollBonus,
        stumble: disposition(location.isStumble),
        fumble: disposition(location.isFumble),
        canAmputate: amputates,
        amputationModifier:
            amputates ? amputationModifier(location.amputability) : null,
    };
}

/**
 * Build the `system.*` data shape for a new physical Trauma item from a
 * resolved injury. Still Foundry-free — returns plain data the Foundry layer
 * passes to `createEmbeddedDocuments`.
 *
 * `healingRateBase` starts at 0: Healing Rate (1–6) is established by
 * treatment, not at the moment of wounding.
 * @param injury - The resolved injury to convert.
 * @param options - Overrides supplied by the resolving action.
 * @param options.treatmentModifier - A treatment modifier to seed on the wound
 *   (`treatmentModifierBase`), e.g. from the Resolve Injury dialog. Defaults to 0.
 * @param options.isBleeder - Final bleeder disposition, overriding the injury's
 *   own `isBleeder` when an amputation result makes an otherwise-non-bleeding
 *   wound bleed. Defaults to the injury's `isBleeder`.
 * @returns Partial Trauma item `system` data.
 */
export function buildTraumaData(
    injury: ResolvedInjury,
    options: { treatmentModifier?: number; isBleeder?: boolean } = {},
): Partial<TraumaData> {
    const bleeds = options.isBleeder ?? injury.isBleeder;
    return {
        subType: TRAUMA_SUBTYPE.INJURY,
        levelBase: injury.level,
        healingRateBase: 0,
        treatmentModifierBase: options.treatmentModifier ?? 0,
        aspect: injury.aspect,
        // A bleeder is marked by a non-null blood-loss timer (#482); the
        // real interval is seeded from world settings in TraumaDataModel._preCreate.
        bloodLossAdvanceDurationBase: bleeds ? 0 : null,
        bodyLocationCode: injury.location.shortcode,
    };
}
