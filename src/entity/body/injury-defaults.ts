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

import {
    AMPUTABILITY,
    BLEEDING_SUSCEPTIBILITY,
    CRITICAL_FAILURE,
    IMPACT_ASPECT,
    MARGINAL_FAILURE,
    MARGINAL_SUCCESS,
    type Amputability,
    type BleedingSusceptibility,
    type ImpactAspect,
} from "@src/utils/constants";

/**
 * Injury severity at the level we care about for these tables. Levels 1
 * and 2 (M1, S2) never produce Bleeders or Amputations and aren't
 * tracked here.
 */
export type InjurySeverity = "S3" | "G4" | "G5";

/**
 * Bleeding rule table — given a location's susceptibility tier and the
 * causal injury's severity, returns the set of weapon aspects that produce
 * a Bleeder. Per the rulebook (section 3.3 BLEEDING):
 *
 *                        S3          G4          G5
 *   NONE   (no circle)   —           —           —
 *   LOW    (white)       —           —           E P B
 *   MEDIUM (grey)        —           E P         E P B
 *   HIGH   (black)       E           E P         E P B
 *
 * The table is keyed by tier first, severity second, returning a Set of
 * ImpactAspect values. An empty Set or a missing key means "never a
 * Bleeder for this combination."
 */
/** Short alias for the EDGED aspect, used to build the bleeding table. @internal */
const E = IMPACT_ASPECT.EDGED;
/** Short alias for the PIERCING aspect, used to build the bleeding table. @internal */
const P = IMPACT_ASPECT.PIERCING;
/** Short alias for the BLUNT aspect, used to build the bleeding table. @internal */
const B = IMPACT_ASPECT.BLUNT;

/**
 * Bleeding lookup table: for each {@link BleedingSusceptibility}, the set of
 * impact aspects that cause bleeding at each serious/grievous injury severity.
 * Consulted by {@link isBleeder}.
 */
export const BLEEDING_TABLE: Record<
    BleedingSusceptibility,
    Record<InjurySeverity, ReadonlySet<ImpactAspect>>
> = {
    [BLEEDING_SUSCEPTIBILITY.NONE]: {
        S3: new Set(),
        G4: new Set(),
        G5: new Set(),
    },
    [BLEEDING_SUSCEPTIBILITY.LOW]: {
        S3: new Set(),
        G4: new Set(),
        G5: new Set([E, P, B]),
    },
    [BLEEDING_SUSCEPTIBILITY.MEDIUM]: {
        S3: new Set(),
        G4: new Set([E, P]),
        G5: new Set([E, P, B]),
    },
    [BLEEDING_SUSCEPTIBILITY.HIGH]: {
        S3: new Set([E]),
        G4: new Set([E, P]),
        G5: new Set([E, P, B]),
    },
};

/**
 * Determine whether a wound at the given location, with the given severity
 * and weapon aspect, produces a Bleeder. Use this from the injury-resolution
 * pipeline (rule section 3.3).
 * @param susceptibility - The location's bleeding-susceptibility tier.
 * @param severity - The injury severity (S3, G4, or G5).
 * @param aspect - The weapon impact aspect (edged, piercing, blunt).
 * @returns True if the wound bleeds.
 */
export function isBleeder(
    susceptibility: string,
    severity: InjurySeverity,
    aspect: string,
): boolean {
    const tier = BLEEDING_TABLE[susceptibility as BleedingSusceptibility];
    if (!tier) return false;
    return tier[severity].has(aspect as ImpactAspect);
}

/**
 * Amputation rule (section 3.4 AMPUTATION).
 *
 * Trigger: G5 + Edge + location.amputability !== NONE. Anything else, no
 * test. The Strength test target is `STR × 5 + AMPUTABILITY_MODIFIER[tier]`.
 *
 *   NONE   — no triangle; not amputable.
 *   LOW    — white triangle;  +20.
 *   MEDIUM — grey triangle;     0.
 *   HIGH   — black triangle;  −20.
 *
 * Outcome by Strength-test result:
 *   CF — severed; becomes a Bleeder even in non-bleeder locations.
 *   F  — severed; becomes a Bleeder only if the location normally bleeds.
 *   S  — not severed; -20 to the resulting Shock Roll (step 4.3).
 *   CS — not severed.
 *
 * Severance of the neck is fatal regardless of other consequences.
 */
