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

import type { MissileStrikeMode } from "@src/entity/strikemode/MissileStrikeMode";
import type { MeleeStrikeMode } from "@src/entity/strikemode/MeleeStrikeMode";
import type { ImpactResult } from "@src/entity/result/ImpactResult";
import type { ImpactModifier } from "@src/entity/modifier/ImpactModifier";
import type { WeaponGearLogic } from "@src/document/item/logic/WeaponGearLogic";
import type { CombatTechniqueLogic } from "@src/document/item/logic/CombatTechniqueLogic";
import type { SohlActionContext } from "@src/entity/action/SohlActionContext";
import type { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import type { BeingLogic } from "@src/document/actor/logic/BeingLogic";
import type { SohlCombatant } from "@src/document/combatant/foundry/SohlCombatant";
import type { SohlTokenDocumentLogic } from "@src/document/token/logic/SohlTokenDocumentLogic";
import type { SohlActorLogic } from "@src/document/actor/logic/SohlActorBaseLogic";
import type { SohlAction } from "@src/entity/action/SohlAction";

import { defaultToJSON } from "@src/utils/helpers";
import { AttackResult } from "@src/entity/result/AttackResult";
import { CombatResult } from "@src/entity/result/CombatResult";
import { DefendResult } from "@src/entity/result/DefendResult";
import { SohlLogic, SohlLogicData } from "@src/core/logic/SohlLogic";
import { StrikeModeBase } from "@src/entity/strikemode/StrikeModeBase";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import {
    ATTACK_MISHAP,
    CRITICAL_FAILURE,
    DEFEND_MISHAP,
    ImpactAspect,
    ITEM_KIND,
    MARGINAL_FAILURE,
    MARGINAL_SUCCESS,
    SYMBOL,
    ACTION_SUBTYPE,
    SKILL_CODE,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
    STATUS_EFFECT,
    TEST_TYPE,
    ACTOR_KIND,
    BRAND,
    isA,
    VALUE_DELTA_INFO,
    type MovementMedium,
} from "@src/utils/constants";
import {
    combatantGridDistance,
    combatantSpacesMoved,
    fvttCombatantLogics,
    fvttLogicFromUuidSync,
    fvttPromptMoveCombatantToGroup,
    getActiveCombat,
} from "@src/core/FoundryHelpers";
import { instanceFromJSON, toFilePath } from "@src/utils/helpers";
import { fvttRangeToTarget } from "@src/core/FoundryHelpers";
import {
    showAttackDialog,
    showDefenseDialog,
    type AttackDialogResult,
} from "@src/document/combatant/logic/combatant-dialogs";

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

/**
 * The Foundry-free data contract for a SoHL combatant — the
 * {@link SohlLogicData} port specialized for {@link SohlCombatant}, plus the
 * combatant's persisted combat-scoped state. Implemented by
 * `SohlCombatantDataModel`.
 */
export interface SohlCombatantData extends SohlLogicData<SohlCombatant> {
    /** Turn-start location used to measure spaces moved this turn. */
    startLocation: { x: number; y: number; elevation: number };
    /** Whether this combatant has acted this turn. */
    didAction: boolean;
    /** GM situational multiplier on computed move (run, terrain, …). */
    moveFactor: number;
    /** Which movement medium's computed move the tracker displays. */
    displayedMedium: string;
    /** Strike mode last used to attack (`{ itemId, smId }`), or `null`. */
    lastAttackMode?: StrikeModeBase.PointerData;
    /** Strike mode last used to block (`{ itemId, smId }`), or `null`. */
    lastBlockMode?: StrikeModeBase.PointerData;

    // --- Derived Foundry-side facts (kept off the logic's direct reach) ------
    /** This combatant's {@link CombatantGroup} id, or `null` when ungrouped. */
    groupId: string | null;
    /** Whether this combatant is defeated (Foundry DEFEATED special status). */
    isDefeated: boolean;
    /** The active status-effect ids on this combatant's actor. */
    statuses: Set<string>;
    /** Whether this combatant's token is hidden from players. */
    isHidden: boolean;
}

/**
 * Logic for a SoHL combatant — the combat-participation layer.
 *
 * @remarks
 * Holds the combatant's combat-scoped state and the rules that operate on it
 * (relational enemy/ally queries, strike-mode memory, movement, reach), reading
 * the actor's capabilities through {@link actorLogic}. Spatial queries (reach to
 * another combatant) are the one scene-coupled edge and route through the scene
 * facade. Combat participation (the automated block/dodge/counterstrike resume
 * flow) lives here as intrinsic actions, distinct from the actor's combat
 * *capability* (strike modes, reach) on the actor logic.
 */
export class SohlCombatantLogic<
    TData extends SohlCombatantData = SohlCombatantData,
> extends SohlLogic<TData> {
    /**
     * Runtime brand identifying a combatant logic — lets `isA(x,
     * "SohlCombatantLogic")` match without importing the class as a value.
     * Never an own/serialized property.
     */
    get [BRAND.SohlCombatantLogic](): true {
        return true;
    }

    /**
     * Find the combatant logic for a given actor in the active combat.
     *
     * Scans the active combat's combatants for the first whose actor matches
     * `actorLogic` (by id) and returns that combatant's logic. Use it to reach an
     * actor's combat-scoped state (e.g. {@link lastAttackMode}, {@link didAction})
     * when you only hold the actor's logic.
     *
     * @param actorLogic - The actor logic to look up.
     * @returns The matching combatant's logic, or `undefined` if there is no
     *   active combat or the actor is not a combatant in it.
     */
    static fromActorLogic(
        actorLogic: SohlActorLogic<any> | undefined,
    ): SohlCombatantLogic | undefined {
        return getActiveCombat()?.combatants?.find(
            (c) => c.actor?.id === actorLogic?.data.id,
        )?.logic;
    }

    /**
     * Find the combatant logic for a given token in the active combat.
     *
     * Scans the active combat's combatants for the first whose token matches
     * `tokenLogic` (by id) and returns that combatant's logic. Use it to reach an
     * token's combat-scoped state (e.g. {@link lastAttackMode}, {@link didAction})
     * when you only hold the token's logic.
     *
     * @param tokenLogic - The token logic to look up.
     * @returns The matching combatant's logic, or `undefined` if there is no
     *   active combat or the token is not a combatant in it.
     */
    static fromTokenLogic(
        tokenLogic: SohlTokenDocumentLogic | undefined,
    ): SohlCombatantLogic | undefined {
        return getActiveCombat()?.combatants?.find(
            (c) => c.token?.id === tokenLogic?.id,
        )?.logic;
    }

    /** The strike mode last used to attack, or `undefined` (combat-scoped). */
    get lastAttackMode(): StrikeModeBase | undefined {
        return this.data.lastAttackMode ?
                StrikeModeBase.fromPointerData(this.data.lastAttackMode)
            :   undefined;
    }

    /** The strike mode last used to block, or `undefined` (combat-scoped). */
    get lastBlockMode(): StrikeModeBase | undefined {
        return this.data.lastBlockMode ?
                StrikeModeBase.fromPointerData(this.data.lastBlockMode)
            :   undefined;
    }

    /**
     * Return this Combatant's TokenDocument's Logic
     * @returns the token document's logic
     */
    get tokenLogic(): SohlTokenDocumentLogic {
        return (this.parent as any).token.logic;
    }

    /**
     * Remember the strike mode just used to attack (persisted on the combatant).
     * @param mode - The strike mode to record.
     */
    async recordAttackMode(mode: StrikeModeBase): Promise<void> {
        await this.data.update({
            "system.lastAttackMode": mode.pointerData,
        });
    }

    /**
     * Remember the strike mode just used to block (persisted on the combatant).
     * @param mode - The strike mode to record.
     */
    async recordBlockMode(mode: StrikeModeBase): Promise<void> {
        await this.data.update({
            "system.lastBlockMode": mode.pointerData,
        });
    }

    /** Whether this combatant has acted this turn. */
    get didAction(): boolean {
        return this.data.didAction;
    }

    /**
     * This combatant's melee reach (feet) — the reach of its actor (the greatest
     * reach among the actor's available melee strike modes). 0 when the actor is
     * absent or is not a Being.
     */
    get reach(): number {
        return (this.actorLogic as BeingLogic | null)?.reach ?? 0;
    }

    /**
     * Pure predicate behind {@link SohlCombatantLogic.threatenedBy}: a candidate
     * combatant threatens the subject iff it is an enemy that is alive, conscious,
     * capable, visible, and within reach.
     *
     * @param other - The combatant (logic) to test against
     * @returns `true` if the candidate threatens the subject.
     */
    isThreatening(other: SohlCombatantLogic): boolean {
        return (
            other !== this &&
            this.isEnemyOf(other) &&
            !other.data.isDefeated &&
            !THREAT_NEGATING_STATUSES.some((s) => other.data.statuses.has(s)) &&
            !other.data.isHidden &&
            other.reaches(this)
        );
    }

    /**
     * The computed tactical move for this combatant in the given medium,
     * accounting for the combatant's situational `moveFactor` scalar.
     * `null` when the actor has no movement model (e.g. a Vehicle).
     * @param medium - The movement medium to compute for.
     * @returns The tactical move, or `null` when unavailable.
     */
    computedMove(medium: MovementMedium): number | null {
        return (this.actorLogic as BeingLogic)?.effectiveBaseMove(medium)
            .effective;
    }

    /** The computed move for the combat-tracker's displayed medium. */
    get displayedMove(): number | null {
        return this.computedMove(this.data.displayedMedium as MovementMedium);
    }

    // --- Relational / spatial (scene-coupled edge) ---------------------------

    /** The owning {@link SohlCombatant} document — the combatant's scene edge. */
    get combatant(): SohlCombatant | null {
        return this.data.parent;
    }

    /**
     * The {@link SohlCombatantLogic} of every combatant in the same active combat
     * (including this one), or an empty array when not in combat.
     */
    get combatantLogics(): SohlCombatantLogic[] {
        return fvttCombatantLogics(this.combatant);
    }

    /** This combatant's group id, or `null` when ungrouped. */
    get groupId(): string | null {
        return this.data.groupId;
    }

    /**
     * Whether the two combatants are enemies — they belong to different groups.
     * @param other - The combatant logic to compare against.
     * @returns `true` if they are enemies.
     */
    isEnemyOf(other: SohlCombatantLogic): boolean {
        return areCombatantsEnemies(
            this.groupId,
            other.groupId,
            other === this,
        );
    }

    /**
     * The combatant logics sharing this one's (non-null) group — the inverse of
     * {@link isEnemyOf}.
     */
    get allies(): SohlCombatantLogic[] {
        if (!this.groupId) return [];
        return this.combatantLogics.filter(
            (cl) => cl !== this && !this.isEnemyOf(cl),
        );
    }

    /**
     * The combatant logics currently threatening this one — enemies that are
     * not defeated, not incapacitated, not hidden, and within reach.
     */
    get threatenedBy(): SohlCombatantLogic[] {
        return this.combatantLogics.filter((cl) => {
            return this.isThreatening(cl);
        });
    }

    /**
     * Whether this combatant's melee reach extends to `other` — center-to-center
     * grid distance is within this combatant's {@link reach}.
     * @param other - The combatant logic to test reach against.
     * @returns `true` if reach extends to `other`.
     */
    reaches(other: SohlCombatantLogic): boolean {
        const a = this.combatant;
        const b = other.combatant;
        if (!a || !b) return false;
        const distance = combatantGridDistance(a, b);
        return distance != null && distance <= this.reach;
    }

    /** The number of grid spaces moved since the start of this turn. */
    get spacesMovedThisTurn(): number {
        const c = this.combatant;
        return c ? combatantSpacesMoved(c, this.data.startLocation) : 0;
    }

    /* --------------------------------------------- */
    /* Intrinsic Actions                             */
    /* --------------------------------------------- */

    /**
     * Begin an automated attack — the **single entry point** for combat start.
     * @param context - Action context (supplies the target, scope, and chat options).
     * @param context.scope
     * @param context.scope.mode Strike mode to use (asks if not provided)
     * @returns The attack result or `undefined` if cancelled.
     */
    async startAutomatedAttack(
        context: SohlActionContext<Partial<AutomatedCombat.AttackContextScope>>,
    ): Promise<PlainObject | undefined> {
        if (!context.target) {
            sohl.log.uiWarn(
                `${this.name} automated attack requires a target combatant.`,
            );
            return;
        }

        // The attack targets the defender; distance is
        // attacker (this combatant) → defender.
        const distanceFeet =
            fvttRangeToTarget(this.tokenLogic, context.target) ?? Infinity;

        // Perform the attack dialog and resolve the attack result.
        const attackDlgResult = await commonAttack(
            context,
            this,
            "Attack",
            (sm: StrikeModeBase) => {
                return sm.isMissile ?
                        distanceFeet <=
                            ((sm as MissileStrikeMode).baseRange?.effective ??
                                0)
                    :   distanceFeet <=
                            ((sm as MeleeStrikeMode).reach?.effective ?? 0);
            },
            (sm: StrikeModeBase) => sm.attack?.constrainedEffective ?? -1,
        );
        if (!attackDlgResult) return;

        const attackSM = StrikeModeBase.fromPointerData(attackDlgResult.mode);
        if (!attackSM) return;

        // Spread is the injury hit-location scatter (for melee) or the missile
        // range band's spread (for missile). Impact range bonus is a flat bonus
        // to the impact formula for point-blank missile.
        let spread: number;
        let impactRangeBonus = 0;
        if (attackSM.isMissile) {
            const band = classifyMissileRange(
                distanceFeet,
                (attackSM as MissileStrikeMode).baseRange?.effective ?? 0,
            );
            // Spread (for injury hit-location scatter) + any impact range bonus.
            if (!band.direct) {
                // Should not happen (range-filtered upstream), but guard volley.
                sohl.log.uiWarn(
                    `${context.target?.name} is beyond direct range (volley is not supported).`,
                );
                return;
            }
            spread = band.spread;
            impactRangeBonus = band.impactRangeBonus;
        } else {
            spread = attackSM.spread?.effective ?? 0;
        }

        // Assemble the attack result
        const attackResult = buildAttackResult({
            attackML: attackSM.attack,
            impact: attackSM.impact,
            parent: this,
            tokenLogic: context.token,
            testType:
                attackSM.isMissile ?
                    TEST_TYPE.AUTOCOMBATMISSILE.id
                :   TEST_TYPE.AUTOCOMBATMELEE.id,
            aimBodyPartCode: attackDlgResult.aim,
            spread,
            title: attackSM.name,
        });

        // Add the situational modifier (from the attack dialog) to the
        // attack's mastery-level modifier.
        if (attackDlgResult.situationalModifier) {
            attackResult.masteryLevelModifier.add(
                VALUE_DELTA_INFO.PLAYER,
                attackDlgResult.situationalModifier,
            );
        }

        // If the missile is point-blank, add the flat bonus to the impact formula.
        if (impactRangeBonus) {
            attackResult.impact.add(
                "SOHL.INFO.Range",
                "Range",
                impactRangeBonus,
            );
        }

        // Pre-evaluate the attack result. We do this here because the attack
        // roll should be performed by the attacker, not the defender.
        // This will be placed into the `AttackResult` so that the defender can
        // use it to resolve the defense.
        await attackResult.evaluate();

        // Remember this mode so it defaults next time on this combatant.
        await this.recordAttackMode(attackSM);

        // Post the attack card to chat, unless suppressed by `context.noChat`.
        if (context.noChat) return;
        const cardData = buildAttackCardData({
            attackResult,
            title: `${attackSM?.name} ${attackSM?.isMelee ? "Melee" : "Missile"} Attack`,
            attackerName: this.tokenLogic.name ?? "",
            actorId: this.actor?.id ?? null,
            aimLabel: attackDlgResult.aim,
            target:
                context.target.actorLogic ?
                    {
                        name: context.target.name ?? "",
                        // The defense buttons dispatch to the defender's COMBATANT
                        // (its CombatantLogic hosts the resume actions).
                        actorUuid: context.target.actorLogic?.uuid ?? "",
                    }
                :   null,
        });
        await context.speaker.toChat(
            toFilePath("systems/sohl/templates/chat/attack-card.hbs"),
            cardData,
        );

        return cardData;
    }

    /**
     * Reassign this combatant to a {@link CombatantGroup} — GM-only. The picker
     * dialog and group creation/assignment are Foundry-document work, so this
     * executor delegates to {@link SohlCombatant.moveToGroup}.
     * @param _context - The action context (unused; the dialog gathers input).
     */
    async moveToGroup(_context: SohlActionContext): Promise<void> {
        await fvttPromptMoveCombatantToGroup(this.combatant);
    }

    // --- Automated combat resume (defender side) -----------------------------
    // The combatant *is* the defender, so `this` replaces the looked-up
    // combatant and `this.actorLogic` supplies strike-mode capability.

    /**
     * Resume automated combat with a **Block** — pick a blocking strike mode
     * (dialog, or from scope when `skipDialog`) and resolve the exchange.
     * @param context - Action context carrying the attack snapshot in its scope.
     * @returns The result of the combat exchange, or `undefined` if blocked or no valid block mode.
     */
    async automatedBlockResume(
        context: SohlActionContext<
            Partial<AutomatedCombat.DefenseContextScope>
        >,
    ): Promise<PlainObject | undefined> {
        if (!context.scope.attackResult || !this.actorLogic) return;

        const blockableStrikeModes = collectBlockableStrikeModes(
            this.actorLogic,
        );
        if (!blockableStrikeModes.length) {
            sohl.log.uiWarn(`${this.name} has no strike mode able to block.`);
            return;
        }
        const blockChoices: Record<string, string> = {};
        blockableStrikeModes.forEach((sm: MeleeStrikeMode, i) => {
            blockChoices[String(i)] = sm.name;
        });

        let defaultBlockModeIdx =
            this.lastBlockMode ?
                blockableStrikeModes.findIndex(
                    (sm) => sm === this.lastBlockMode,
                )
            :   -1;
        if (defaultBlockModeIdx < 0) {
            defaultBlockModeIdx = Math.max(
                0,
                indexOfBestMastery(
                    blockableStrikeModes,
                    (sm: MeleeStrikeMode) =>
                        sm.defense.block.constrainedEffective,
                ),
            );
        }

        let defenseDlgResult;
        if (context.skipDialog) {
            defenseDlgResult = {
                key: String(defaultBlockModeIdx),
                situationalModifier: 0,
            };
        } else {
            defenseDlgResult = await showDefenseDialog(
                `${this.name} — Select Block`,
                "Block with:",
                blockChoices,
                String(defaultBlockModeIdx),
            );
        }
        if (!defenseDlgResult) {
            sohl.log.uiInfo("Block canceled.");
            return;
        }

        const blockStrikeMode =
            blockableStrikeModes[Number(defenseDlgResult.key)];
        if (!blockStrikeMode) return;

        const defendResult = new DefendResult(
            {
                testType: TEST_TYPE.BLOCK.id,
                masteryLevelModifier: blockStrikeMode.defense.block.clone(
                    {},
                    { parent: this },
                ),
                situationalModifier: defenseDlgResult.situationalModifier,
                speaker: context.speaker,
                token: context.token ?? undefined,
            } as any,
            { parent: this },
        );

        // Build the combat result, taking into account the attacker's attack
        // result and the defender's block result.
        const combatResult = this.buildCombatResult(
            context.scope.attackResult,
            defendResult,
            context,
        );

        // Evaluate the combat result (both sides)
        await combatResult.evaluate();
        await this.recordBlockMode(blockStrikeMode);

        // If no chat is required, return early
        if (context.noChat) return combatResult;

        const { atkCardData } = buildCombatCardData(combatResult);
        await context.speaker.toChat(
            toFilePath("systems/sohl/templates/chat/attack-result-card.hbs"),
            atkCardData,
        );
        return atkCardData;
    }

    /**
     * Resume automated combat with a **Dodge** — roll the defender's Dodge skill.
     * @param context - Action context carrying the attack snapshot in its scope.
     * @returns The combat result, or undefined if canceled.
     */
    async automatedDodgeResume(
        context: SohlActionContext<
            Partial<AutomatedCombat.DefenseContextScope>
        >,
    ): Promise<PlainObject | undefined> {
        if (!context.scope.attackResult || !this.actorLogic) return;

        const dodgeML = resolveSkillMasteryLevel(
            this.actorLogic,
            SKILL_CODE.DODGE,
        );
        if (!dodgeML) {
            sohl.log.uiWarn(`${this.name} has no Dodge skill to defend with.`);
            return;
        }
        const defendResult = new DefendResult(
            {
                testType: TEST_TYPE.DODGE.id,
                masteryLevelModifier: dodgeML.clone({}, { parent: this }),
                situationalModifier: 0,
                speaker: context.speaker,
                token: context.token ?? undefined,
            } as any,
            { parent: this },
        );

        // Build the combat result, taking into account the attacker's
        // attack result and the defender's dodge result.
        const combatResult = this.buildCombatResult(
            context.scope.attackResult,
            defendResult,
            context,
        );

        // Evaluate the combat result (both sides)
        await combatResult.evaluate();

        // If no chat is required, return early
        if (context.noChat) return combatResult;

        const { atkCardData } = buildCombatCardData(combatResult);
        await context.speaker.toChat(
            toFilePath("systems/sohl/templates/chat/attack-result-card.hbs"),
            atkCardData,
        );
        return atkCardData;
    }

    /**
     * Resume automated combat with a **Counterstrike** — a melee attack back at
     * the original attacker; both sides can land in the same exchange.
     * @param context - Action context carrying the attacker's attack snapshot.
     * @returns The combat result, or undefined if canceled.
     */
    async automatedCounterstrikeResume(
        context: SohlActionContext<
            Partial<AutomatedCombat.DefenseContextScope>
        >,
    ): Promise<PlainObject | undefined> {
        if (!context.scope?.attackResult) {
            sohl.log.uiWarn(
                `${this.name} automated counterstrike requires an attack result in scope.`,
            );
            return;
        }
        const attackCombatantLogic = SohlCombatantLogic.fromTokenLogic(
            context.scope.attackResult?.speaker?.tokenLogic,
        );
        if (!context.target) {
            sohl.log.uiWarn(
                `${this.name} automated attack requires a target combatant.`,
            );
            return;
        }

        if (!this.actorLogic || !attackCombatantLogic) {
            sohl.log.uiWarn(
                "Counterstrike requires a valid attacker and defender combatant.",
            );
            return;
        }

        // The counterstrike targets the original attacker; distance is
        // defender (this combatant) → attacker.
        const distanceFeet =
            fvttRangeToTarget(
                this.tokenLogic,
                attackCombatantLogic.tokenLogic,
            ) ?? Infinity;

        // Perform the attack dialog and resolve the attack result.
        const attackDlgResult = await commonAttack(
            context,
            this,
            "Counterstrike",
            (sm: StrikeModeBase) => {
                // Only melee strike modes are valid for counterstrike.
                if (sm.isMelee) {
                    const meleeSM = sm as MeleeStrikeMode;
                    if (!meleeSM.defense?.counterstrike) return false;
                    return distanceFeet <= (meleeSM.reach?.effective ?? 0);
                }
                return false;
            },
            (strikeMode: StrikeModeBase) => {
                // Only melee strike modes are valid for counterstrike, and their
                // effective ML is the counterstrike ML.
                if (!strikeMode.isMelee) return -1;
                const meleeSM = strikeMode as MeleeStrikeMode;
                return meleeSM.defense.counterstrike.constrainedEffective;
            },
        );
        if (!attackDlgResult) return;

        const attackMode = StrikeModeBase.fromPointerData(attackDlgResult.mode);
        if (!attackMode) return;

        const meleeSM = attackMode as MeleeStrikeMode;

        const spread = meleeSM.spread.effective ?? 0;

        const counterResult = buildAttackResult({
            attackML: meleeSM.defense.counterstrike,
            impact: meleeSM.impact,
            parent: this,
            tokenLogic: context.token,
            testType: TEST_TYPE.AUTOCOMBATMELEE.id,
            aimBodyPartCode: attackDlgResult.aim,
            spread,
            title: meleeSM.fullLabel,
        });

        // Add the situational modifier (from the attack dialog) to the
        // attack's mastery-level modifier.
        if (attackDlgResult.situationalModifier) {
            counterResult.masteryLevelModifier.add(
                VALUE_DELTA_INFO.PLAYER,
                attackDlgResult.situationalModifier,
            );
        }

        // Build the counterstrike result, taking into account the
        // attacker's attack result and the defender's counterstrike result.
        const combatResult = this.buildCombatResult(
            context.scope.attackResult,
            counterResult,
            context,
        );

        // Evaluate the combat result (both sides)
        await combatResult.evaluate();
        await this.recordAttackMode(attackMode);

        // If no chat is required, return early
        if (context.noChat) return combatResult;

        /*
         * For a counterstrike, the combat result is split into two results:
         * one for the attacker, one for the defender. This is done so that
         * two chat cards can be posted, each displaying the results for one
         * side of the exchange.
         */

        // Post the attack result card to chat
        let { atkCardData, cxCardData } = buildCombatCardData(combatResult);
        await context.speaker.toChat(
            toFilePath("systems/sohl/templates/chat/attack-result-card.hbs"),
            atkCardData,
        );

        // Post the counterstrike result card to chat
        await context.speaker.toChat(
            toFilePath("systems/sohl/templates/chat/attack-result-card.hbs"),
            cxCardData,
        );
        return { atkCardData, cxCardData };
    }

    /**
     * Resume automated combat with **Ignore** — no defensive contest.
     * @param context - Action context carrying the attack snapshot in its scope.
     * @returns The combat result, or undefined if canceled.
     */
    async automatedIgnoreResume(
        context: SohlActionContext<
            Partial<AutomatedCombat.DefenseContextScope>
        >,
    ): Promise<PlainObject | undefined> {
        if (!context.scope?.attackResult) return;

        const defendResult = new DefendResult(
            {
                testType: TEST_TYPE.IGNORE.id,
                situationalModifier: 0,
                speaker: context.speaker,
                token: context.token ?? undefined,
            } as any,
            { parent: this },
        );
        const combatResult = this.buildCombatResult(
            context.scope?.attackResult,
            defendResult,
            context,
        );

        // Evaluate the combat result (both sides)
        await combatResult.evaluate();

        // If no chat is required, return early
        if (context.noChat) return combatResult;

        const { atkCardData } = buildCombatCardData(combatResult);
        await context.speaker.toChat(
            toFilePath("systems/sohl/templates/chat/attack-result-card.hbs"),
            atkCardData,
        );
        return atkCardData;
    }

    /**
     * Compose the `CombatResult` for a resolved exchange.
     * @param attackResult - The attacker's evaluated attack snapshot.
     * @param defendResult - The defender's response (defend result or counterstrike).
     * @param context - Action context supplying the speaker.
     * @returns The composed `CombatResult`.
     */
    private buildCombatResult(
        attackResult: AttackResult,
        defendResult: AttackResult | DefendResult,
        context: SohlActionContext<Partial<CombatResult.ContextScope>>,
    ): CombatResult {
        return new CombatResult(
            {
                attackResult,
                defendResult,
                speaker: context.speaker,
            } as any,
            { parent: this },
        );
    }

    /**
     * Post the combat-result card as the defender. Suppressed when
     * `context.noChat`.
     * @param combatResult - The resolved exchange to render.
     * @param attackResult - The attacker's attack snapshot for the card data.
     * @param defenseLabel - Human-readable label describing the defense used.
     * @param context - Action context supplying the speaker and chat flag.
     */
    private async postCombatResultCard(
        combatResult: CombatResult,
        attackResult: AttackResult,
        defenseLabel: string,
        context: SohlActionContext<Partial<CombatResult.ContextScope>>,
    ): Promise<void> {
        if (context.noChat) return;
        const cardData = buildCombatCardData(combatResult);
        await context.speaker.toChat(
            toFilePath("systems/sohl/templates/chat/attack-result-card.hbs"),
            cardData,
        );
    }

    /**
     * Define the combatant's intrinsic actions — the automated-combat defense
     * resumes, dispatched to this combatant from the attack card's defense
     * buttons.
     * @returns The combatant intrinsic-action definitions.
     */
    static override defineIntrinsicActions(): Partial<SohlAction.Data>[] {
        return [
            ...SohlLogic.defineIntrinsicActions(),
            {
                shortcode: "automatedCombatStart",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Being.ACTION.automatedCombatStart",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-crossed-swords",
                executor: "startAutomatedAttack",
                visible: "true",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
            },
            {
                shortcode: "moveToGroup",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Combatant.ACTION.moveToGroup",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-person-group",
                executor: "moveToGroup",
                visible: "isGM",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
            },
            {
                shortcode: "automatedBlockResume",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Being.Action.automatedBlockResume",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-shield-reflect",
                executor: "automatedBlockResume",
                visible: "false",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
            },
            {
                shortcode: "automatedCounterstrikeResume",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Being.Action.automatedCounterstrikeResume",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-riposte",
                executor: "automatedCounterstrikeResume",
                visible: "false",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
            },
            {
                shortcode: "automatedDodgeResume",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Being.Action.automatedDodgeResume",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-dodge",
                executor: "automatedDodgeResume",
                visible: "false",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
            },
            {
                shortcode: "automatedIgnoreResume",
                subType: ACTION_SUBTYPE.INTRINSIC,
                title: "SOHL.Being.Action.automatedIgnoreResume",
                scope: SOHL_ACTION_SCOPE.SELF,
                iconFAClass: "sohl-shrug",
                executor: "automatedIgnoreResume",
                visible: "false",
                group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
            },
        ];
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** Initialize-phase hook; base combatant logic does nothing. */
    override initialize(): void {}
    /** Evaluate-phase hook; base combatant logic does nothing. */
    override evaluate(): void {}
    /** Finalize-phase hook; base combatant logic does nothing. */
    override finalize(): void {}
}

export namespace AutomatedCombat {
    /**
     * The context scope of the current automated attack. If the attack strike mode
     * is not supplied, the attack dialog will prompt for it.
     */
    export interface AttackContextScope {
        /** The strike mode to attack with. */
        mode: StrikeModeBase.PointerData;
        /** The aim of the attack. */
        aim: string;
        /** The prior automated attack result that is being reassessed. */
        priorAttackResult: AttackResult;
    }

    /**
     * The context scope of the current automated defense. One of `attackResult` or
     * `priorCombatResult` must be supplied.
     */
    export interface DefenseContextScope {
        /** The result of the automated attack that initiated the automated defense. */
        attackResult?: AttackResult;
        /** The prior automated combat result that is being reassessed. */
        priorCombatResult?: CombatResult;
    }
}

/* --------------------------------------------------------------------------
 * Pure combatant predicates and helpers
 *
 * Side-effect-free, Foundry-free functions backing the combatant rules above.
 * Kept as module-level functions (rather than methods) so they are trivially
 * unit-testable with plain inputs.
 * ------------------------------------------------------------------------ */

/**
 * Pure relational predicate behind {@link SohlCombatantLogic.isEnemyOf}.
 *
 * Under the SoHL combat invariant, two combatants are enemies iff they belong
 * to different {@link CombatantGroup}s. A combatant is never its own enemy.
 * Absent grouping (a `null`/`undefined` group id on either side) is treated
 * defensively as enemy.
 *
 * @param thisGroupId - The group id of the subject combatant.
 * @param otherGroupId - The group id of the other combatant.
 * @param isSelf - True when both ids refer to the same combatant.
 * @returns True if the two combatants are enemies.
 */
export function areCombatantsEnemies(
    thisGroupId: string | null | undefined,
    otherGroupId: string | null | undefined,
    isSelf: boolean,
): boolean {
    if (isSelf) return false;
    if (thisGroupId && otherGroupId && thisGroupId === otherGroupId) {
        return false;
    }
    return true;
}

/**
 * Foundry status-effect ids that incapacitate a combatant enough that it no
 * longer threatens its enemies. Uses Foundry's canonical ids (note `stun`,
 * not `stunned`). `dead`/defeat is handled separately via the DEFEATED special
 * status effect (`combatant.isDefeated`).
 */
export const THREAT_NEGATING_STATUSES = [
    STATUS_EFFECT.UNCONSCIOUS,
    STATUS_EFFECT.SLEEP,
    STATUS_EFFECT.STUN,
    STATUS_EFFECT.RESTRAINED,
    STATUS_EFFECT.PARALYZED,
    STATUS_EFFECT.FROZEN,
] as const;

/**
 * Decide which medium a newly created combatant should display in the combat
 * tracker.
 *
 * Precedence: an explicit user-set medium > the actor's lineage default >
 * nothing (caller keeps the schema default).
 *
 * @param userSetMedium - An explicitly user-selected medium, if any.
 * @param lineageDefault - The actor's lineage default medium, if any.
 * @returns The medium to display, or `null` to keep the schema default.
 */
export function chooseInitialDisplayedMedium(
    userSetMedium: string | undefined | null,
    lineageDefault: string | undefined | null,
): string | null {
    if (userSetMedium) return userSetMedium;
    if (lineageDefault) return lineageDefault;
    return null;
}

/**
 * Orchestration glue for **automated combat** — the attacker's entry flow.
 *
 * This module is the Foundry-facing layer: it drives dialogs and posts the
 * attack chat card. The Foundry-free, unit-tested pieces it composes
 * (`buildAttackResult`, `buildAttackCardData`,
 * `classifyMissileRange`, …) live in `combat-actions.ts`.
 *
 * Every dialog here is **bypassable**: with `context.skipDialog` set, the same
 * inputs are read from `context.scope` instead.
 * Dialog callbacks are side-effect-free. `context.noChat` suppresses the chat
 * post. Together these let the whole flow run headlessly.
 *
 * Range gates the available modes: melee by reach, missile by base range.
 * **Volley** (a missile beyond base range) is an area attack with no aim and is
 * **not supported** — such modes never appear, and a wholly out-of-range target
 * short-circuits with a warning.
 */

/**
 * A combatant's active status-effect ids, treating Foundry's DEFEATED special
 * status as the `vanquished` status so the combat invariants can test it
 * uniformly alongside the actor's own statuses.
 * @param combatant - The combatant whose statuses to collect.
 * @returns The set of active status-effect ids.
 */
function combatantStatuses(combatant: SohlCombatant): Set<string> {
    const ids = new Set<string>(
        ((combatant.actor as any)?.statuses ?? []) as Iterable<string>,
    );
    if ((combatant as any).isDefeated) ids.add(STATUS_EFFECT.VANQUISHED);
    return ids;
}

// /**
//  * The resolved participants of an attack. Automated combat is between
//  * **combatants** — each carries its own token (`.token`) and actor (`.actor`),
//  * and the in-combat invariant is enforced by the type.
//  */
// interface AttackContext {
//     /** The attacking combatant. */
//     attacker: SohlCombatantLogic;
//     /** The target combatant. */
//     target: SohlCombatantLogic;
//     /** Center-to-center distance between their tokens, in feet. */
//     distanceFeet: number;
// }

// /**
//  * Resolve the attacker's token, the **target combatant** (and its token), and
//  * the center-to-center distance between them. Returns `null` (with a UI warning)
//  * when the attacker has no token, there is no active combat, or the target rule
//  * isn't met.
//  *
//  * Automated combat targets a *combatant*, not a token. The target is taken from
//  * `context.scope.targetCombatant` (a combatant id) when supplied; otherwise it
//  * is resolved from the client's targeted tokens — exactly one of which must be a
//  * combatant of the current combat (see {@link resolveTargetCombatant}).
//  * @param actor - The attacking actor.
//  * @param context - The action context (supplies the speaker token and scope).
//  * @returns The resolved attack context, or `null` when it cannot be formed.
//  */
// function resolveAttackContext(
//     actor: any,
//     context: SohlActionContext<any>,
// ): AttackContext | null {
//     const attackerToken = resolveAttackerToken(actor, context.token);
//     if (!attackerToken) return null;
//     const combat = getActiveCombat();
//     if (!combat) {
//         sohl.log.uiWarn("Automated combat requires an active combat.");
//         return null;
//     }
//     const attacker = combatantForToken(combat, attackerToken);
//     if (!attacker) {
//         sohl.log.uiWarn(
//             "The attacker is not a combatant in the current combat.",
//         );
//         return null;
//     }
//     // Invariant: the attacker must not be incapacitated/dead/defeated.
//     const attackerStatus = firstStatusIn(
//         combatantStatuses(attacker),
//         ATTACK_BLOCKING_STATUSES,
//     );
//     if (attackerStatus) {
//         sohl.log.uiWarn(
//             `${attackerToken.name ?? "The attacker"} cannot make an automated attack while ${attackerStatus}.`,
//         );
//         return null;
//     }

//     let target: SohlCombatant | null;
//     const scopeTarget = (context.scope as any)?.targetCombatant;
//     if (scopeTarget) {
//         // Programmatic / headless: an explicit combatant id wins.
//         target =
//             (combat.combatants.get?.(scopeTarget) as
//                 | SohlCombatant
//                 | undefined) ?? null;
//         if (!target) {
//             sohl.log.uiWarn(
//                 "The specified target combatant is not in the current combat.",
//             );
//             return null;
//         }
//     } else {
//         // Resolve from the client's targeted tokens, keeping only combatants.
//         const targeted = fvttGetTargetedTokens() ?? [];
//         try {
//             target = resolveTargetCombatant(targeted, (t) =>
//                 combatantForToken(combat, t),
//             );
//         } catch (err) {
//             sohl.log.uiWarn((err as Error).message);
//             return null;
//         }
//     }

//     const targetToken = target.token as SohlTokenDocument | null;
//     if (!targetToken) {
//         sohl.log.uiWarn("The target combatant has no token on the canvas.");
//         return null;
//     }
//     // Invariant: a dead defender cannot be the target of an automated attack.
//     if (firstStatusIn(combatantStatuses(target), [STATUS_EFFECT.DEAD])) {
//         sohl.log.uiWarn(
//             `${targetToken.name ?? "The target"} is dead and cannot be attacked.`,
//         );
//         return null;
//     }
//     const distanceFeet =
//         fvttRangeToTarget(attackerToken, targetToken) ?? Infinity;
//     return { attacker, target, distanceFeet };
// }

/**
 * Build the Aim select options (a `{ shortcode: label }` map) from the
 * defender's body parts. Empty when the defender has no lineage / body structure.
 * @param defenderActor - The actor being aimed at.
 * @returns A map of body-part shortcode to display label.
 */
export function buildAimChoices(defenderActor: any): Record<string, string> {
    const lineageLogic = defenderActor?.itemTypes?.[ITEM_KIND.LINEAGE]?.[0]
        ?.logic as any;
    const parts: any[] = lineageLogic?.bodyStructure?.parts ?? [];
    const choices: Record<string, string> = {};
    for (const part of parts) {
        choices[part.shortcode] = part.locations?.[0]?.name ?? part.shortcode;
    }
    return choices;
}

/**
 * The default mode index for a picker: the most-recently-used mode if it is
 * still available, otherwise the best-chance mode (highest effective ML).
 * @param modes - The available attackable strike modes.
 * @param recent - The most-recently-used mode reference, or `null`.
 * @returns The index of the default mode in `modes`.
 */
function defaultModeIndex(
    modes: StrikeModeBase.PointerData[],
    recent: { itemUuid: string; smId: string } | null,
): number {
    if (recent) {
        const idx = modes.findIndex(
            (m) => m.itemUuid === recent.itemUuid && m.smId === recent.smId,
        );
        if (idx >= 0) return idx;
    }
    return Math.max(
        0,
        indexOfBestMastery(
            modes.map((m) => StrikeModeBase.fromPointerData(m)),
            (m) => (m ? m.attack.constrainedEffective : -Infinity),
        ),
    );
}

/**
 * Index of the entry with the highest effective mastery level (the "best
 * chance" default), or -1 for an empty list. Pure.
 * @param entries - The candidate entries to compare.
 * @param ml - Extracts the effective mastery level from an entry.
 * @returns The index of the highest-mastery entry, or -1 if `entries` is empty.
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
 * @param actorLogic - The actor's logic; its weapons and combat techniques are scanned via logicTypes.
 * @param distanceFeet - The distance to the target, in feet.
 * @returns The strike modes able to reach the target at `distanceFeet`.
 */
export function collectAttackableStrikeModes(
    actorLogic: SohlActorLogic<any>,
    distanceFeet: number,
): StrikeModeBase[] {
    const out: StrikeModeBase[] = [];
    const consider = (
        logic: { id: string; name: string; uuid?: string },
        sm: any,
    ) => {
        if (!sm || sm.attack?.disabled) return;
        const inRange =
            sm.isMissile ?
                distanceFeet <= (sm.baseRange?.effective ?? 0)
            :   distanceFeet <= (sm.reach?.effective ?? 0);
        if (!inRange) return;
        out.push(sm);
    };
    const lt = actorLogic.logicTypes;
    for (const logic of lt[ITEM_KIND.WEAPONGEAR]) {
        for (const sm of logic.strikeModes ?? []) consider(logic, sm);
    }
    for (const logic of lt[ITEM_KIND.COMBATTECHNIQUE]) {
        consider(logic, logic.strikeMode);
    }
    return out;
}

/**
 * Orchestrate an automated attack from `attackerLogic` to `context.target`, showing the attack dialog (unless `context.skipDialog`) and posting the attack result card (unless `context.noChat`).
 * @param context - The action context carrying the attack snapshot in its scope.
 * @param attackerLogic - The attacking combatant's logic.
 * @param defaultStrikeMode - The default strike mode to preselect in the dialog.
 * @param form - The form of attack (i.e., "Attack" or "Counterstrike")
 * @param validStrikeMode - A function to determine if a strike mode is valid for the attack.
 * @param strikeModeML - A function to determine the mastery level of a strike mode.
 * @returns The chosen attack dialog result, or `null` if the dialog was dismissed or the attack was canceled.
 */
async function commonAttack(
    context: SohlActionContext<any>,
    attackerLogic: SohlCombatantLogic,
    form: string,
    validStrikeMode: (strikeMode: StrikeModeBase) => boolean,
    strikeModeML: (strikeMode: StrikeModeBase) => number,
): Promise<AttackDialogResult | undefined> {
    if (!isA(attackerLogic?.actorLogic, ACTOR_KIND.BEING)) {
        sohl.log.uiWarn(`${form} requires a valid attacker combatant.`);
        return;
    }

    const targetCombatantLogic = SohlCombatantLogic.fromTokenLogic(
        context.scope.attackResult?.speaker?.tokenLogic,
    );

    if (!targetCombatantLogic) {
        sohl.log.uiWarn(`${form} requires a valid defender combatant.`);
        return;
    }

    const availStrikeModes: StrikeModeBase[] = Array.from(
        (attackerLogic.actorLogic as BeingLogic)
            .getUsableStrikeModes()
            .filter(validStrikeMode),
    );
    if (availStrikeModes.length === 0) {
        sohl.log.uiWarn(
            `${attackerLogic.name} has no usable strike mode to ${form} with.`,
        );
        return;
    }

    // Determine the default strike mode index: the prior attack result's mode if
    // it is available, otherwise the most-recently-used mode, and if
    // neither is available, the best-chance mode (highest effective ML).
    let defaultStrikeModeIdx: number = availStrikeModes.findIndex(
        (sm) => !sm.compareTo(context.scope.priorAttackResult?.mode),
    );
    if (defaultStrikeModeIdx < 0 && attackerLogic.lastAttackMode) {
        defaultStrikeModeIdx = availStrikeModes.findIndex(
            (sm) => !sm.compareTo(attackerLogic.lastAttackMode!),
        );
    }
    if (defaultStrikeModeIdx < 0) {
        defaultStrikeModeIdx = indexOfBestMastery(
            availStrikeModes,
            strikeModeML,
        );
    }

    // Determine all of the available aim choices for this attack, and the
    // default aim choice: the prior attack result's aim if it is available,
    // otherwise the first available aim choice.
    const aimChoices = buildAimChoices(targetCombatantLogic.actorLogic);
    let defaultAim: string | undefined =
        context.scope.priorAttackResult?.aimBodyPartCode ||
        Object.keys(aimChoices).at(0);
    if (!defaultAim) {
        sohl.log.uiWarn(`${targetCombatantLogic.name} has no aim choices.`);
        return;
    }

    let attackDlgResult: AttackDialogResult | null;
    if (context.skipDialog) {
        // Skip the dialog and use the defaults (or first available) for aim and mode.
        attackDlgResult = {
            aim: String(defaultAim),
            situationalModifier: 0,
            mode: availStrikeModes[defaultStrikeModeIdx].pointerData,
            spread: 0,
        } as AttackDialogResult;
    } else {
        // Show the attack dialog to the user, allowing them to select aim and mode.
        attackDlgResult = await showAttackDialog(
            `${attackerLogic.name} vs. ${targetCombatantLogic.name} ${form} with ${availStrikeModes[defaultStrikeModeIdx].name}`,
            aimChoices,
            defaultAim,
            Object.fromEntries(availStrikeModes.map((mode) => [mode.id, mode])),
            defaultStrikeModeIdx,
        );
    }
    if (!attackDlgResult) {
        sohl.log.uiInfo(`${form} canceled.`);
        return;
    }

    return attackDlgResult;
}

/**
 * Build the render context for `attack-result-card.hbs` from a resolved
 * {@link CombatResult}. Pure and Foundry-free.
 *
 * Shows the exchange in two columns (Attack | Defend); for **Ignore** the
 * defender did not contest, so its column is dashed. Each side that lands a
 * blow gets a "Calculate <Token> Injury" button wired to the `createInjury`
 * action (assisted). Counterstrike can land both sides at once.
 * @param combatResult The resolved combat exchange.
 * @returns The render context for `attack-result-card.hbs`.
 */
export function buildCombatCardData(combatResult: CombatResult): {
    atkCardData: Record<string, unknown>;
    cxCardData: Record<string, unknown> | undefined;
} {
    if (!combatResult.attackResult)
        throw new Error("Attack result is missing.");
    if (!combatResult.defendResult)
        throw new Error("Defend result is missing.");
    let atkResult: AttackResult = combatResult.attackResult;
    let defResult: DefendResult = combatResult.defendResult as DefendResult;

    // True means the defender contested (Block or Dodge); false means they ignored.
    let defenderContested =
        defResult.testType === TEST_TYPE.BLOCK.id ||
        defResult.testType === TEST_TYPE.DODGE.id;

    let defInjury =
        combatResult.attackerImpact && defResult.token ?
            injuryButton(combatResult.attackerImpact, defResult.token.uuid)
        :   null;

    let atkInjury =
        combatResult.cxImpact && atkResult.token ?
            injuryButton(combatResult.cxImpact, atkResult.token.uuid)
        :   null;

    let atkWeapon =
        atkResult ?
            StrikeModeBase.fromPointerData(atkResult.mode)?.parent
        :   undefined;

    let cxCardData: Record<string, unknown> | undefined;
    const atkCardData: Record<string, unknown> = {
        actorId: atkResult.combatant.actorLogic!.id,
        title: atkResult.label,
        attacker: atkResult.combatant.name,
        defender: defResult.combatant.name,
        attackWeapon: atkWeapon?.name ?? "",
        defense: defResult?.label,
        effAML: atkResult.masteryLevelModifier?.constrainedEffective ?? 0,
        effDML:
            defenderContested ?
                (defResult.masteryLevelModifier?.constrainedEffective ?? 0)
            :   "",
        attackRoll: atkResult.roll?.total ?? 0,
        defenseRoll: defenderContested ? (defResult.roll?.total ?? 0) : "",
        atkRollResult: successLevelText(atkResult.successLevel),
        atkIsSuccess: atkResult.isSuccess,
        atkIsCritical: atkResult.isCritical,
        defRollResult:
            defenderContested ? successLevelText(defResult.successLevel) : "",
        defIsSuccess: defenderContested ? defResult.isSuccess : false,
        defIsCritical: defenderContested ? defResult.isCritical : false,
        resultDesc:
            combatResult.attackerLandsBlow ?
                `${atkResult.combatant.name} strikes!`
            :   "Attack misses.",
        hasAttackHit: combatResult.attackerLandsBlow,
        impactFormula:
            combatResult.attackerLandsBlow ?
                (atkResult.impact?.label ?? "")
            :   "",
        numAtkTA:
            combatResult.tacticalAdvantages.side === "attacker" ?
                combatResult.tacticalAdvantages.count
            :   0,
        numDefTA:
            combatResult.tacticalAdvantages.side === "defender" ?
                combatResult.tacticalAdvantages.count
            :   0,
        atkWeaponBroke: combatResult.weaponBreakCheck === "attacker",
        defWeaponBroke: combatResult.weaponBreakCheck === "defender",
        isAtkFumbleTest:
            atkResult.mishaps?.has(ATTACK_MISHAP.FUMBLE_TEST) ?? false,
        isAtkStumbleTest:
            atkResult.mishaps?.has(ATTACK_MISHAP.STUMBLE_TEST) ?? false,
        isDefFumbleTest:
            defenderContested ?
                (defResult?.mishaps?.has(DEFEND_MISHAP.FUMBLE_TEST) ?? false)
            :   false,
        isDefStumbleTest:
            defenderContested ?
                (defResult?.mishaps?.has(DEFEND_MISHAP.STUMBLE_TEST) ?? false)
            :   false,
        // Injury buttons (createInjury, assisted) — one per landing side.
        hasAttackInjury: !!atkInjury,
        attackInjuryHandlerUuid: atkInjury?.handlerUuid ?? "",
        attackInjuryTargetName: atkInjury?.targetName ?? "",
        attackInjuryScope: atkInjury?.scopeData ?? {},
        hasDefendInjury: !!defInjury,
        defendInjuryHandlerUuid: defInjury?.handlerUuid ?? "",
        defendInjuryTargetName: defInjury?.targetName ?? "",
        defendInjuryScope: defInjury?.scopeData ?? {},
    };

    if (combatResult.defendResult.testType === TEST_TYPE.COUNTERSTRIKE.id) {
        atkResult = combatResult.defendResult as AttackResult;
        defInjury =
            combatResult.attackerImpact && defResult.token ?
                injuryButton(combatResult.attackerImpact, defResult.token.uuid)
            :   null;
        // On the CX card the original attacker is the "defender", so their
        // injury comes from cxImpact (the CX blow landing on them).
        atkInjury =
            combatResult.cxImpact && combatResult.attackResult.token ?
                injuryButton(
                    combatResult.cxImpact,
                    combatResult.attackResult.token.uuid,
                )
            :   null;

        atkWeapon =
            atkResult ?
                StrikeModeBase.fromPointerData(atkResult.mode)?.parent
            :   undefined;

        cxCardData = {
            actorId: atkResult.combatant.actorLogic!.id,
            title: atkResult.label,
            attacker: atkResult.combatant.name,
            defender: combatResult.attackResult.combatant.name,
            attackWeapon: atkWeapon?.name ?? "",
            defense: SYMBOL.EMDASH,
            effAML: atkResult.masteryLevelModifier?.constrainedEffective ?? 0,
            effDML: "",
            attackRoll: atkResult.roll?.total ?? 0,
            defenseRoll: "",
            atkRollResult: successLevelText(atkResult.successLevel),
            atkIsSuccess: atkResult.isSuccess,
            atkIsCritical: atkResult.isCritical,
            defRollResult: "",
            defIsSuccess: false,
            defIsCritical: false,
            resultDesc:
                combatResult.defenderLandsBlow ?
                    `${atkResult.combatant.name} strikes!`
                :   "Attack misses.",
            hasAttackHit: combatResult.defenderLandsBlow,
            impactFormula:
                combatResult.defenderLandsBlow ?
                    (atkResult.impact?.label ?? "")
                :   "",
            numAtkTA:
                combatResult.tacticalAdvantages.side === "defender" ?
                    combatResult.tacticalAdvantages.count
                :   0,
            numDefTA: 0,
            atkWeaponBroke: combatResult.weaponBreakCheck === "defender",
            defWeaponBroke: false,
            isAtkFumbleTest:
                atkResult.mishaps?.has(ATTACK_MISHAP.FUMBLE_TEST) ?? false,
            isAtkStumbleTest:
                atkResult.mishaps?.has(ATTACK_MISHAP.STUMBLE_TEST) ?? false,
            isDefFumbleTest: false,
            isDefStumbleTest: false,
            // Injury buttons (createInjury, assisted) — one per landing side.
            hasAttackInjury: !!atkInjury,
            attackInjuryHandlerUuid: atkInjury?.handlerUuid ?? "",
            attackInjuryTargetName: atkInjury?.targetName ?? "",
            attackInjuryScope: atkInjury?.scopeData ?? {},
            hasDefendInjury: !!defInjury,
            defendInjuryHandlerUuid: defInjury?.handlerUuid ?? "",
            defendInjuryTargetName: defInjury?.targetName ?? "",
            defendInjuryScope: defInjury?.scopeData ?? {},
        };
    }
    return { atkCardData, cxCardData };
}

/**
 * Resolve the {@link MasteryLevelModifier} of an actor's **skill** identified by
 * its (static, non-localized) `system.shortcode` — e.g. `"dge"` for Dodge.
 *
 * Pure and Foundry-free. Used by the defender's automated-combat resumes (Dodge,
 * …) to roll against the right skill. Returns `null` when the actor has no skill
 * with that shortcode.
 *
 * @param actorLogic The actor's logic, whose skill is resolved via `getItemLogic`.
 * @param shortcode The skill's `system.shortcode` (e.g. `"dge"`).
 * @returns The skill's mastery-level modifier, or `null` if no skill matches.
 */
export function resolveSkillMasteryLevel(
    actorLogic: SohlActorLogic<any>,
    shortcode: string,
): MasteryLevelModifier | null {
    const skill = actorLogic.getItemLogic(shortcode, ITEM_KIND.SKILL);
    return ((skill as any)?.masteryLevel as MasteryLevelModifier) ?? null;
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
 * @param distanceFeet - The distance to the target, in feet.
 * @param baseRangeFeet - The strike mode's base range, in feet.
 * @returns The range band (direct/point-blank flags, spread, impact bonus).
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
 * A fresh, rolled d100.
 * @param parent - The Logic that owns the resulting roll.
 * @returns A new {@link SimpleRoll} that has already been rolled.
 */
function rollAttackDie(parent: SohlLogic): SimpleRoll {
    const roll = new SimpleRoll(
        {
            numDice: 1,
            dieFaces: 100,
            modifier: 0,
            rolls: [],
        },
        { parent },
    );
    roll.roll();
    return roll;
}

/** Inputs for {@link buildAttackResult}. */
export interface BuildAttackInput {
    /** The strike mode's attack mastery-level modifier */
    attackML: MasteryLevelModifier;
    /** The strike mode's impact modifier. */
    impact: ImpactModifier;
    /** Logic that owns the resulting AttackResult and its cloned modifiers (the attacker). */
    parent: SohlLogic;
    /** The attacker's token, recorded on the result. */
    tokenLogic?: SohlTokenDocumentLogic;
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
 * @param input - The resolved attack/impact modifiers and result metadata.
 * @returns A new, unevaluated {@link AttackResult}.
 */
export function buildAttackResult(input: BuildAttackInput): AttackResult {
    // Clone so the result is independent of (and serializable without) the live
    // strike mode. `clone()` round-trips through the kind registry, faithfully
    // reviving nested ValueDeltas and rebuilding the concrete subclass.
    const masteryLevelModifier = input.attackML.clone(
        {},
        { parent: input.parent },
    );
    const impact = input.impact.clone({}, { parent: input.parent });
    return new AttackResult(
        {
            roll: input.roll ?? rollAttackDie(input.parent),
            masteryLevelModifier,
            impact,
            tokenUuid: input.tokenLogic ?? undefined,
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
 * @param targeted - The client's currently targeted tokens.
 * @param toCombatant - Maps a token to its combatant, or `null` if it is not one.
 * @returns The single targeted combatant.
 * @throws If zero or more than one targeted token maps to a combatant.
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
    /** Additional notes for the damage card. */
    notes: string;
    /** Impact dice formula with aspect suffix, e.g. "2d6+3e". */
    impactLabel: string;
    /** Human-readable roll breakdown, e.g. "[3, 5] + 3". */
    rollResult: string;
    /** Total impact delivered. */
    impact: number;
    /** Damage aspect of the blow. */
    aspect: ImpactAspect;
    /** Whether the damage card has a target. */
    hasTarget: boolean;
    /** The targeted defender's name, or an empty string if nothing is targeted. */
    targetName: string;
    /** The UUID of the handler for the defense buttons. */
    handlerUuid: string;
    /** The attacker actor's UUID (source of the blow). */
    sourceActorUuid: string;
    /** The createInjury button's `scope` payload (a plain injury request). */
    scopeData: PlainObject;
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
 * its curated {@link AttackResult.toJSON}, driven by {@link defaultToJSON}); the
 * template serializes it with the registered `toJSON` Handlebars helper into
 * `data-attack-result-json`, and the defense resume rehydrates it with
 * `instanceFromJSON`. The aim travels with the result
 * (`AttackResult.aimBodyPartCode`). All four defense buttons are emitted;
 * per-defender capability gating (Block/Counterstrike) happens later, at
 * chat-card render time.
 * @param input - The evaluated attack result and attacker/target metadata.
 * @returns The render context for `attack-card.hbs`.
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
        // The defense buttons' `scope` payload: the evaluated attack, serialized
        // as one `data-scope` blob and revived as a live `AttackResult` (which
        // the resume flows read as `context.scope.attackResult`).
        scopeData: defaultToJSON({ attackResult: ar }),
    };
}

/**
 * Map a numeric success level to its display text.
 * @param sl - The numeric success level.
 * @returns The display text (e.g. "Critical Success", "Marginal Failure").
 */
function successLevelText(sl: number): string {
    if (sl <= CRITICAL_FAILURE) return "Critical Failure";
    if (sl === MARGINAL_FAILURE) return "Marginal Failure";
    if (sl === MARGINAL_SUCCESS) return "Marginal Success";
    return "Critical Success";
}

/**
 * Gather every strike mode the actor can **block** with — across weapons and
 * combat techniques — i.e. melee modes whose `defense.block` is present and not
 * disabled (not `noBlock`). Pure and Foundry-free; used to populate the Block
 * dialog and to resolve the chosen mode's block modifier.
 * @param actorLogic - The actor's logic; its weapons and combat techniques are scanned via logicTypes.
 * @returns The block-capable strike modes with their live block modifiers.
 */
export function collectBlockableStrikeModes(
    actorLogic: SohlActorLogic<any>,
): MeleeStrikeMode[] {
    const result = actorLogic.allLogics.reduce(
        (acc: MeleeStrikeMode[], logic) => {
            if (
                isA(logic, ITEM_KIND.WEAPONGEAR) ||
                isA(logic, ITEM_KIND.COMBATTECHNIQUE)
            ) {
                const combatLogic = logic as
                    | WeaponGearLogic
                    | CombatTechniqueLogic;
                const meleeStrikeModes = combatLogic.strikeModes.filter(
                    (sm) =>
                        sm.isMelee &&
                        !(sm as MeleeStrikeMode).defense.block.disabled,
                ) as MeleeStrikeMode[];
                meleeStrikeModes.forEach((sm: MeleeStrikeMode) => acc.push(sm));
            }
            return acc;
        },
        [] as MeleeStrikeMode[],
    );
    return result;
}

/**
 * Build the assisted-injury button payload for a landing side, or `null` when
 * the side did not land (no `ImpactResult`) or has no target. Mirrors
 * {@link buildDamageCardData}: the `createInjury` handler opens the Add Injury
 * dialog from `{ impact, aspect }` (no aim forwarded yet → assisted, not
 * automated).
 * @param impactResult - The landing side's impact result, or `undefined` if it missed.
 * @param targetCombatantUuid - The struck combatant's injury-button data, or `null`.
 * @returns The injury-button payload, or `null` if the side did not land or has
 *          no target.
 */
function injuryButton(
    impactResult: ImpactResult,
    targetCombatantUuid: string,
): { handlerUuid: string; targetName: string; scopeData: PlainObject } | null {
    if (!impactResult || !targetCombatantUuid) return null;
    // When the blow was aimed, forward `targetPart` + `spread` so the
    // `createInjury` handler resolves the hit location automatically; otherwise
    // omit them and the handler opens the assisted Add Injury dialog.
    const aim =
        impactResult.aimBodyPartCode ?
            {
                targetPart: impactResult.aimBodyPartCode,
                spread: impactResult.spread,
            }
        :   {};
    const targetCombatantLogic = fvttLogicFromUuidSync(
        targetCombatantUuid,
    ) as SohlCombatantLogic;
    return {
        handlerUuid: targetCombatantLogic?.actor?.uuid ?? "",
        targetName: targetCombatantLogic.name,
        // The createInjury button's `scope` payload: a plain injury request the
        // `onCreateInjury` handler reads from `data-scope`.
        scopeData: defaultToJSON({
            impact: impactResult.total,
            aspect: impactResult.aspect,
            ...aim,
        }) as PlainObject,
    };
}
