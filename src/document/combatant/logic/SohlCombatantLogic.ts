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

import { toHTMLString } from "@src/utils/helpers";
import { ITEM_KIND } from "@src/utils/constants";
import type { SohlActionContext } from "@src/core/SohlActionContext";
import type { AttackResult } from "@src/domain/result/AttackResult";
import type { MasteryLevelModifier } from "@src/domain/modifier/MasteryLevelModifier";
import type { BeingLogic } from "@src/document/actor/logic/BeingLogic";
import type {
    SohlCombatant,
    StrikeModeRef,
} from "@src/document/combatant/foundry/SohlCombatant";
import type { SohlTokenDocument } from "@src/document/token/foundry/SohlTokenDocument";
import { SohlLogic, SohlLogicData } from "@src/core/SohlLogic";
import {
    combatantGridDistance,
    combatantSpacesMoved,
    fvttCombatantLogics,
    fvttPromptMoveCombatantToGroup,
    getActiveCombat,
} from "@src/core/FoundryHelpers";
import { CombatResult } from "@src/domain/result/CombatResult";
import { DefendResult } from "@src/domain/result/DefendResult";
import {
    collectBlockableStrikeModes,
    collectAttackableStrikeModes,
    resolveSkillMasteryLevel,
    indexOfBestMastery,
    buildAttackResult,
    buildCombatCardData,
} from "@src/document/actor/logic/combat-actions";
import { resolveActionInput } from "@src/utils/actionInput";
import { instanceFromJSON, toFilePath } from "@src/utils/helpers";
import {
    ACTION_SUBTYPE,
    SKILL_CODE,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
    STATUS_EFFECT,
    TEST_TYPE,
    VALUE_DELTA_INFO,
    type MovementMedium,
} from "@src/utils/constants";
import { SohlAction } from "@src/domain/action/SohlAction";
import { SohlTokenDocumentLogic } from "@src/document/token/logic/SohlTokenDocumentLogic";
import { SohlActorLogic } from "@src/document/actor/logic/SohlActorBaseLogic";
import {
    inputDialog,
    fvttGetTargetedTokens,
    fvttRangeToTarget,
    type DialogButtonCallback,
} from "@src/core/FoundryHelpers";
import {
    buildAttackCardData,
    resolveTargetCombatant,
    classifyMissileRange,
    firstStatusIn,
    ATTACK_BLOCKING_STATUSES,
    type AttackableStrikeMode,
} from "@src/document/actor/logic/combat-actions";

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
    lastAttackMode: StrikeModeRef | null;
    /** Strike mode last used to block (`{ itemId, smId }`), or `null`. */
    lastBlockMode: StrikeModeRef | null;

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
        actorLogic: SohlActorLogic<any>,
    ): Optional<SohlCombatantLogic> {
        return getActiveCombat()?.combatants?.find(
            (c) => c.actor.id === actorLogic.data.id,
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
        tokenLogic: SohlTokenDocumentLogic,
    ): Optional<SohlCombatantLogic> {
        return getActiveCombat()?.combatants?.find(
            (c) => c.token.id === tokenLogic.id,
        )?.logic;
    }

    /** The strike mode last used to attack, or `null` (combat-scoped). */
    get lastAttackMode(): StrikeModeRef | null {
        return this.data.lastAttackMode;
    }

    /** The strike mode last used to block, or `null` (combat-scoped). */
    get lastBlockMode(): StrikeModeRef | null {
        return this.data.lastBlockMode;
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
     * @param itemId - The id of the item owning the strike mode.
     * @param smId - The strike mode id.
     */
    async recordAttackMode(itemId: string, smId: string): Promise<void> {
        await this.data.update({
            "system.lastAttackMode": { itemId, smId },
        });
    }

    /**
     * Remember the strike mode just used to block (persisted on the combatant).
     * @param itemId - The id of the item owning the strike mode.
     * @param smId - The strike mode id.
     */
    async recordBlockMode(itemId: string, smId: string): Promise<void> {
        await this.data.update({
            "system.lastBlockMode": { itemId, smId },
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
        return distance !== null && distance <= this.reach;
    }

    /** The number of grid spaces moved since the start of this turn. */
    get spacesMovedThisTurn(): number {
        const c = this.combatant;
        return c ? combatantSpacesMoved(c, this.data.startLocation) : 0;
    }

    /* --------------------------------------------- */
    /* Intrinsic Actions                             */
    /* --------------------------------------------- */

    // --- Automated combat start (attacker side) ------------------------------

    /**
     * Begin an automated attack — the **single entry point** for combat start.
     * The combatant *is* the attacker (`this`), so the attacker token/combatant
     * and its strike-mode capability come from `this`/`this.actorLogic`.
     *
     * Branches on the action scope:
     * - **item-logic-scoped** — `scope.logicUuid` names the source weapon /
     *   combat-technique logic (with an optional `scope.smId` strike mode); only
     *   that item's in-range modes are offered. Used when the
     *   {@link WeaponGearLogic}/{@link CombatTechniqueLogic} `automatedCombatStart`
     *   actions delegate into the combatant.
     * - **combatant-scoped** — no `logicUuid`; every in-range mode across the
     *   combatant's weapons and combat techniques is offered.
     *
     * @param context - Action context (supplies the target, scope, and chat options).
     * @param context.scope
     * @param context.scope.logicUuid ItemLogic to use
     */
    async automatedCombatStart(context: SohlActionContext<any>): Promise<void> {
        const logicUuid: string | undefined = (context.scope as any)?.logicUuid;
        if (logicUuid) {
            const itemLogic = (this.actorLogic as BeingLogic).allLogics.find(
                (l) => l.uuid === logicUuid,
            );
            if (!itemLogic) {
                sohl.log.uiWarn(
                    `${this.name} has no item matching the requested attack.`,
                );
                return;
            }
            await startAutomatedAttack(this, context);
            return;
        }

        await startAutomatedAttack(this, context);
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
     */
    async automatedBlockResume(
        context: SohlActionContext<Partial<CombatResult.ContextScope>>,
    ): Promise<void> {
        const attackResult = this.rehydrateAttackResult(context);
        if (!attackResult) return;
        const actorLogic = this.actorLogic;
        if (!actorLogic) return;

        const entries = collectBlockableStrikeModes(actorLogic);
        if (!entries.length) {
            sohl.log.uiWarn(`${this.name} has no strike mode able to block.`);
            return;
        }
        const choices: Record<string, string> = {};
        entries.forEach((e, i) => {
            choices[String(i)] = e.label;
        });

        const recent = this.lastBlockMode;
        let defaultIdx =
            recent ?
                entries.findIndex(
                    (e) => e.itemId === recent.itemId && e.smId === recent.smId,
                )
            :   -1;
        if (defaultIdx < 0) {
            defaultIdx = Math.max(
                0,
                indexOfBestMastery(entries, (e) => e.ml.constrainedEffective),
            );
        }

        const input = await resolveActionInput<{
            key: string;
            situationalModifier: number;
        }>(context, {
            fromScope: (s) => {
                const idx = entries.findIndex(
                    (e) => e.itemId === s.itemId && e.smId === s.strikeModeId,
                );
                return {
                    key: idx >= 0 ? String(idx) : String(defaultIdx),
                    situationalModifier:
                        Number.parseInt(String(s.situationalModifier), 10) || 0,
                };
            },
            dialog: () =>
                showDefenseDialog(
                    `${this.name} — Select Block`,
                    "Block with:",
                    choices,
                    String(defaultIdx),
                ),
        });
        if (!input) return;
        const entry = entries[Number(input.key)];
        if (!entry) return;

        const defendResult = new DefendResult(
            {
                testType: TEST_TYPE.BLOCK.id,
                masteryLevelModifier: entry.ml.clone<MasteryLevelModifier>(
                    {},
                    { parent: this },
                ),
                situationalModifier: input.situationalModifier,
                speaker: context.speaker,
                token: context.token ?? undefined,
            } as any,
            { parent: this },
        );
        const combatResult = this.buildCombatResult(
            attackResult,
            defendResult,
            context,
        );
        await combatResult.evaluate();
        await this.recordBlockMode(entry.itemId, entry.smId);
        await this.postCombatResultCard(
            combatResult,
            attackResult,
            `Block w/ ${entry.itemName}`,
            context,
        );
    }

    /**
     * Resume automated combat with a **Dodge** — roll the defender's Dodge skill.
     * @param context - Action context carrying the attack snapshot in its scope.
     */
    async automatedDodgeResume(
        context: SohlActionContext<Partial<CombatResult.ContextScope>>,
    ): Promise<void> {
        const attackResult = this.rehydrateAttackResult(context);
        if (!attackResult) return;
        const actorLogic = this.actorLogic;
        if (!actorLogic) return;

        const dodgeML = resolveSkillMasteryLevel(actorLogic, SKILL_CODE.DODGE);
        if (!dodgeML) {
            sohl.log.uiWarn(`${this.name} has no Dodge skill to defend with.`);
            return;
        }
        const defendResult = new DefendResult(
            {
                testType: TEST_TYPE.DODGE.id,
                masteryLevelModifier: dodgeML.clone<MasteryLevelModifier>(
                    {},
                    { parent: this },
                ),
                situationalModifier: 0,
                speaker: context.speaker,
                token: context.token ?? undefined,
            } as any,
            { parent: this },
        );
        const combatResult = this.buildCombatResult(
            attackResult,
            defendResult,
            context,
        );
        await combatResult.evaluate();
        await this.postCombatResultCard(
            combatResult,
            attackResult,
            "Dodge",
            context,
        );
    }

    /**
     * Resume automated combat with a **Counterstrike** — a melee attack back at
     * the original attacker; both sides can land in the same exchange.
     * @param context - Action context carrying the attacker's attack snapshot.
     */
    async automatedCounterstrikeResume(
        context: SohlActionContext<Partial<CombatResult.ContextScope>>,
    ): Promise<void> {
        const attackResult = this.rehydrateAttackResult(context);
        if (!attackResult) return;
        const actorLogic = this.actorLogic;
        if (!actorLogic) return;

        // The counterstrike targets the original attacker; distance is
        // defender (this combatant) → attacker.
        const rc = resolveCounterstrikeContext(attackResult, this.combatant);
        if (!rc) return;

        const entries = collectAttackableStrikeModes(
            actorLogic,
            rc.distanceFeet,
        ).filter(
            (e) =>
                (e.strikeMode as any).isMelee &&
                !(e.strikeMode as any).defense?.counterstrike?.disabled,
        );
        if (!entries.length) {
            sohl.log.uiWarn(
                `${this.name} has no melee strike mode in reach to counterstrike.`,
            );
            return;
        }
        const choices: Record<string, string> = {};
        entries.forEach((e, i) => {
            choices[String(i)] = `${e.itemName} — ${e.strikeMode.name}`;
        });

        const recent = this.lastAttackMode;
        let defaultIdx =
            recent ?
                entries.findIndex(
                    (e) => e.itemId === recent.itemId && e.smId === recent.smId,
                )
            :   -1;
        if (defaultIdx < 0) {
            defaultIdx = Math.max(
                0,
                indexOfBestMastery(
                    entries,
                    (e) =>
                        (e.strikeMode as any).defense.counterstrike
                            .constrainedEffective,
                ),
            );
        }

        const modeInput = await resolveActionInput<{
            key: string;
            situationalModifier: number;
        }>(context, {
            fromScope: (s) => {
                const idx = entries.findIndex(
                    (e) => e.itemId === s.itemId && e.smId === s.strikeModeId,
                );
                return {
                    key: idx >= 0 ? String(idx) : String(defaultIdx),
                    situationalModifier:
                        Number.parseInt(String(s.situationalModifier), 10) || 0,
                };
            },
            dialog: () =>
                showDefenseDialog(
                    `${this.name} — Select Counterstrike`,
                    "Counterstrike with:",
                    choices,
                    String(defaultIdx),
                ),
        });
        if (!modeInput) return;
        const entry = entries[Number(modeInput.key)];
        if (!entry) return;
        const sm = entry.strikeMode as any;

        const aimChoices = buildAimChoices(rc.attacker.actor);
        const defaultAim = Object.keys(aimChoices)[0] ?? "";
        const aim = await resolveActionInput<string | null>(context, {
            fromScope: (s) => String((s as any).aim ?? defaultAim),
            dialog: () =>
                pickChoice(
                    `${this.name} — Aim Counterstrike`,
                    "Aim at:",
                    aimChoices,
                    defaultAim,
                ),
        });
        if (aim === null) return;

        const counter = buildAttackResult({
            attackML: sm.defense.counterstrike,
            impact: sm.impact,
            parent: this,
            token: context.token,
            testType: TEST_TYPE.AUTOCOMBATMELEE.id,
            aimBodyPartCode: aim,
            spread: sm.spread?.effective ?? 0,
            title: entry.itemName,
        });
        if (modeInput.situationalModifier) {
            counter.masteryLevelModifier.add(
                VALUE_DELTA_INFO.PLAYER,
                modeInput.situationalModifier,
            );
        }

        const combatResult = this.buildCombatResult(
            attackResult,
            counter,
            context,
        );
        await combatResult.evaluate();
        await this.recordAttackMode(entry.itemId, entry.smId);

        if (context.noChat) return;
        const cardData = buildCombatCardData({
            combatResult,
            title: "Attack Result",
            actorId: this.id,
            attackerName: attackResult.speaker?.name ?? "",
            defenderName: this.name,
            attackWeapon: attackResult.title ?? "",
            defenseLabel: `Counterstrike w/ ${entry.itemName}`,
            // The attacker's blow strikes this defender.
            attackTarget: {
                name: this.name,
                actorUuid: this.actorLogic?.uuid ?? "",
            },
            // The counterstrike strikes the original attacker.
            defendTarget: rc.attackerAddress,
        });
        await context.speaker.toChat(
            toFilePath("systems/sohl/templates/chat/attack-result-card.hbs"),
            cardData,
        );
    }

    /**
     * Resume automated combat with **Ignore** — no defensive contest.
     * @param context - Action context carrying the attack snapshot in its scope.
     */
    async automatedIgnoreResume(
        context: SohlActionContext<Partial<CombatResult.ContextScope>>,
    ): Promise<void> {
        const attackResult = this.rehydrateAttackResult(context);
        if (!attackResult) return;

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
            attackResult,
            defendResult,
            context,
        );
        combatResult.opposedTestEvaluate();
        await this.postCombatResultCard(
            combatResult,
            attackResult,
            "Ignore",
            context,
        );
    }

    /**
     * Rehydrate the attacker's evaluated `AttackResult` snapshot from the
     * defense button's dataset. Returns `null` (with a warning) when absent.
     * @param context - Action context whose scope holds the attack-result JSON.
     * @returns The rehydrated `AttackResult`, or `null` if none is present.
     */
    private rehydrateAttackResult(
        context: SohlActionContext<Partial<CombatResult.ContextScope>>,
    ): AttackResult | null {
        const json = (context.scope as any)?.attackResultJson;
        if (!json) {
            sohl.log.uiWarn(
                `${this.name}: automated-combat resume had no attack result to resolve.`,
            );
            return null;
        }
        return instanceFromJSON<AttackResult>(json, this);
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
                sourceTestResult: attackResult,
                targetTestResult: defendResult,
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
        const cardData = buildCombatCardData({
            combatResult,
            title: "Attack Result",
            actorId: this.id,
            attackerName: attackResult.speaker?.name ?? "",
            defenderName: this.name,
            attackWeapon: attackResult.title ?? "",
            defenseLabel,
            attackTarget: {
                name: this.name,
                actorUuid: this.actorLogic?.uuid ?? "",
            },
        });
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
                executor: "automatedCombatStart",
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
 * Compute the effective tactical move for a combatant in the given medium.
 *
 * Returns `null` when the actor has no `BeingLogic` (e.g. a vehicle actor) or
 * when the actor's base move for this medium is 0 (creature cannot move in this
 * medium). Otherwise returns `effectiveBaseMove(medium) × moveFactor`.
 *
 * @param beingLogic - The combatant actor's move-providing logic, if any.
 * @param medium - The movement medium to compute for.
 * @param moveFactor - Multiplier applied to the base move rate.
 * @returns The effective tactical move, or `null` when movement is unavailable.
 */
export function computeMove(
    medium: MovementMedium,
    moveFactor: number,
    beingLogic?: BeingLogic,
): number | null {}

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
 * (`buildAttackResult`, `buildAttackCardData`, `collectAttackableStrikeModes`,
 * `classifyMissileRange`, …) live in `combat-actions.ts`.
 *
 * Every dialog here is **bypassable**: with `context.skipDialog` set, the same
 * inputs are read from `context.scope` instead (see {@link resolveActionInput}).
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

/**
 * The resolved participants of an attack. Automated combat is between
 * **combatants** — each carries its own token (`.token`) and actor (`.actor`),
 * and the in-combat invariant is enforced by the type.
 */
interface AttackContext {
    /** The attacking combatant. */
    attacker: SohlCombatantLogic;
    /** The target combatant. */
    target: SohlCombatantLogic;
    /** Center-to-center distance between their tokens, in feet. */
    distanceFeet: number;
}

/**
 * Resolve the attacker's token, the **target combatant** (and its token), and
 * the center-to-center distance between them. Returns `null` (with a UI warning)
 * when the attacker has no token, there is no active combat, or the target rule
 * isn't met.
 *
 * Automated combat targets a *combatant*, not a token. The target is taken from
 * `context.scope.targetCombatant` (a combatant id) when supplied; otherwise it
 * is resolved from the client's targeted tokens — exactly one of which must be a
 * combatant of the current combat (see {@link resolveTargetCombatant}).
 * @param actor - The attacking actor.
 * @param context - The action context (supplies the speaker token and scope).
 * @returns The resolved attack context, or `null` when it cannot be formed.
 */
function resolveAttackContext(
    actor: any,
    context: SohlActionContext<any>,
): AttackContext | null {
    const attackerToken = resolveAttackerToken(actor, context.token);
    if (!attackerToken) return null;
    const combat = getActiveCombat();
    if (!combat) {
        sohl.log.uiWarn("Automated combat requires an active combat.");
        return null;
    }
    const attacker = combatantForToken(combat, attackerToken);
    if (!attacker) {
        sohl.log.uiWarn(
            "The attacker is not a combatant in the current combat.",
        );
        return null;
    }
    // Invariant: the attacker must not be incapacitated/dead/defeated.
    const attackerStatus = firstStatusIn(
        combatantStatuses(attacker),
        ATTACK_BLOCKING_STATUSES,
    );
    if (attackerStatus) {
        sohl.log.uiWarn(
            `${attackerToken.name ?? "The attacker"} cannot make an automated attack while ${attackerStatus}.`,
        );
        return null;
    }

    let target: SohlCombatant | null;
    const scopeTarget = (context.scope as any)?.targetCombatant;
    if (scopeTarget) {
        // Programmatic / headless: an explicit combatant id wins.
        target =
            (combat.combatants.get?.(scopeTarget) as
                | SohlCombatant
                | undefined) ?? null;
        if (!target) {
            sohl.log.uiWarn(
                "The specified target combatant is not in the current combat.",
            );
            return null;
        }
    } else {
        // Resolve from the client's targeted tokens, keeping only combatants.
        const targeted = fvttGetTargetedTokens() ?? [];
        try {
            target = resolveTargetCombatant(targeted, (t) =>
                combatantForToken(combat, t),
            );
        } catch (err) {
            sohl.log.uiWarn((err as Error).message);
            return null;
        }
    }

    const targetToken = target.token as SohlTokenDocument | null;
    if (!targetToken) {
        sohl.log.uiWarn("The target combatant has no token on the canvas.");
        return null;
    }
    // Invariant: a dead defender cannot be the target of an automated attack.
    if (firstStatusIn(combatantStatuses(target), [STATUS_EFFECT.DEAD])) {
        sohl.log.uiWarn(
            `${targetToken.name ?? "The target"} is dead and cannot be attacked.`,
        );
        return null;
    }
    const distanceFeet =
        fvttRangeToTarget(attackerToken, targetToken) ?? Infinity;
    return { attacker, target, distanceFeet };
}

/** The resolved spatial context of a counterstrike (defender striking back). */
export interface CounterstrikeContext {
    /** The original attacker's combatant — always the counterstrike's target. */
    attacker: SohlCombatant;
    /**
     * The attacker's opaque chat-target address (display name + actor UUID),
     * resolved here in the scene layer so the logic layer can address the
     * counterstrike card without touching the Foundry actor.
     */
    attackerAddress: { name: string; actorUuid: string };
    /** Center-to-center distance from defender to attacker, in feet. */
    distanceFeet: number;
}

/**
 * Resolve the counterstrike's spatial context. A counterstrike is itself an
 * attack, but its target is **never** resolved from the client's targeted tokens:
 * the target combatant is **always the original attacker** (the counterstrike
 * strikes back at whoever attacked). The attacker combatant is recovered from the
 * attack snapshot's speaker token; the distance is measured from the
 * counterstriking `defender` to them. Returns `null` (with a UI warning) when
 * either combatant's token is unavailable or the attacker is no longer in combat.
 * @param attackResult - The original attack snapshot (supplies the attacker's speaker token).
 * @param defender - The counterstriking defender, or `null`.
 * @returns The counterstrike context, or `null` when it cannot be formed.
 */
export function resolveCounterstrikeContext(
    attackResult: AttackResult,
    defender: SohlCombatant | null,
): CounterstrikeContext | null {
    const attackerTokenLogic = attackResult.speaker?.tokenLogic;
    const defenderTokenLogic = defender?.logic;
    if (!attackerTokenLogic || !defenderTokenLogic) {
        sohl.log.uiWarn(
            "Counterstrike needs both the attacker's and defender's tokens on the canvas.",
        );
        return null;
    }
    const attacker = combatantForToken(getActiveCombat(), attackerTokenLogic);
    if (!attacker) {
        sohl.log.uiWarn(
            "The attacker is no longer a combatant in the current combat.",
        );
        return null;
    }
    const distanceFeet =
        fvttRangeToTarget(defenderTokenLogic, attackerTokenLogic) ?? Infinity;
    return {
        attacker,
        attackerAddress: {
            name: attackerTokenLogic.name ?? "",
            actorUuid: (attacker.actor as any)?.uuid ?? "",
        },
        distanceFeet,
    };
}

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
 * Render `<option>` HTML for a `{ value: label }` map (raw-content dialogs).
 * @param choices - The `{ value: label }` map to render.
 * @param selected - The value to mark as selected.
 * @returns The concatenated `<option>` HTML.
 */
function renderOptions(
    choices: Record<string, string>,
    selected: string,
): string {
    return Object.entries(choices)
        .map(([value, label]) => {
            const safe = String(label)
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
            const sel = value === selected ? " selected" : "";
            return `<option value="${value}"${sel}>${safe}</option>`;
        })
        .join("");
}

/** The attack dialog's results (from the dialog form or from `scope`). */
interface AttackDialogResult {
    /** The targeted body part (shortcode). */
    aim: string;
    /** Player-entered additional modifier. */
    situationalModifier: number;
}

/**
 * Show the attack dialog (Aim + Additional Modifier) and resolve to the chosen
 * inputs, or `null` if dismissed. Side-effect-free.
 * @param title - The dialog window title.
 * @param aimChoices - The body-part aim options.
 * @param defaultAim - The pre-selected aim shortcode.
 * @returns The chosen inputs, or `null` if the dialog was dismissed.
 */
function showAttackDialog(
    title: string,
    aimChoices: Record<string, string>,
    defaultAim: string,
): Promise<AttackDialogResult | null> {
    return inputDialog({
        title,
        template: toFilePath("systems/sohl/templates/dialog/attack-dialog.hbs"),
        data: { aimChoices, defaultAim, situationalModifier: 0 },
        callback: ((_event, button: HTMLButtonElement): Promise<any> => {
            const form = button.querySelector("form");
            if (!form) return Promise.resolve(null);
            const fd = new FormDataExtended(form);
            const f = fd.object as PlainObject;
            return Promise.resolve({
                aim: String(f.aim ?? defaultAim),
                situationalModifier:
                    Number.parseInt(String(f.situationalModifier), 10) || 0,
            } satisfies AttackDialogResult);
        }) as DialogButtonCallback,
        rejectClose: false,
    }) as Promise<AttackDialogResult | null>;
}

/**
 * Present a single-select dialog (with a preselected `defaultKey`) and resolve to
 * the chosen key, or `null` if dismissed. Side-effect-free.
 * @param title - The dialog window title.
 * @param label - The select field label.
 * @param choices - The `{ key: label }` options.
 * @param defaultKey - The pre-selected option key.
 * @returns The chosen key, or `null` if the dialog was dismissed.
 */
export function pickChoice(
    title: string,
    label: string,
    choices: Record<string, string>,
    defaultKey: string,
): Promise<string | null> {
    return inputDialog({
        title,
        content: toHTMLString(
            `<form><div class="form-group"><label>${label}</label><select name="choice">${renderOptions(choices, defaultKey)}</select></div></form>`,
        ),
        callback: ((_event, button: HTMLButtonElement): Promise<any> => {
            const form = button.querySelector("form");
            if (!form) return Promise.resolve(null);
            const fd = new FormDataExtended(form);
            return Promise.resolve(
                String((fd.object as PlainObject).choice ?? defaultKey),
            );
        }) as DialogButtonCallback,
        rejectClose: false,
    }) as Promise<string | null>;
}

/**
 * Show a defense dialog with a strike-mode select **and** an Additional Modifier
 * field, preselecting `defaultKey`; resolve to `{ key, situationalModifier }` or
 * `null` if dismissed. Side-effect-free. Used by Block.
 * @param title - The dialog window title.
 * @param selectLabel - The strike-mode select field label.
 * @param choices - The `{ key: label }` strike-mode options.
 * @param defaultKey - The pre-selected option key.
 * @returns The chosen key and situational modifier, or `null` if dismissed.
 */
export function showDefenseDialog(
    title: string,
    selectLabel: string,
    choices: Record<string, string>,
    defaultKey: string,
): Promise<{
    /** The selected choice key (e.g. the chosen strike mode). */
    key: string;
    /** The player-entered situational modifier. */
    situationalModifier: number;
} | null> {
    return inputDialog({
        title,
        content: toHTMLString(
            `<form>` +
                `<div class="form-group"><label>${selectLabel}</label>` +
                `<select name="choice">${renderOptions(choices, defaultKey)}</select></div>` +
                `<div class="form-group"><label>Additional Modifier:</label>` +
                `<input type="number" name="situationalModifier" value="0" /></div>` +
                `</form>`,
        ),
        callback: ((_event, button: HTMLButtonElement): Promise<any> => {
            const form = button.querySelector("form");
            if (!form) return Promise.resolve(null);
            const fd = new FormDataExtended(form);
            const f = fd.object as PlainObject;
            return Promise.resolve({
                key: String(f.choice ?? defaultKey),
                situationalModifier:
                    Number.parseInt(String(f.situationalModifier), 10) || 0,
            });
        }) as DialogButtonCallback,
        rejectClose: false,
    }) as Promise<{ key: string; situationalModifier: number } | null>;
}

/**
 * The default mode index for a picker: the most-recently-used mode if it is
 * still available, otherwise the best-chance mode (highest effective ML).
 * @param modes - The available attackable strike modes.
 * @param recent - The most-recently-used mode reference, or `null`.
 * @returns The index of the default mode in `modes`.
 */
function defaultModeIndex(
    modes: AttackableStrikeMode[],
    recent: { itemId: string; smId: string } | null,
): number {
    if (recent) {
        const idx = modes.findIndex(
            (m) => m.itemId === recent.itemId && m.smId === recent.smId,
        );
        if (idx >= 0) return idx;
    }
    return Math.max(
        0,
        indexOfBestMastery(
            modes,
            (m) => m.strikeMode.attack.constrainedEffective,
        ),
    );
}

/**
 * Choose a strike mode from the available list (default = recent-or-best;
 * bypassable via `scope.itemId` + `scope.strikeModeId`) and run the attack.
 * @param modes - The available attackable strike modes.
 * @param rc - The resolved attack context (attacker, target, distance).
 * @param context - The action context (supplies dialog-bypass scope and chat options).
 */
async function chooseModeAndAttack(
    modes: AttackableStrikeMode[],
    rc: AttackContext,
    context: SohlActionContext<any>,
): Promise<void> {
    const recent = rc.attacker.lastAttackMode ?? null;
    const defaultIdx = defaultModeIndex(modes, recent);
    const choices: Record<string, string> = {};
    modes.forEach((m, i) => {
        choices[String(i)] = `${m.itemName} — ${m.strikeMode.name}`;
    });
    const attackerName = (rc.attacker.token as SohlTokenDocument | null)?.name;

    const pickedKey = await resolveActionInput<string | null>(context, {
        fromScope: (s) => {
            const idx = modes.findIndex(
                (m) => m.itemId === s.itemId && m.smId === s.strikeModeId,
            );
            return idx >= 0 ? String(idx) : String(defaultIdx);
        },
        dialog: () =>
            pickChoice(
                `${attackerName} — Select Attack`,
                "Strike Mode:",
                choices,
                String(defaultIdx),
            ),
    });
    if (pickedKey === null) return;
    const entry = modes[Number(pickedKey)];
    if (!entry) return;

    await startAutomatedAttack({
        attacker: rc.attacker,
        target: rc.target,
        mode: entry,
        context,
    });
}

/**
 * Run the attacker-side flow for a chosen strike mode: resolve attack inputs
 * (Aim + modifier; dialog or `scope`) → derive spread + any point-blank impact
 * bonus → assemble and evaluate the {@link AttackResult} → record the mode on the
 * combatant → post the attack card (unless `noChat`).
 * @param attacker The attacking combatant (supplies token, actor, and last-used-mode persistence).
 * @param target The target combatant (supplies token + actor).
 * @param mode The chosen attackable strike mode (carries the owning item's id/name + the mode).
 * @param context The action context — supplies the speaker, `skipDialog`, `noChat`, and `scope`.
 */
export async function startAutomatedAttack(
    attacker: SohlCombatantLogic,
    target: SohlCombatantLogic,
    mode: AttackableStrikeMode,
    context: SohlActionContext<any>,
): Promise<void> {
    if (!attacker || !target) {
        sohl.log.uiWarn(
            "Automated combat requires both attacker and target combatants.",
        );
        return;
    }
    const distanceFeet =
        fvttRangeToTarget(attacker.tokenLogic, target.tokenLogic) ?? Infinity;

    const aimChoices = buildAimChoices(target.actorLogic);
    const defaultAim = Object.keys(aimChoices)[0] ?? "";
    const input = await resolveActionInput<AttackDialogResult>(context, {
        fromScope: (s) => ({
            aim: String(s.aim ?? defaultAim),
            situationalModifier:
                Number.parseInt(String(s.situationalModifier), 10) || 0,
        }),
        dialog: () =>
            showAttackDialog(
                `${attacker.name} vs. ${target.name} Attack with ${mode.strikeMode.name}`,
                aimChoices,
                defaultAim,
            ),
    });
    if (!input) return;
    const { aim, situationalModifier } = input;

    // Spread (for injury hit-location scatter) + any impact range bonus.
    let spread: number;
    let impactRangeBonus = 0;
    if (mode.strikeMode.isMissile) {
        const band = classifyMissileRange(
            distanceFeet,
            mode.strikeMode.baseRange?.effective ?? 0,
        );
        if (!band.direct) {
            // Should not happen (range-filtered upstream), but guard volley.
            sohl.log.uiWarn(
                `${target.name} is beyond direct range (volley is not supported).`,
            );
            return;
        }
        spread = band.spread;
        impactRangeBonus = band.impactRangeBonus;
    } else {
        spread = mode.strikeMode.spread?.effective ?? 0;
    }

    const testType =
        sm.isMissile ?
            TEST_TYPE.AUTOCOMBATMISSILE.id
        :   TEST_TYPE.AUTOCOMBATMELEE.id;
    const attackResult = buildAttackResult({
        attackML: mode.strikeMode.attack,
        impact: mode.strikeMode.impact,
        parent: mode.strikeMode.parentLogic,
        tokenLogic,
        testType,
        aimBodyPartCode: aim,
        spread,
        title: smName,
    });
    if (situationalModifier) {
        attackResult.masteryLevelModifier.add(
            VALUE_DELTA_INFO.PLAYER,
            situationalModifier,
        );
    }
    if (impactRangeBonus) {
        // Point-blank missile: a flat bonus to the impact formula.
        attackResult.impact.add("SOHL.INFO.Range", "Range", impactRangeBonus);
    }
    await attackResult.evaluate();

    // Remember this mode so it defaults next time on this combatant.
    await p.attacker.recordAttackMode(p.mode.itemId, sm.id);

    if (context.noChat) return;
    const cardData = buildAttackCardData({
        attackResult,
        title: `${smName} ${sm.isMelee ? "Melee" : "Missile"} Attack`,
        attackerName: attackerTokenLogic.name ?? "",
        actorId: p.attacker.actor?.id ?? null,
        aimLabel: aimChoices[aim] ?? aim,
        target:
            defenderActor ?
                {
                    name: targetTokenLogic.name ?? "",
                    // The defense buttons dispatch to the defender's COMBATANT
                    // (its CombatantLogic hosts the resume actions).
                    actorUuid: (p.target as any)?.uuid ?? "",
                }
            :   null,
    });
    await context.speaker.toChat(
        toFilePath("systems/sohl/templates/chat/attack-card.hbs"),
        cardData,
    );
}