export const AMPUTABILITY_MODIFIER: Record<Amputability, number | null> = {
    [AMPUTABILITY.NONE]: null, // not applicable; engine guards against this case
    [AMPUTABILITY.LOW]: +20,
    [AMPUTABILITY.MEDIUM]: 0,
    [AMPUTABILITY.HIGH]: -20,
};

/**
 * True if a wound at this location can trigger an amputation test.
 * @param amputability - The location's amputability tier.
 * @param severity - The injury severity (S3, G4, or G5).
 * @param aspect - The weapon impact aspect (edged, piercing, blunt).
 * @returns True if an amputation test applies.
 */
export function canAmputate(
    amputability: string,
    severity: InjurySeverity,
    aspect: string,
): boolean {
    return (
        amputability !== AMPUTABILITY.NONE &&
        severity === "G5" &&
        aspect === IMPACT_ASPECT.EDGED
    );
}

/**
 * The modifier to apply to the Strength test for an amputation check at
 * this location. Returns null if amputation is not applicable.
 * @param amputability - The location's amputability tier.
 * @returns The Strength-test modifier, or null if not applicable.
 */
export function amputationModifier(amputability: string): number | null {
    return AMPUTABILITY_MODIFIER[amputability as Amputability] ?? null;
}

/** The resolved consequence of an amputation Strength test (section 3.4). */
export interface AmputationOutcome {
    /** Whether the struck location is severed. */
    severed: boolean;
    /** Whether the victim dies (a severed **vital** location is fatal). */
    dies: boolean;
    /** Whether the wound becomes (or remains) a Bleeder as a result. */
    bleeder: boolean;
    /** Additional modifier applied to the resulting Shock Roll (−20 on MS, else 0). */
    shockPenalty: number;
}

/**
 * Map an amputation **Strength-test** result to its consequence (section 3.4):
 *
 * - **Critical Failure** — severed; a Bleeder even at a non-bleeding location;
 *   fatal if the location is vital.
 * - **Marginal Failure** — severed; a Bleeder only where the location normally
 *   bleeds; fatal if the location is vital.
 * - **Marginal Success** — not severed, but the resulting Shock Roll takes −20.
 * - **Critical Success** — not severed, no further consequence.
 *
 * Pure and Foundry-free: the Foundry layer rolls the Strength test and passes
 * its normalized success level (`SuccessTestResult.normSuccessLevel`) and the
 * location facts here.
 *
 * @param normSuccessLevel - The Strength test's normalized success level
 *   (`CRITICAL_FAILURE` … `CRITICAL_SUCCESS`).
 * @param location - Facts about the struck location.
 * @param location.isVital - Whether the struck body part is a `VITAL` role
 *   (a severed vital location is fatal).
 * @param location.bleedRisk - The location's bleeding-susceptibility tier; a
 *   marginal-failure severance bleeds only when this is not `NONE`.
 * @returns The resolved amputation outcome.
 */
export function amputationOutcome(
    normSuccessLevel: number,
    location: { isVital: boolean; bleedRisk: string },
): AmputationOutcome {
    const canBleed = location.bleedRisk !== BLEEDING_SUSCEPTIBILITY.NONE;
    if (normSuccessLevel <= CRITICAL_FAILURE) {
        return {
            severed: true,
            dies: location.isVital,
            bleeder: true,
            shockPenalty: 0,
        };
    }
    if (normSuccessLevel === MARGINAL_FAILURE) {
        return {
            severed: true,
            dies: location.isVital,
            bleeder: canBleed,
            shockPenalty: 0,
        };
    }
    if (normSuccessLevel === MARGINAL_SUCCESS) {
        return {
            severed: false,
            dies: false,
            bleeder: false,
            shockPenalty: -20,
        };
    }
    // Critical Success (or any better-than-marginal result): a clean miss.
    return { severed: false, dies: false, bleeder: false, shockPenalty: 0 };
}
