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
    ITEM_KIND,
    MARGINAL_FAILURE,
    MARGINAL_SUCCESS,
    STATUS_EFFECT,
    TEST_TYPE,
    type ImpactAspect,
} from "@src/utils/constants";
import type { SohlLogic } from "@src/core/SohlLogic";
import type { SohlTokenDocument } from "@src/document/token/SohlTokenDocument";
import type { StrikeModeBase } from "@src/domain/strikemode/StrikeModeBase";
import { AttackResult } from "@src/domain/result/AttackResult";
import type { CombatResult } from "@src/domain/result/CombatResult";
import type { ImpactResult } from "@src/domain/result/ImpactResult";
import { SimpleRoll } from "@src/utils/SimpleRoll";
import { instanceToJSON } from "@src/utils/helpers";

/** Which strike-mode test a combat action resolves: attack, block, or counterstrike. */
export type StrikeModeTestKind = "attack" | "block" | "counterstrike";

interface ActorLike {
    items: { get: (id: string) => any };
}

/**
 * Status effects that bar a combatant from **initiating** an automated attack
 * (invariant: the attacker must have none of these). `DEFEATED` is Foundry's
 * special status, registered here as `vanquished`.
 */
export const ATTACK_BLOCKING_STATUSES: readonly string[] = [
    STATUS_EFFECT.DEAD,
    STATUS_EFFECT.VANQUISHED,
    STATUS_EFFECT.UNCONSCIOUS,
    STATUS_EFFECT.SLEEP,
    STATUS_EFFECT.RESTRAINED,
    STATUS_EFFECT.PARALYZED,
    STATUS_EFFECT.FROZEN,
    STATUS_EFFECT.INCAPACITATED,
];

/**
 * Status effects that reduce a **defender** to the IGNORE-only response — every
 * active defense (Dodge / Block / Counterstrike) is disabled. `DEAD` is omitted:
 * a dead combatant is already barred as an attack target up front (invariant 4),
 * so it never reaches the defense stage.
 */
export const DEFENSE_DISABLING_STATUSES: readonly string[] = [
    STATUS_EFFECT.UNCONSCIOUS,
    STATUS_EFFECT.SLEEP,
    STATUS_EFFECT.RESTRAINED,
    STATUS_EFFECT.PARALYZED,
    STATUS_EFFECT.FROZEN,
    STATUS_EFFECT.INCAPACITATED,
];

/** The first id in `forbidden` present in `statuses`, or `null`. Pure. */
export function firstStatusIn(
    statuses: Iterable<string>,
    forbidden: readonly string[],
): string | null {
    const set = statuses instanceof Set ? statuses : new Set(statuses);
    return forbidden.find((s) => set.has(s)) ?? null;
}

/** Whether any id in `forbidden` is present in `statuses`. Pure. */
export function hasAnyStatus(
    statuses: Iterable<string>,
    forbidden: readonly string[],
): boolean {
    return firstStatusIn(statuses, forbidden) !== null;
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
 * Resolve the {@link MasteryLevelModifier} of an actor's **skill** identified by
 * its (static, non-localized) `system.shortcode` — e.g. `"dge"` for Dodge.
 *
 * Pure and Foundry-free. Used by the defender's automated-combat resumes (Dodge,
 * …) to roll against the right skill. Returns `null` when the actor has no skill
 * with that shortcode.
 *
 * @param actor     Anything exposing `itemTypes.skill` (a SohlActor at runtime).
 * @param shortcode The skill's `system.shortcode` (e.g. `"dge"`).
 */
export function resolveSkillMasteryLevel(
    actor: { itemTypes?: { skill?: any[] } },
    shortcode: string,
): MasteryLevelModifier | null {
    const skills = actor.itemTypes?.skill ?? [];
    const skill = skills.find((s: any) => s?.system?.shortcode === shortcode);
    return (skill?.logic?.masteryLevel as MasteryLevelModifier) ?? null;
}

