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

import { SohlLogic, SohlLogicData } from "@src/core/SohlLogic";
import {
    combatantGridDistance,
    combatantSpacesMoved,
} from "@src/core/FoundryHelpers";
import type { SohlActionContext } from "@src/core/SohlActionContext";
import { CombatResult } from "@src/domain/result/CombatResult";
import { DefendResult } from "@src/domain/result/DefendResult";
import type { AttackResult } from "@src/domain/result/AttackResult";
import type { MasteryLevelModifier } from "@src/domain/modifier/MasteryLevelModifier";
import type { BeingLogic } from "@src/document/actor/logic/BeingLogic";
import {
    collectBlockableStrikeModes,
    collectAttackableStrikeModes,
    resolveSkillMasteryLevel,
    indexOfBestMastery,
    buildAttackResult,
    buildCombatCardData,
} from "@src/document/actor/logic/combat-actions";
import {
    showDefenseDialog,
    buildAimChoices,
    pickChoice,
    resolveCounterstrikeContext,
    startAutomatedAttackFromCombatant,
    startAutomatedAttackFromItem,
} from "@src/document/actor/logic/automated-combat";
import { resolveActionInput } from "@src/utils/actionInput";
import { instanceFromJSON, toFilePath } from "@src/utils/helpers";
import {
    ACTION_SUBTYPE,
    SKILL_CODE,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
    TEST_TYPE,
    VALUE_DELTA_INFO,
    type MovementMedium,
} from "@src/utils/constants";
import { SohlAction } from "@src/domain/action/SohlAction";
import {
    areCombatantsEnemies,
    isThreatening,
    THREAT_NEGATING_STATUSES,
    computeMove,
} from "./combatant-logic";
import type { SohlCombatant, StrikeModeRef } from "./SohlCombatant";

/**
 * The Foundry-free data contract for a SoHL combatant — the
 * {@link SohlLogicData} port specialized for {@link SohlCombatant}, plus the
 * combatant's persisted combat-scoped state. Implemented by
 * `SohlCombatantDataModel`.
 */
export interface CombatantData extends SohlLogicData<SohlCombatant> {
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
export class CombatantLogic<
    TData extends CombatantData = CombatantData,
> extends SohlLogic<TData> {
    /** Initialize-phase hook; base combatant logic does nothing. */
    override initialize(): void {}
    /** Evaluate-phase hook; base combatant logic does nothing. */
    override evaluate(): void {}
    /** Finalize-phase hook; base combatant logic does nothing. */
    override finalize(): void {}

    /** The strike mode last used to attack, or `null` (combat-scoped). */
    get lastAttackMode(): StrikeModeRef | null {
        return this.data.lastAttackMode;
    }

    /** The strike mode last used to block, or `null` (combat-scoped). */
    get lastBlockMode(): StrikeModeRef | null {
        return this.data.lastBlockMode;
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
     * The computed tactical move for this combatant in the given medium,
     * accounting for the combatant's situational `moveFactor` scalar.
     * `null` when the actor has no movement model (e.g. a Vehicle).
     * @param medium - The movement medium to compute for.
     * @returns The tactical move, or `null` when unavailable.
     */
    computedMove(medium: MovementMedium): number | null {
        return computeMove(
            this.actorLogic as BeingLogic | undefined,
            medium,
            this.data.moveFactor ?? 1,
        );
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
     * The {@link CombatantLogic} of every combatant in the same active combat
     * (including this one), or an empty array when not in combat.
     */
    get combatantLogics(): CombatantLogic[] {
        const combat = this.combatant?.combat;
        return combat ? combat.combatants.map((c: any) => c.logic) : [];
    }

    /** This combatant's group id, or `null` when ungrouped. */
    get groupId(): string | null {
        const c = this.combatant as any;
        const src = c?._source?.group;
        if (typeof src === "string" && src) return src;
        const g = c?.group;
        if (g && typeof g === "object" && typeof g.id === "string") return g.id;
        if (typeof g === "string" && g) return g;
        return null;
    }

    /**
     * Whether the two combatants are enemies — they belong to different groups.
     * @param other - The combatant logic to compare against.
     * @returns `true` if they are enemies.
     */
    isEnemyOf(other: CombatantLogic): boolean {
        return areCombatantsEnemies(this.groupId, other.groupId, other === this);
    }

    /**
     * The combatant logics sharing this one's (non-null) group — the inverse of
     * {@link isEnemyOf}.
     */
    get allies(): CombatantLogic[] {
        if (!this.groupId) return [];
        return this.combatantLogics.filter(
            (cl) => cl !== this && !this.isEnemyOf(cl),
        );
    }

    /**
     * The combatant logics currently threatening this one — enemies that are
     * not defeated, not incapacitated, not hidden, and within reach.
     */
    get threatenedBy(): CombatantLogic[] {
        return this.combatantLogics.filter((cl) => {
            if (cl === this) return false;
            const statuses: Set<string> =
                (cl.combatant?.actor as any)?.statuses ?? new Set<string>();
            return isThreatening({
                isEnemy: this.isEnemyOf(cl),
                isDefeated: !!cl.combatant?.isDefeated,
                isIncapacitated: THREAT_NEGATING_STATUSES.some((s) =>
                    statuses.has(s),
                ),
                isHidden: !!(cl.combatant?.token as any)?.hidden,
                reaches: cl.reaches(this),
            });
        });
    }

    /**
     * Whether this combatant's melee reach extends to `other` — center-to-center
     * grid distance is within this combatant's {@link reach}.
     * @param other - The combatant logic to test reach against.
     * @returns `true` if reach extends to `other`.
     */
    reaches(other: CombatantLogic): boolean {
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
     */
    async automatedCombatStart(
        context: SohlActionContext<any>,
    ): Promise<void> {
        const actorLogic = this.actorLogic;
        if (!actorLogic) return;

        const logicUuid = (context.scope as any)?.logicUuid as
            | string
            | undefined;
        if (logicUuid) {
            const itemLogic = (actorLogic as BeingLogic).allLogics.find(
                (l) => l.uuid === logicUuid,
            );
            if (!itemLogic) {
                sohl.log.uiWarn(
                    `${this.name} has no item matching the requested attack.`,
                );
                return;
            }
            await startAutomatedAttackFromItem(
                itemLogic,
                itemLogic.name,
                context,
            );
            return;
        }

        await startAutomatedAttackFromCombatant(this, context);
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
            token: context.token ?? null,
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
                actorUuid: this.combatant?.actor?.uuid ?? "",
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
                actorUuid: this.combatant?.actor?.uuid ?? "",
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
}
