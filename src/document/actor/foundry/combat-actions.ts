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
import {
    ATTACK_MISHAP,
    CRITICAL_FAILURE,
    DEFEND_MISHAP,
    MARGINAL_FAILURE,
    MARGINAL_SUCCESS,
    TEST_TYPE,
    type ImpactAspect,
} from "@src/utils/constants";
import type { SohlLogic } from "@src/core/SohlLogic";
import type { SohlTokenDocument } from "@src/document/token/SohlTokenDocument";
import { AttackResult } from "@src/domain/result/AttackResult";
import type { CombatResult } from "@src/domain/result/CombatResult";
import type { ImpactResult } from "@src/domain/result/ImpactResult";
import { SimpleRoll } from "@src/utils/SimpleRoll";
import { instanceToJSON } from "@src/utils/helpers";

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

/** A fresh, rolled d100. */
function rollAttackDie(): SimpleRoll {
    const roll = new SimpleRoll({
        numDice: 1,
        dieFaces: 100,
        modifier: 0,
        rolls: [],
    });
    roll.roll();
    return roll;
}

/** Inputs for {@link buildAttackResult}. */
export interface BuildAttackInput {
    /** The strike mode's attack mastery-level modifier (see {@link resolveStrikeModeML}). */
    attackML: MasteryLevelModifier;
    /** The strike mode's impact modifier (see {@link resolveStrikeModeImpact}). */
    impact: ImpactModifier;
    /** Logic that owns the resulting AttackResult and its cloned modifiers (the attacker). */
    parent: SohlLogic;
    /** The attacker's token, recorded on the result. */
    token: SohlTokenDocument | null;
    /** Test type id, e.g. `TEST_TYPE.AUTOCOMBATMELEE.id`. */
    testType: string;
    /** The targeted body part shortcode, stored on the result for the cards + injury. */
    aimBodyPartCode?: string;
    /** Display label for the attack (weapon/strike-mode name), stored as the result's title. */
    title?: string;
    /** Pre-rolled d100 (tests); defaults to a fresh random roll. */
    roll?: SimpleRoll;
}

/**
 * Assemble an {@link AttackResult} from a strike mode's resolved attack and
 * impact modifiers. Pure and Foundry-free: it clones the modifiers (so the
 * result is independent of — and serializable without — the live strike mode)
 * and rolls a fresh d100 unless one is supplied.
 *
 * The result is *not* yet evaluated; the caller runs `evaluate()` (on the
 * attacker's client, which owns the speaker) before posting the attack card.
 */
export function buildAttackResult(input: BuildAttackInput): AttackResult {
    // Clone so the result is independent of (and serializable without) the live
    // strike mode. `clone()` round-trips through the kind registry, faithfully
    // reviving nested ValueDeltas and rebuilding the concrete subclass.
    const masteryLevelModifier = input.attackML.clone<MasteryLevelModifier>(
        {},
        { parent: input.parent },
    );
    const impact = input.impact.clone<ImpactModifier>(
        {},
        { parent: input.parent },
    );
    return new AttackResult(
        {
            roll: input.roll ?? rollAttackDie(),
            masteryLevelModifier,
            impact,
            token: input.token ?? undefined,
            testType: input.testType,
            aimBodyPartCode: input.aimBodyPartCode ?? "",
            title: input.title ?? "",
        } as Partial<AttackResult.Data>,
        { parent: input.parent },
    );
}

/**
 * Resolve the single legal target of an automated attack. The attacker must
 * have exactly one token targeted, and that token must be in the active
 * combat. Throws (with a user-facing message) otherwise.
 *
 * Pure: `targeted` is the current target list and `isInCombat` reports combat
 * membership, so the rule is unit-testable without canvas/combat globals.
 */
