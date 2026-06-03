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

import type { MasteryLevelModifier } from "@src/domain/modifier/MasteryLevelModifier";
import type { ImpactModifier } from "@src/domain/modifier/ImpactModifier";
import type { ImpactAspect } from "@src/utils/constants";

export type StrikeModeTestKind = "attack" | "block" | "counterstrike";

interface ActorLike {
    items: { get: (id: string) => any };
}

/**
 * Resolve the MasteryLevelModifier for a given strike-mode test on an actor.
 *
 * Pure function — does not touch the DOM or Foundry globals — so it can be
 * unit-tested. The Being sheet's click handler uses this to convert the
 * data attributes on the Combat tab into a runnable mastery test.
 *
 * @param actor   Anything with an `items.get(id)` accessor (a SohlActor at runtime).
 * @param itemId  ID of the item carrying the strike mode (weapon or combat technique).
 * @param smId    ID of the strike mode within that item.
 * @param testKind Which roll to fetch: attack, block, or counterstrike.
 * @returns The modifier, or `null` if any lookup step failed (missing item,
 *          missing strike mode, or the kind isn't valid on this mode — e.g.
 *          block on a missile mode).
 */
export function resolveStrikeModeML(
    actor: ActorLike,
    itemId: string,
    smId: string,
    testKind: StrikeModeTestKind,
): MasteryLevelModifier | null {
    const item = actor.items.get(itemId);
    if (!item) return null;
    const strikeModes = item.logic?.strikeModes;
    if (!Array.isArray(strikeModes)) return null;
    const sm = strikeModes.find((m: any) => m.id === smId);
    if (!sm) return null;
    if (testKind === "attack") return sm.attack ?? null;
    if (testKind === "block") return sm.defense?.block ?? null;
    if (testKind === "counterstrike") return sm.defense?.counterstrike ?? null;
    return null;
}

/**
 * Resolve the {@link ImpactModifier} for a given strike mode on an actor.
 *
 * Pure function — does not touch the DOM or Foundry globals — so it can be
 * unit-tested. The Being sheet's Impact click handler uses this to convert the
 * row's data attributes into the impact modifier to roll.
 *
 * @returns The impact modifier, or `null` if the item or strike mode is
 *          missing, or the mode delivers no impact (disabled).
 */
export function resolveStrikeModeImpact(
    actor: ActorLike,
    itemId: string,
    smId: string,
): ImpactModifier | null {
    const item = actor.items.get(itemId);
    if (!item) return null;
    const strikeModes = item.logic?.strikeModes;
    if (!Array.isArray(strikeModes)) return null;
    const sm = strikeModes.find((m: any) => m.id === smId);
    if (!sm) return null;
    const impact = sm.impact as ImpactModifier | undefined;
    if (!impact || impact.disabled) return null;
    return impact;
}

/** A targeted token reduced to the data the damage card needs. */
export interface DamageCardTarget {
    /** Display name of the targeted token. */
    name: string;
    /** UUID of the targeted token's actor — handles the Calculate Injury button. */
    actorUuid: string;
}

/** Inputs for {@link buildDamageCardData}. */
export interface DamageCardInput {
    /** Card title, e.g. "Broadsword – Cut". */
    title: string;
    /** The attacker actor's id (for `data-actor-id`). */
    actorId: string | null;
    /** The attacker actor's UUID (source of the blow). */
    sourceActorUuid: string;
    /** Impact dice formula with aspect suffix, e.g. "2d6+3e". */
    impactLabel: string;
    /** Human-readable roll breakdown, e.g. "[3, 5] + 3". */
    rollResult: string;
    /** Total impact delivered. */
    impact: number;
    /** Damage aspect of the blow. */
    aspect: ImpactAspect;
    /** The targeted defender, or `null` if nothing is targeted. */
    target: DamageCardTarget | null;
}

/**
 * Build the render context for `damage-card.hbs` from a rolled impact.
 *
 * The Calculate Injury button carries `data-test-result-json` with just
 * `{ impact, aspect }` (no aim data), so clicking it on the target opens the
 * assisted Add Injury dialog rather than auto-resolving. Pure and Foundry-free.
 */
export function buildDamageCardData(
    input: DamageCardInput,
): Record<string, unknown> {
    return {
        title: input.title,
        actorId: input.actorId,
        sourceActorUuid: input.sourceActorUuid,
        impactLabel: input.impactLabel,
        rollResult: input.rollResult,
        impact: input.impact,
        aspect: input.aspect,
        hasTarget: !!input.target,
        targetName: input.target?.name ?? "",
        handlerUuid: input.target?.actorUuid ?? "",
        testResultJson: JSON.stringify({
            impact: input.impact,
            aspect: input.aspect,
        }),
    };
}