/** A defender strike mode usable for a Block, with its (live) block modifier. */
export interface BlockableStrikeMode {
    /** Id of the owning item (weapon or combat technique). */
    itemId: string;
    /** Id of the strike mode within that item. */
    smId: string;
    /** The owning item's display name (e.g. "Round Shield"). */
    itemName: string;
    /** Dialog label, e.g. "Round Shield — Block". */
    label: string;
    /** The strike mode's block mastery-level modifier (live, not cloned). */
    ml: MasteryLevelModifier;
}

/**
 * Gather every strike mode the actor can **block** with — across weapons and
 * combat techniques — i.e. melee modes whose `defense.block` is present and not
 * disabled (not `noBlock`). Pure and Foundry-free; used to populate the Block
 * dialog and to resolve the chosen mode's block modifier.
 */
export function collectBlockableStrikeModes(actor: {
    itemTypes?: any;
}): BlockableStrikeMode[] {
    const out: BlockableStrikeMode[] = [];
    const itemTypes = actor.itemTypes ?? {};
    const consider = (item: any, sm: any) => {
        const block = sm?.defense?.block as MasteryLevelModifier | undefined;
        if (block && !(block as any).disabled) {
            out.push({
                itemId: item.id,
                smId: sm.id,
                itemName: item.name,
                label: `${item.name} — ${sm.name}`,
                ml: block,
            });
        }
    };
    for (const item of itemTypes[ITEM_KIND.WEAPONGEAR] ?? []) {
        for (const sm of item.logic?.strikeModes ?? []) consider(item, sm);
    }
    for (const item of itemTypes[ITEM_KIND.COMBATTECHNIQUE] ?? []) {
        const sm = item.logic?.strikeMode;
        if (sm) consider(item, sm);
    }
    return out;
}

/** A strike mode usable to attack the current target, with its owning item. */
export interface AttackableStrikeMode {
    /** Id of the owning item (weapon or combat technique). */
    itemId: string;
    /** Id of the strike mode within that item. */
    smId: string;
    /** The owning item's display name. */
    itemName: string;
    /** The strike mode (carries `.attack`, `.impact`, `.isMissile`, range/reach). */
    strikeMode: StrikeModeBase;
}

/**
 * Gather every strike mode the actor can attack the target with at
 * `distanceFeet`, across weapons and combat techniques. Pure and Foundry-free.
 *
 * Range is the gate (in addition to `noAttack`):
 * - **melee** modes are limited by the mode's **reach** (`reach.effective`),
 * - **missile** modes are limited by **base range** (`baseRange.effective`) —
 *   beyond base range is a volley (area attack), which automated combat does
 *   not support, so those modes are excluded entirely.
 *
 * An empty result means the target is out of range of every mode.
 */
export function collectAttackableStrikeModes(
    actor: { itemTypes?: any },
    distanceFeet: number,
): AttackableStrikeMode[] {
    const out: AttackableStrikeMode[] = [];
    const itemTypes = actor.itemTypes ?? {};
    const consider = (item: any, sm: any) => {
        if (!sm || sm.attack?.disabled) return;
        const inRange =
            sm.isMissile ?
                distanceFeet <= (sm.baseRange?.effective ?? 0)
            :   distanceFeet <= (sm.reach?.effective ?? 0);
        if (!inRange) return;
        out.push({
            itemId: item.id,
            smId: sm.id,
            itemName: item.name,
            strikeMode: sm as StrikeModeBase,
        });
    };
    for (const item of itemTypes[ITEM_KIND.WEAPONGEAR] ?? []) {
        for (const sm of item.logic?.strikeModes ?? []) consider(item, sm);
    }
    for (const item of itemTypes[ITEM_KIND.COMBATTECHNIQUE] ?? []) {
        consider(item, item.logic?.strikeMode);
    }
    return out;
}

/**
 * Whether the actor has any **melee attack** strike mode it could counterstrike
 * with — i.e. a melee mode whose `attack` is present and not disabled (not
 * `noAttack`). Range-independent (reach is checked when the counterstrike is
 * actually resolved); this is the capability gate for showing the Counterstrike
 * button. Pure and Foundry-free.
 */