export function resolveAttackTarget<T>(
    targeted: T[],
    isInCombat: (token: T) => boolean,
): T {
    if (targeted.length !== 1) {
        throw new Error(
            "An automated attack requires exactly one target token.",
        );
    }
    const target = targeted[0];
    if (!isInCombat(target)) {
        throw new Error("The target must be in the current combat.");
    }
    return target;
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

/** A targeted defender reduced to the data the attack card needs. */
export interface AttackCardTarget {
    /** Display name of the defender token (subtitle + injury-button label). */
    name: string;
    /**
     * UUID of the defender token's **actor** — the dispatch handler for the
     * defense buttons (matched by `resolveChatCardHandlerUuid`'s
     * `handlerActorUuid` lookup), so the defense resolves on the defender's
     * client.
     */
    actorUuid: string;
}

/** Inputs for {@link buildAttackCardData}. */
export interface AttackCardInput {
    /** The attacker's *evaluated* attack result (drives Aim, Aspect, AML). */
    attackResult: AttackResult;
    /** Card title, e.g. "Broadsword Melee Attack". */
    title: string;
    /** Display name of the attacking token (subtitle). */
    attackerName: string;
    /** The attacker actor's id (for `data-actor-id`). */
    actorId: string | null;
    /** Human-readable label for the attack's aim (body part), shown on the card. */
    aimLabel: string;
    /** The targeted defender, or `null` if nothing is targeted. */
    target: AttackCardTarget | null;
}

/**
 * Build the render context for `attack-card.hbs` from an **evaluated**
 * {@link AttackResult}. Pure and Foundry-free.
 *
 * Transparency-by-design: the attacker's choices (Aim, Aspect) and the
 * resolved Attack Mastery Level are surfaced on the card for everyone to see.
 * The whole `AttackResult` is embedded as `attackResultData` (kind-stamped via
 * {@link instanceToJSON}); the template serializes it with the registered
 * `toJSON` Handlebars helper into `data-attack-result-json`, and the defense
 * resume rehydrates it with `instanceFromJSON`. The aim travels with the result
 * (`AttackResult.aimBodyPartCode`). All four defense buttons are emitted;
 * per-defender capability gating (Block/Counterstrike) happens later, at
 * chat-card render time.
 */
export function buildAttackCardData(
    input: AttackCardInput,
): Record<string, unknown> {
    const ar = input.attackResult;
    return {
        title: input.title,
        attackerName: input.attackerName,
        actorId: input.actorId,
        defenderName: input.target?.name ?? "",
        handlerActorUuid: input.target?.actorUuid ?? "",
        hasTarget: !!input.target,
        aim: ar.aimBodyPartCode,
        aimLabel: input.aimLabel,
        aspect: ar.impact?.aspectType ?? "",
        aml: ar.masteryLevelModifier?.constrainedEffective ?? 0,
        // All four defense buttons are emitted; per-defender capability gating
        // (Block/Counterstrike) happens at chat-card render time.
        hasDodge: true,
        hasBlock: true,
        hasCounterstrike: true,
        hasIgnore: true,
        // Kind-stamped plain object; the template emits it via `{{toJSON …}}`.
        attackResultData: instanceToJSON(ar),
    };
}

/** A combatant reduced to what a combat-card injury button needs. */
export interface CombatCardTarget {
    /** Display name of the struck token (button label). */
    name: string;
    /** UUID of the struck token's actor — the `createInjury` handler. */
    actorUuid: string;
}

/** Inputs for {@link buildCombatCardData}. */
export interface CombatCardInput {
    /** The resolved combat exchange. */
    combatResult: CombatResult;
    /** Card title, e.g. "Attack Result". */
    title: string;
    /** The card author's (defender's) actor id, for `data-actor-id`. */
    actorId: string | null;
    /** Display name of the attacker. */
    attackerName: string;
    /** Display name of the defender. */
    defenderName: string;
    /** The attacker's strike-mode / weapon label. */
    attackWeapon: string;
    /** The defense label shown in the Defend column (e.g. "Ignore", "Dodge"). */
    defenseLabel: string;
    /** Who the attacker's blow strikes (the defender) — for its injury button. */
    attackTarget: CombatCardTarget | null;
    /** Who a counterstrike strikes (the attacker) — for its injury button. */
    defendTarget?: CombatCardTarget | null;
}

/** Map a numeric success level to its display text. */
function successLevelText(sl: number): string {
    if (sl <= CRITICAL_FAILURE) return "Critical Failure";
    if (sl === MARGINAL_FAILURE) return "Marginal Failure";
    if (sl === MARGINAL_SUCCESS) return "Marginal Success";
    return "Critical Success";
}

/**
 * Build the assisted-injury button payload for a landing side, or `null` when
 * the side did not land (no `ImpactResult`) or has no target. Mirrors
 * {@link buildDamageCardData}: the `createInjury` handler opens the Add Injury
 * dialog from `{ impact, aspect }` (no aim forwarded yet → assisted, not
 * automated).
 */
function injuryButton(
    impact: ImpactResult | undefined,
    target: CombatCardTarget | null | undefined,
): { handlerUuid: string; targetName: string; testResultJson: string } | null {
    if (!impact || !target) return null;
    return {
        handlerUuid: target.actorUuid,
        targetName: target.name,
        testResultJson: JSON.stringify({
            impact: impact.total,
            aspect: impact.aspect,
        }),
    };
}

/**
 * Build the render context for `attack-result-card.hbs` from a resolved
 * {@link CombatResult}. Pure and Foundry-free.
 *
 * Shows the exchange in two columns (Attack | Defend); for **Ignore** the
 * defender did not contest, so its column is dashed. Each side that lands a
 * blow gets a "Calculate <Token> Injury" button wired to the `createInjury`
 * action (assisted). Counterstrike can land both sides at once.
 */
export function buildCombatCardData(
    input: CombatCardInput,
): Record<string, unknown> {
    const cr = input.combatResult;
    const atk = cr.attackResult;
    const def = cr.defendResult;
    // Ignore means the defender took no part: its column is dashed.
    const defenderContested = def?.testType !== TEST_TYPE.IGNORE.id;

    const atkInjury = injuryButton(cr.attackerImpact, input.attackTarget);
    const defInjury = injuryButton(cr.defenderImpact, input.defendTarget);

    return {
        actorId: input.actorId,
        title: input.title,
        attacker: input.attackerName,
        defender: input.defenderName,
        attackWeapon: input.attackWeapon,
        defense: input.defenseLabel,
        effAML: atk.masteryLevelModifier?.constrainedEffective ?? 0,
        effDML:
            defenderContested ?
                (def.masteryLevelModifier?.constrainedEffective ?? 0)
            :   "",
        attackRoll: atk.roll?.total ?? 0,
        defenseRoll: defenderContested ? (def.roll?.total ?? 0) : "",
        atkRollResult: successLevelText(atk.successLevel),
        atkIsSuccess: atk.isSuccess,
        atkIsCritical: atk.isCritical,
        defRollResult: defenderContested ? successLevelText(def.successLevel) : "",
        defIsSuccess: defenderContested ? def.isSuccess : false,
        defIsCritical: defenderContested ? def.isCritical : false,
        resultDesc:
            cr.attackerLandsBlow ?
                `${input.attackerName} strikes!`
            :   "Attack misses.",
        hasAttackHit: cr.attackerLandsBlow,
        impactFormula: cr.attackerLandsBlow ? (atk.impact?.label ?? "") : "",
        numAtkTA:
            cr.tacticalAdvantages.side === "attacker" ?
                cr.tacticalAdvantages.count
            :   0,
        numDefTA:
            cr.tacticalAdvantages.side === "defender" ?
                cr.tacticalAdvantages.count
            :   0,
        atkWeaponBroke: cr.weaponBreakCheck === "attacker",
        defWeaponBroke: cr.weaponBreakCheck === "defender",
        isAtkFumbleTest: atk.mishaps?.has(ATTACK_MISHAP.FUMBLE_TEST) ?? false,
        isAtkStumbleTest: atk.mishaps?.has(ATTACK_MISHAP.STUMBLE_TEST) ?? false,
        isDefFumbleTest:
            defenderContested ?
                (def.mishaps?.has(DEFEND_MISHAP.FUMBLE_TEST) ?? false)
            :   false,
        isDefStumbleTest:
            defenderContested ?
                (def.mishaps?.has(DEFEND_MISHAP.STUMBLE_TEST) ?? false)
            :   false,
        // Injury buttons (createInjury, assisted) — one per landing side.
        hasAttackInjury: !!atkInjury,
        attackInjuryHandlerUuid: atkInjury?.handlerUuid ?? "",
        attackInjuryTargetName: atkInjury?.targetName ?? "",
        attackInjuryJson: atkInjury?.testResultJson ?? "",
        hasDefendInjury: !!defInjury,
        defendInjuryHandlerUuid: defInjury?.handlerUuid ?? "",
        defendInjuryTargetName: defInjury?.targetName ?? "",
        defendInjuryJson: defInjury?.testResultJson ?? "",
    };
}