export function hasMeleeAttackStrikeMode(actor: { itemTypes?: any }): boolean {
    const itemTypes = actor.itemTypes ?? {};
    const usable = (sm: any) => !!sm && !sm.attack?.disabled && !!sm.isMelee;
    for (const item of itemTypes[ITEM_KIND.WEAPONGEAR] ?? []) {
        for (const sm of item.logic?.strikeModes ?? [])
            if (usable(sm)) return true;
    }
    for (const item of itemTypes[ITEM_KIND.COMBATTECHNIQUE] ?? []) {
        if (usable(item.logic?.strikeMode)) return true;
    }
    return false;
}

/** The range band of a missile **direct** shot (see {@link classifyMissileRange}). */
export interface MissileRangeBand {
    /** Within base range — a supported direct shot (else a volley, unsupported). */
    direct: boolean;
    /** Within half base range. */
    pointBlank: boolean;
    /** Hit-location scatter spread: 6 at point blank, else 8. */
    spread: number;
    /** Impact range bonus: +2 at point blank, else 0. */
    impactRangeBonus: number;
}

/**
 * Classify a missile **direct** shot by distance vs base range (feet):
 * `≤ baseRange/2` is point blank (spread 6, impact +2); `≤ baseRange` is a
 * normal direct shot (spread 8, no bonus); beyond is a volley (`direct:false`,
 * unsupported by automated combat). Pure.
 */
export function classifyMissileRange(
    distanceFeet: number,
    baseRangeFeet: number,
): MissileRangeBand {
    const pointBlank = distanceFeet <= baseRangeFeet / 2;
    return {
        direct: distanceFeet <= baseRangeFeet,
        pointBlank,
        spread: pointBlank ? 6 : 8,
        impactRangeBonus: pointBlank ? 2 : 0,
    };
}

/**
 * Index of the entry with the highest effective mastery level (the "best
 * chance" default), or -1 for an empty list. Pure.
 */
export function indexOfBestMastery<T>(
    entries: T[],
    ml: (entry: T) => number,
): number {
    let best = -1;
    let bestVal = -Infinity;
    entries.forEach((e, i) => {
        const v = ml(e);
        if (v > bestVal) {
            bestVal = v;
            best = i;
        }
    });
    return best;
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
    /** Strike spread for injury hit-location scatter (melee `spread`; missile 6/8). */
    spread?: number;
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
            spread: input.spread ?? 0,
            title: input.title ?? "",
        } as Partial<AttackResult.Data>,
        { parent: input.parent },
    );
}

/**
 * Resolve the single target **combatant** of an automated attack from the
 * client's targeted tokens. Automated combat targets a *combatant*, not just a
 * token: tokens that are not combatants of the current combat are ignored, so a
 * player may have other (non-combatant) tokens targeted without ambiguity.
 * Exactly one targeted token must map to a combatant — zero or more than one
 * throws (with a user-facing message).
 *
 * Pure: `targeted` is the current target list and `toCombatant` maps a token to
 * its combatant (or `null`), so the rule is unit-testable without canvas/combat
 * globals.
 */
export function resolveTargetCombatant<Tok, Comb>(
    targeted: Tok[],
    toCombatant: (token: Tok) => Comb | null,
): Comb {
    const combatants = targeted
        .map(toCombatant)
        .filter((c): c is Comb => c != null);
    if (combatants.length !== 1) {
        throw new Error(
            "Automated combat requires exactly one combatant token to be targeted.",
        );
    }
    return combatants[0];
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
    // When the blow was aimed, forward `targetPart` + `spread` so the
    // `createInjury` handler resolves the hit location automatically; otherwise
    // omit them and the handler opens the assisted Add Injury dialog.
    const aim =
        impact.aimBodyPartCode ?
            { targetPart: impact.aimBodyPartCode, spread: impact.spread }
        :   {};
    return {
        handlerUuid: target.actorUuid,
        targetName: target.name,
        testResultJson: JSON.stringify({
            impact: impact.total,
            aspect: impact.aspect,
            ...aim,
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
        defRollResult:
            defenderContested ? successLevelText(def.successLevel) : "",
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
