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

import { ValueModifier } from "@src/domain/modifier/ValueModifier";
import type { SuccessTestResult } from "@src/domain/result/SuccessTestResult";
import type { OpposedTestResult } from "@src/domain/result/OpposedTestResult";
import type { SohlActionContext } from "@src/core/SohlActionContext";
import { CombatResult } from "@src/domain/result/CombatResult";
import { DefendResult } from "@src/domain/result/DefendResult";
import type { AttackResult } from "@src/domain/result/AttackResult";
import {
    SohlActorBaseLogic,
    SohlActorData,
    SohlActorLogic,
} from "@src/document/actor/foundry/SohlActor";
import type { LineageLogic } from "@src/document/item/logic/LineageLogic";
import type { WeaponGearLogic } from "@src/document/item/logic/WeaponGearLogic";
import type { CombatTechniqueLogic } from "@src/document/item/logic/CombatTechniqueLogic";
import { MeleeStrikeMode } from "@src/domain/strikemode/MeleeStrikeMode";
import type { ArmorGearLogic } from "@src/document/item/logic/ArmorGearLogic";
import {
    aggregateArmor,
    type ArmorLayer,
} from "@src/domain/body/ArmorAggregation";
import {
    computeActorReach,
    type MeleeReachOption,
} from "@src/document/actor/logic/reach-helpers";
import { computeAvailableStrikeModes } from "@src/document/actor/logic/strike-mode-helpers";
import type { StrikeModeBase } from "@src/domain/strikemode/StrikeModeBase";
import {
    selectActorTokens,
    selectActorCombatant,
} from "@src/document/actor/logic/token-helpers";
import { getActiveScene, getActiveCombat } from "@src/core/FoundryHelpers";
import {
    startAutomatedAttackFromActor,
    showDefenseDialog,
    findCombatant,
    resolveCounterstrikeContext,
    buildAimChoices,
    pickChoice,
} from "@src/document/actor/foundry/automated-combat";
import {
    buildCombatCardData,
    buildAttackResult,
    collectAttackableStrikeModes,
    resolveSkillMasteryLevel,
    collectBlockableStrikeModes,
    indexOfBestMastery,
} from "@src/document/actor/foundry/combat-actions";
import type { MasteryLevelModifier } from "@src/domain/modifier/MasteryLevelModifier";
import { resolveActionInput } from "@src/utils/actionInput";
import { instanceFromJSON, toFilePath } from "@src/utils/helpers";
import type { SohlTokenDocument } from "@src/document/token/SohlTokenDocument";
import type { SohlCombatant } from "@src/document/combatant/SohlCombatant";
import { readBaseMove } from "@src/domain/movement/move-helpers";
import {
    ACTION_SUBTYPE,
    defineType,
    ITEM_KIND,
    MovementMedium,
    SKILL_CODE,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
    TEST_TYPE,
    VALUE_DELTA_ID,
} from "@src/utils/constants";
import { SohlActionData } from "@src/domain/action/SohlAction";
import { SimpleRoll } from "@src/utils/SimpleRoll";

/**
 * A single person, creature, or NPC.
 *
 * A Being is the most detailed actor type in SoHL, representing an individual
 * entity with a full anatomy model (body roles, body parts, body locations),
 * skills, traits, injuries, afflictions, gear, and mystical abilities. Beings
 * are the primary participants in combat, skill tests, and social interactions.
 *
 * @typeParam TData - The Being data interface.
 */
export class BeingLogic<
    TData extends BeingData = BeingData,
> extends SohlActorBaseLogic<TData> {
    /**
     * Overall health state, derived from injury levels across body roles
     *
     * @type {ValueModifier}
     */
    health!: ValueModifier;

    /**
     * Base healing rate, ultimately influenced by traits and treatment
     */
    healingBase!: ValueModifier;

    /**
     * Current shock state, derived from accumulated injuries and other factors.
     *
     * @type {number}
     */
    shockState!: number;

    /**
     * The effective base move (feet per combat round) for this being in
     * the given medium, exposed as a `ValueModifier` so additional runtime
     * modifiers (injury impairment, encumbrance overlays from items, etc.)
     * can layer on through the standard channel.
     *
     * The base is sourced from the actor's `Lineage` item — specifically
     * `lineage.system.moveBase[medium]`. Foundry has already applied any
     * Active Effects targeting that persisted path by the time this is
     * called, so a haste AE multiplying `system.moveBase.terrestrial` × 2
     * is reflected in the base value transparently.
     *
     * Returns a ValueModifier with base 0 if the actor has no lineage or
     * the lineage has no value for this medium.
     */
    effectiveBaseMove(medium: MovementMedium): ValueModifier {
        const lineageItem = (this.actor?.itemTypes as any)?.[
            ITEM_KIND.LINEAGE
        ]?.[0];
        const lineageLogic = lineageItem?.logic as LineageLogic | undefined;
        const base = readBaseMove(lineageLogic?.moveBase, medium);
        return new ValueModifier({}, { parent: this }).setBase(base);
    }

    /**
     * The being's melee reach (feet): the greatest reach among its currently
     * *available* melee strike modes.
     *
     * - **Combat techniques** are intrinsic and always available — every
     *   melee technique mode counts.
     * - A **weapon's** melee mode counts only when the weapon is currently
     *   held in at least the mode's `minParts` limbs (a body part that
     *   `canHoldItem`).
     *
     * Returns 0 when no melee mode is available (e.g. an unarmed being with
     * no combat techniques). Reads each strike mode's already-evaluated
     * `reach`, so it should be read after item preparation.
     */
    get reach(): number {
        const actor = this.actor;
        if (!actor) return 0;
        const itemTypes = (actor as any).itemTypes ?? {};

        const bodyStructure = (
            itemTypes[ITEM_KIND.LINEAGE]?.[0]?.logic as LineageLogic | undefined
        )?.bodyStructure;

        const options: MeleeReachOption[] = [];

        // Combat techniques: intrinsic, always available.
        for (const ct of itemTypes[ITEM_KIND.COMBATTECHNIQUE] ?? []) {
            const sm = (ct.logic as CombatTechniqueLogic | undefined)
                ?.strikeMode;
            if (sm instanceof MeleeStrikeMode) {
                options.push({
                    reach: sm.reach.effective,
                    minParts: sm.minParts,
                    heldLimbs: null,
                });
            }
        }

        // Weapons: a melee mode is available only if the weapon is held in at
        // least `minParts` limbs.
        for (const weapon of itemTypes[ITEM_KIND.WEAPONGEAR] ?? []) {
            const heldLimbs = bodyStructure?.limbsHolding(weapon.id) ?? 0;
            const strikeModes =
                (weapon.logic as WeaponGearLogic | undefined)?.strikeModes ??
                [];
            for (const sm of strikeModes) {
                if (sm instanceof MeleeStrikeMode) {
                    options.push({
                        reach: sm.reach.effective,
                        minParts: sm.minParts,
                        heldLimbs,
                    });
                }
            }
        }

        return computeActorReach(options);
    }

    /**
     * The strike modes currently available to this being:
     *
     * - every combat technique's strike mode (intrinsic, always available), and
     * - each weapon strike mode whose weapon is held in at least the mode's
     *   `minParts` limbs.
     *
     * Reads each strike mode's already-prepared data, so it should be read
     * after item preparation. Returns an empty array when no mode is available.
     */
    get availableStrikeModes(): StrikeModeBase[] {
        const actor = this.actor;
        if (!actor) return [];
        const itemTypes = (actor as any).itemTypes ?? {};

        const bodyStructure = (
            itemTypes[ITEM_KIND.LINEAGE]?.[0]?.logic as LineageLogic | undefined
        )?.bodyStructure;

        const techniqueModes: StrikeModeBase[] = [];
        for (const ct of itemTypes[ITEM_KIND.COMBATTECHNIQUE] ?? []) {
            const sm = (ct.logic as CombatTechniqueLogic | undefined)
                ?.strikeMode;
            if (sm) techniqueModes.push(sm);
        }

        const weapons = (itemTypes[ITEM_KIND.WEAPONGEAR] ?? []).map(
            (weapon: any) => ({
                id: weapon.id as string,
                strikeModes:
                    (weapon.logic as WeaponGearLogic | undefined)
                        ?.strikeModes ?? [],
            }),
        );

        return computeAvailableStrikeModes(
            bodyStructure,
            techniqueModes,
            weapons,
        );
    }

    /**
     * This being's tokens on the world's active scene.
     *
     * - For a **synthetic** (token) actor, this is the single token the actor
     *   is embedded in, provided that token lives on the active scene.
     * - For a **world** (linked) actor, this is every linked token on the
     *   active scene that represents this actor.
     *
     * Returns an empty array when there is no active scene or no matching token.
     */
    get tokens(): SohlTokenDocument[] {
        const actor = this.actor;
        if (!actor) return [];

        const scene = getActiveScene();
        if (!scene) return [];

        const sceneTokens = [
            ...((scene.tokens ?? []) as Iterable<SohlTokenDocument>),
        ];
        const embedded =
            (actor as any).isToken ?
                ((actor as any).token as SohlTokenDocument | null)
            :   null;
        if (!embedded && !actor.id) return [];

        return selectActorTokens(sceneTokens, actor.id ?? "", embedded ?? null);
    }

    /**
     * This being's combatant in the active combat encounter.
     *
     * Returns the first combatant of `game.combat` whose token is one of this
     * being's {@link tokens} on the active scene, or `null` when there is no
     * active combat or no such combatant.
     */
    get combatant(): SohlCombatant | null {
        const combat = getActiveCombat();
        if (!combat) return null;

        const tokenIds = new Set(
            this.tokens.map((t) => t.id).filter((id): id is string => !!id),
        );
        if (tokenIds.size === 0) return null;

        return selectActorCombatant(
            combat.combatants.contents as SohlCombatant[],
            tokenIds,
        );
    }

    /**
     * Apply the impact of an attack or effect to this being, calculating the resulting
     * location and damage. If armor or other defenses are unable to fully mitigate the impact,
     * this will return the resulting damage and location so it can then be used
     * to apply damage to the being's body roles and parts.
     * @param [context.scope.CombatResult] The CombatResult representing the result of the attack or effect.
     * @returns The impact result, or null if no impact occurred.
     */
    async calcImpact(
        context: SohlActionContext<CombatResult.ContextScope>,
    ): Promise<SimpleRoll | null> {
        return null;
    }

    /**
     * Roll the being's shock test (Shock skill), used to resist losing
     * consciousness or capability after taking injury. The resulting success
     * level feeds the being's shock modifier.
     *
     * @param context - The action context for the test.
     * @returns The success test result, or `null` if the test could not be run.
     * @remarks Not yet implemented; currently returns `null`.
     */
    async shockTest(
        context: SohlActionContext<EmptyObject>,
    ): Promise<SuccessTestResult | null> {
        // let { testResult } = options;
        // if (!testResult) {
        //     const shockSkill = this.actor.getItem("shk", { types: ["skill"] });
        //     if (!shockSkill) return null;
        //     testResult = new CONFIG.SOHL.class.SuccessTestResult(
        //         {
        //             speaker,
        //             testType: SuccessTestResult.TEST_TYPE.SHOCK,
        //             mlMod: Utility.deepClone(shockSkill.system.$masteryLevel),
        //         },
        //         { parent: shockSkill.system },
        //     );
        //     // For the shock test, the test should not include the impairment penalty
        //     testResult.mlMod.delete("BPImp");
        // }
        // testResult = testResult.item.system.successTest(optionws);
        // testResult.shockMod = 1 - testResult.successLevel;
        // return testResult;
        return null;
    }

    /**
     * Roll the being's stumble test, used to keep its footing. Tests the better
     * of the being's Agility trait and Acrobatics skill.
     *
     * @param context - The action context for the test.
     * @returns The success test result, or `null` if the test could not be run.
     * @remarks Not yet implemented; currently returns `null`.
     */
    async stumbleTest(
        context: SohlActionContext<EmptyObject>,
    ): Promise<SuccessTestResult | null> {
        // if (!options.testResult) {
        //     const agility = this.actor.getItem("agl", { types: ["trait"] });
        //     const acrobatics = this.actor.getItem("acro", { types: ["skill"] });
        //     const item =
        //         (
        //             agility?.system.$masteryLevel.effective >
        //             acrobatics?.system.$masteryLevel.effective
        //         ) ?
        //             agility
        //         :   acrobatics;
        //     if (!item) return null;
        //     options.testResult = new CONFIG.SOHL.class.SuccessTestResult(
        //         {
        //             speaker,
        //             testType: SuccessTestResult.TEST_TYPE.STUMBLE,
        //             mlMod: Utility.deepClone(item.system.$masteryLevel),
        //         },
        //         { parent: item.system },
        //     );
        // }
        // return options.testResult.item.system.successTest(options);
        return null;
    }

    /**
     * Roll the being's fumble test, used to avoid dropping or mishandling an
     * item. Tests the better of the being's Dexterity trait and Legerdemain
     * skill.
     *
     * @param context - The action context for the test.
     * @returns The success test result, or `null` if the test could not be run.
     * @remarks Not yet implemented; currently returns `null`.
     */
    async fumbleTest(
        context: SohlActionContext<EmptyObject>,
    ): Promise<SuccessTestResult | null> {
        // if (!options.testResult) {
        //     const dexterity = this.actor.getItem("dex", { types: ["trait"] });
        //     const legerdemain = this.actor.getItem("lgdm", {
        //         types: ["skill"],
        //     });
        //     const item =
        //         (
        //             dexterity?.system.$masteryLevel.effective >
        //             legerdemain?.system.$masteryLevel.effective
        //         ) ?
        //             dexterity
        //         :   legerdemain;
        //     if (!item) return null;
        //     options.testResult = new CONFIG.SOHL.class.SuccessTestResult(
        //         {
        //             speaker,
        //             testType: SuccessTestResult.TEST_TYPE.FUMBLE,
        //             mlMod: Utility.deepClone(item.system.$masteryLevel),
        //         },
        //         { parent: item.system },
        //     );
        // }
        // return options.testResult.item.system.successTest(options);
        return null;
    }

    /**
     * Roll the being's morale test, used to resist breaking, fleeing, or
     * surrendering under pressure. Tests the being's Initiative skill.
     *
     * @param context - The action context for the test.
     * @returns The success test result, or `null` if the test could not be run.
     * @remarks Not yet implemented; currently returns `null`.
     */
    async moraleTest(
        context: SohlActionContext<EmptyObject>,
    ): Promise<SuccessTestResult | null> {
        // if (!options.testResult) {
        //     const initSkill = this.actor.getItem("init", { types: ["skill"] });
        //     if (!initSkill) return null;
        //     options.testResult = new CONFIG.SOHL.class.SuccessTestResult(
        //         {
        //             speaker,
        //             testType: SuccessTestResult.TEST_TYPE.MORALE,
        //             mlMod: Utility.deepClone(initSkill.system.$masteryLevel),
        //         },
        //         { parent: initSkill.system },
        //     );
        // }
        // options.testResult =
        //     options.testResult.item.system.successTest(options);
        // return this._createTestItem(options);
        return null;
    }

    /**
     * Roll the being's fear test, used to resist a frightening stimulus. Tests
     * the being's Initiative skill.
     *
     * @param context - The action context for the test.
     * @returns The success test result, or `null` if the test could not be run.
     * @remarks Not yet implemented; currently returns `null`.
     */
    async fearTest(
        context: SohlActionContext<EmptyObject>,
    ): Promise<SuccessTestResult | null> {
        // if (!options.testResult) {
        //     const initSkill = this.actor.getItem("init", { types: ["skill"] });
        //     if (!initSkill) return null;
        //     options.testResult = new CONFIG.SOHL.class.SuccessTestResult(
        //         {
        //             speaker,
        //             testType: SuccessTestResult.TEST_TYPE.FEAR,
        //             mlMod: Utility.deepClone(initSkill.system.$masteryLevel),
        //         },
        //         { parent: initSkill.system },
        //     );
        // }
        // options.testResult =
        //     options.testResult.item.system.successTest(options);
        // return this._createTestItem(options);
        return null;
    }

    /**
     * Roll the test that determines whether this being contracts an affliction
     * it has been exposed to. The candidate affliction is supplied through the
     * action context.
     *
     * @param context - The action context for the test.
     * @returns The success test result, or `null` if the test could not be run.
     * @remarks Not yet implemented; currently returns `null`.
     */
    async contractAfflictionTest(
        context: SohlActionContext<EmptyObject>,
    ): Promise<SuccessTestResult | null> {
        // let { afflictionObj } = options;
        // if (!options.testResult) {
        //     if (!afflictionObj) return null;
        //     const item = new SohlItem(afflictionObj);
        //     if (!item) return null;
        //     options.testResult = new CONFIG.SOHL.class.SuccessTestResult(
        //         {
        //             speaker,
        //             testType: SuccessTestResult.TEST_TYPE.AFFLICTIONCONTRACT,
        //             mlMod: Utility.deepClone(item.system.$masteryLevel),
        //         },
        //         { parent: item.system },
        //     );
        // }
        // options.testResult =
        //     options.testResult.item.system.successTest(options);
        // return this._createTestItem(options);
        return null;
    }

    /**
     * Present a dialog asking the player to Select the appropriate item to use
     * for the opposed test, then delegate processing of the opposed request to that item.
     *
     * @remarks
     * One of `priorTestResult` or `sourceSuccessTestResult` must be supplied in `context.scope`:
     * - `priorTestResult` is the prior opposed test result that is being retried
     * - `sourceSuccessTestResult` is the result of the test that initiated the opposed test
     *
     * @param [context.scope.priorTestResult] A prior opposed test result that is being retried.
     * @param [context.scope.sourceSuccessTestResult] The original test result that initiated the opposed test; used to help select the appropriate item for the resume.
     */
    async opposedTestResume(
        context: SohlActionContext<Partial<OpposedTestResult.ContextScope>>,
    ): Promise<void> {
        const { priorTestResult, sourceSuccessTestResult } = context.scope;
        if (!priorTestResult && !sourceSuccessTestResult) {
            throw new Error(
                "opposedTestResume requires priorTestResult or sourceSuccessTestResult in scope.",
            );
        }
        // const sourceItem = priorTestResult.sourceTestResult.item;
        // const skill = await Utility.getOpposedItem({
        //     actor: this.parent,
        //     label: _l(
        //         "SOHL.Actor.being.opposedTestResume.getOpposedItem.label",
        //     ),
        //     title: _l(
        //         "SOHL.Actor.being.opposedTestResume.getOpposedItem.title",
        //         {
        //             name: token.name,
        //         },
        //     ),
        //     func: (it) => {
        //         let result = false;
        //         if (
        //             (it.system instanceof TraitItemData &&
        //                 it.system.intensity === "attribute" &&
        //                 !it.system.$masteryLevel.disabled) ||
        //             it.system instanceof SkillItemData
        //         ) {
        //             const name = _l(
        //                 "SOHL.Actor.being.opposedTestResume.getOpposedItem.attributeLabel",
        //                 {
        //                     name: it.name,
        //                     ml: it.system.$masteryLevel.effective,
        //                 },
        //             );
        //             result = {
        //                 key: name,
        //                 value: {
        //                     name,
        //                     uuid: it.uuid,
        //                     value: it.system.$masteryLevel,
        //                     item: it,
        //                 },
        //             };
        //         }
        //         return result;
        //     },
        //     compareFn: (a, b) => {
        //         if (
        //             a.value.item.type === sourceItem.type &&
        //             a.value.item.name === sourceItem.name
        //         )
        //             return -1; // Move item to the front
        //         if (
        //             b.value.item.type === sourceItem.type &&
        //             b.value.item.name === sourceItem.name
        //         )
        //             return -1; // Move item to the front
        //         return 0; // Keep relative order for other items
        //     },
        // });
        // if (skill === null) {
        //     return null;
        // } else if (skill === false) {
        //     ui.notifications.warn(
        //         _l(
        //             "SOHL.Actor.being.opposedTestResume.getOpposedItem.noUsableSkills",
        //             { name: token.name },
        //         ),
        //     );
        //     return null;
        // } else {
        //     skill.system.execute("opposedTestResume", options);
        // }
        return;
    }

    /**
     * Present a dialog asking the player to select the appropriate strike mode
     * to use to begin automated combat, then delegate processing of the combat start to
     * the selected strike mode's item.
     */
    async automatedCombatStart(
        context: SohlActionContext<EmptyObject>,
    ): Promise<void> {
        await startAutomatedAttackFromActor(this, context);
    }

    /**
     * Present a dialog asking the player to select a strike mode to block with to resume
     * the automated combat.
     *
     * @remarks
     * Any strike mode that has the noBlock trait should be filtered out of the choices.
     * The default value of the choices should be the most recently used strike mode that
     * does not have the noBlock trait. Otherwise, there is no default value.
     *
     * Once a strike mode is selected, delegate processing of the block resume to that
     * strike mode's item.
     *
     * One of `combatResult` or `attackResult` must be supplied in `context.scope`:
     * - `combatResult` is the prior automated resume result that is being reassessed
     * - `attackResult` is the result of the automated attack that initiated the automated resume
     *
     * @param [context.scope.priorTestResult] A prior opposed test result that is being retried.
     * @param [context.scope.attackResult] The test result that initiated the opposed test
     */
    async automatedBlockResume(
        context: SohlActionContext<Partial<CombatResult.ContextScope>>,
    ): Promise<void> {
        const attackResult = this._rehydrateAttackResult(context);
        if (!attackResult) return;

        const entries = collectBlockableStrikeModes(this.actor as any);
        if (!entries.length) {
            sohl.log.uiWarn(
                `${this.actor?.name} has no strike mode able to block.`,
            );
            return;
        }
        const choices: Record<string, string> = {};
        entries.forEach((e, i) => {
            choices[String(i)] = e.label;
        });

        // Default to the most-recently-used block mode (if still available),
        // else the best-chance block (highest effective block ML).
        const combatant =
            context.token ? findCombatant(context.token) : null;
        const recent = combatant?.lastBlockMode ?? null;
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

        // Pick the blocking strike mode + Additional Modifier (dialog, or from
        // scope when skipDialog: `itemId` + `strikeModeId` + `situationalModifier`).
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
                    `${this.actor?.name} — Select Block`,
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
                // Clone so the defense's situational delta doesn't mutate the
                // strike mode's live block modifier.
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
        const combatResult = this._buildCombatResult(
            attackResult,
            defendResult,
            context,
        );
        // evaluate() rolls the block on the defender's client, then resolves.
        await combatResult.evaluate();
        // Remember this block mode so it defaults next time on this combatant.
        await combatant?.recordBlockMode(entry.itemId, entry.smId);
        await this._postCombatResultCard(
            combatResult,
            attackResult,
            `Block w/ ${entry.itemName}`,
            context,
        );
    }

    /**
     * Resumes automated combat using the Dodge skill. Rolls dodge test and completes processing
     * of the automated resume (including chat card output). If dodge fails, presents button on
     * chat card allowing the defender to calculate impact.
     *
     * @remarks
     * One of `combatResult` or `attackResult` must be supplied in `context.scope`:
     * - `combatResult` is the prior automated resume result that is being reassessed
     * - `attackResult` is the result of the automated attack that initiated the automated resume
     *
     * @param [context.scope.priorTestResult] A prior opposed test result that is being retried.
     * @param [context.scope.attackResult] The test result that initiated the opposed test
     */
    async automatedDodgeResume(
        context: SohlActionContext<Partial<CombatResult.ContextScope>>,
    ): Promise<void> {
        const attackResult = this._rehydrateAttackResult(context);
        if (!attackResult) return;

        // Dodge rolls the defender's Dodge skill; no dialog.
        const dodgeML = resolveSkillMasteryLevel(
            this.actor as any,
            SKILL_CODE.DODGE,
        );
        if (!dodgeML) {
            sohl.log.uiWarn(
                `${this.actor?.name} has no Dodge skill to defend with.`,
            );
            return;
        }
        const defendResult = new DefendResult(
            {
                testType: TEST_TYPE.DODGE.id,
                // Clone so the defense's situational delta doesn't mutate the
                // live skill modifier.
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
        const combatResult = this._buildCombatResult(
            attackResult,
            defendResult,
            context,
        );
        // evaluate() rolls the dodge on the defender's client, then resolves the
        // opposed outcome (the attacker side is read as a snapshot).
        await combatResult.evaluate();
        await this._postCombatResultCard(
            combatResult,
            attackResult,
            "Dodge",
            context,
        );
    }

    /**
     * Resume automated combat with the **Counterstrike** defense — "offense is
     * the best defense". Unlike Block/Dodge/Ignore, the defender does not roll a
     * {@link DefendResult}: the counterstrike is itself a second attack (an
     * {@link AttackResult}) aimed back at the original attacker, so **both** sides
     * can land in the same exchange. The resolved {@link CombatResult} carries one
     * "Calculate Injury" button per landing side (the attacker's blow against this
     * defender, and the counterstrike against the attacker).
     *
     * The defender picks a **melee** attack strike mode in reach of the attacker
     * (the `noAttack` trait excludes a mode; missile modes are never offered — a
     * counterstrike is a melee reaction, and an out-of-reach attacker yields none)
     * and a body part to aim at. The default is the most-recently-used attack mode
     * (a counterstrike *is* an attack), else the best-chance attack mode. Both
     * choices are bypassable via `scope` (`itemId` + `strikeModeId` +
     * `situationalModifier`, and `aim`) when `skipDialog` is set.
     *
     * The attack snapshot arrives in `context.scope.attackResultJson` (set by the
     * defender's chat-card button); its speaker token identifies the attacker.
     */
    async automatedCounterstrikeResume(
        context: SohlActionContext<Partial<CombatResult.ContextScope>>,
    ): Promise<void> {
        const attackResult = this._rehydrateAttackResult(context);
        if (!attackResult) return;

        // This defender's combatant — for the recent-mode default + persistence.
        const combatant = context.token ? findCombatant(context.token) : null;

        // The counterstrike targets the original attacker (recovered from the
        // attack snapshot's speaker token); distance is defender → attacker.
        const rc = resolveCounterstrikeContext(attackResult, combatant);
        if (!rc) return;

        // Counterstrike uses melee modes within reach of the attacker. A mode is
        // eligible when it can attack (gated by `noAttack`, via the collector) and
        // its counterstrike modifier is not independently disabled. A ranged
        // attacker out of melee reach yields none → cannot counterstrike.
        const entries = collectAttackableStrikeModes(
            this.actor as any,
            rc.distanceFeet,
        ).filter(
            (e) =>
                (e.strikeMode as any).isMelee &&
                !(e.strikeMode as any).defense?.counterstrike?.disabled,
        );
        if (!entries.length) {
            sohl.log.uiWarn(
                `${this.actor?.name} has no melee strike mode in reach to counterstrike.`,
            );
            return;
        }
        const choices: Record<string, string> = {};
        entries.forEach((e, i) => {
            choices[String(i)] = `${e.itemName} — ${e.strikeMode.name}`;
        });

        // Default: the most-recently-used attack mode (a counterstrike shares the
        // attack-mode history), else the best chance — ranked by the
        // counterstrike modifier, which is what the counterstrike actually rolls.
        const recent = combatant?.lastAttackMode ?? null;
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

        // Pick the counterstrike strike mode + Additional Modifier.
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
                    `${this.actor?.name} — Select Counterstrike`,
                    "Counterstrike with:",
                    choices,
                    String(defaultIdx),
                ),
        });
        if (!modeInput) return;
        const entry = entries[Number(modeInput.key)];
        if (!entry) return;
        const sm = entry.strikeMode as any;

        // Aim the counterstrike at a body part on the attacker.
        const aimChoices = buildAimChoices(rc.attacker.actor);
        const defaultAim = Object.keys(aimChoices)[0] ?? "";
        const aim = await resolveActionInput<string | null>(context, {
            fromScope: (s) => String((s as any).aim ?? defaultAim),
            dialog: () =>
                pickChoice(
                    `${this.actor?.name} — Aim Counterstrike`,
                    "Aim at:",
                    aimChoices,
                    defaultAim,
                ),
        });
        if (aim === null) return;

        // The counterstrike is a melee attack by this defender against the
        // attacker — modelled as an AttackResult in the CombatResult's defender
        // slot (so both sides can land and carry impact). It rolls the strike
        // mode's **counterstrike** modifier (same skill base as attack, but its
        // own deltas) rather than the plain attack modifier.
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
                VALUE_DELTA_ID.PLAYER,
                modeInput.situationalModifier,
            );
        }

        const combatResult = this._buildCombatResult(
            attackResult,
            counter,
            context,
        );
        // evaluate() rolls the counterstrike on the defender's client, then
        // resolves the exchange and rolls each landing side's impact.
        await combatResult.evaluate();
        // A counterstrike is an attack — remember it as the last attack mode.
        await combatant?.recordAttackMode(entry.itemId, entry.smId);

        if (context.noChat) return;
        const cardData = buildCombatCardData({
            combatResult,
            title: "Attack Result",
            actorId: this.actor?.id ?? null,
            attackerName: attackResult.speaker?.name ?? "",
            defenderName: this.actor?.name ?? "",
            attackWeapon: attackResult.title ?? "",
            defenseLabel: `Counterstrike w/ ${entry.itemName}`,
            // The attacker's blow strikes this defender.
            attackTarget:
                this.actor ?
                    { name: this.actor.name ?? "", actorUuid: this.actor.uuid }
                :   null,
            // The counterstrike strikes the original attacker.
            defendTarget:
                rc.attacker.actor ?
                    {
                        name: rc.attacker.token?.name ?? "",
                        actorUuid: rc.attacker.actor.uuid,
                    }
                :   null,
        });
        await context.speaker.toChat(
            toFilePath("systems/sohl/templates/chat/attack-result-card.hbs"),
            cardData,
        );
    }

    /**
     * Perform the Ignore defense. Completes processing of the automated resume (including
     * chat card output). If the defense results in a hit, presents button on chat card
     * allowing the defender to calculate impact.
     *
     * One of `combatResult` or `attackResult` must be supplied in `context.scope`:
     * - `combatResult` is the prior automated resume result that is being reassessed
     * - `attackResult` is the result of the automated attack that initiated the automated resume
     *
     * @param [context.scope.priorTestResult] A prior opposed test result that is being retried.
     * @param [context.scope.attackResult] The test result that initiated the opposed test
     */
    async automatedIgnoreResume(
        context: SohlActionContext<Partial<CombatResult.ContextScope>>,
    ): Promise<void> {
        const attackResult = this._rehydrateAttackResult(context);
        if (!attackResult) return;

        // Ignore = no defensive contest: a non-rolling placeholder. Resolve
        // directly (no defender roll) via opposedTestEvaluate.
        const defendResult = new DefendResult(
            {
                testType: TEST_TYPE.IGNORE.id,
                situationalModifier: 0,
                speaker: context.speaker,
                token: context.token ?? undefined,
            } as any,
            { parent: this },
        );
        const combatResult = this._buildCombatResult(
            attackResult,
            defendResult,
            context,
        );
        combatResult.opposedTestEvaluate();
        await this._postCombatResultCard(
            combatResult,
            attackResult,
            "Ignore",
            context,
        );
    }

    /**
     * Rehydrate the attacker's evaluated `AttackResult` snapshot from the defense
     * button's dataset (`data-attack-result-json` → `scope.attackResultJson`).
     * Returns `null` (with a warning) when absent. Parent is this defender's
     * logic, per the snapshot-on-defender model.
     */
    private _rehydrateAttackResult(
        context: SohlActionContext<Partial<CombatResult.ContextScope>>,
    ): AttackResult | null {
        const json = (context.scope as any)?.attackResultJson;
        if (!json) {
            sohl.log.uiWarn(
                `${this.actor?.name}: automated-combat resume had no attack result to resolve.`,
            );
            return null;
        }
        return instanceFromJSON<AttackResult>(json, this);
    }

    /** Compose the `CombatResult` for a resolved exchange (attacker snapshot + defender response). */
    private _buildCombatResult(
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
     * Post the combat-result card as the defender. A landing blow carries a
     * "Calculate <Token> Injury" button. Suppressed when `context.noChat`.
     */
    private async _postCombatResultCard(
        combatResult: CombatResult,
        attackResult: AttackResult,
        defenseLabel: string,
        context: SohlActionContext<Partial<CombatResult.ContextScope>>,
    ): Promise<void> {
        if (context.noChat) return;
        const cardData = buildCombatCardData({
            combatResult,
            title: "Attack Result",
            actorId: this.actor?.id ?? null,
            attackerName: attackResult.speaker?.name ?? "",
            defenderName: this.actor?.name ?? "",
            attackWeapon: attackResult.title ?? "",
            defenseLabel,
            attackTarget:
                this.actor ?
                    { name: this.actor.name ?? "", actorUuid: this.actor.uuid }
                :   null,
        });
        await context.speaker.toChat(
            toFilePath("systems/sohl/templates/chat/attack-result-card.hbs"),
            cardData,
        );
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
        this.aggregateArmorProtection();
    }

    /**
     * Fold every worn ArmorGear's protection onto the lineage body locations
     * it covers, so each location knows its summed armor, whether it is rigid,
     * and the list of covering materials. Runs after `super.evaluate()` so the
     * armor items' protection modifiers are already prepared. No-op when the
     * being has no lineage (hence no body structure).
     */
    private aggregateArmorProtection(): void {
        const itemTypes = (this.actor as any)?.itemTypes ?? {};
        const bodyStructure = (
            itemTypes[ITEM_KIND.LINEAGE]?.[0]?.logic as LineageLogic | undefined
        )?.bodyStructure;
        if (!bodyStructure) return;

        const layers: ArmorLayer[] = [];
        for (const armor of itemTypes[ITEM_KIND.ARMORGEAR] ?? []) {
            const logic = armor.logic as ArmorGearLogic | undefined;
            if (!logic) continue;
            layers.push({
                material: (logic.data as any).material ?? "",
                protection: {
                    blunt: logic.protection.blunt.effective,
                    edged: logic.protection.edged.effective,
                    piercing: logic.protection.piercing.effective,
                    fire: logic.protection.fire.effective,
                },
                flexibleLocations:
                    (logic.data as any).locations?.flexible ?? [],
                rigidLocations: (logic.data as any).locations?.rigid ?? [],
            });
        }

        aggregateArmor(bodyStructure, layers);
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();

        // A being really has to have a lineage — it supplies body structure,
        // movement, weight, and reach. Lacking one is not a hard error (we do
        // not throw), but the being cannot participate in most being actions
        // (it cannot wield weapons, move, etc.) and should be treated as
        // unusable. Surface that as a warning so it gets noticed and fixed.
        const hasLineage = !!(this.actor?.itemTypes as any)?.[
            ITEM_KIND.LINEAGE
        ]?.[0];
        if (!hasLineage) {
            sohl.log.warn(
                `Being "${this.actor?.name ?? "?"}" has no Lineage item; it cannot participate in most being actions (movement, weapons, reach, etc.) and should be considered unusable until a Lineage is added.`,
            );
        }
    }
}

/**
 * Persisted data model for a {@link BeingLogic | Being} actor. Carries no
 * fields of its own beyond the common {@link SohlActorData} base.
 *
 * @typeParam TLogic - The logic class bound to this data.
 * @remarks The shape of `system` on a `being` actor — i.e. `actor.system` (equivalently `actor.logic.data`) when `actor.type === "being"`. The backing DataModel implements this interface.
 */
export interface BeingData<
    TLogic extends SohlActorLogic<BeingData> = SohlActorLogic<any>,
> extends SohlActorData<TLogic> {}

/**
 * The intrinsic actions available to Being actors.
 * This structure should correspond to the methods on the
 * Being class that can be invoked as intrinsic actions.
 */
export const {
    /** Map of intrinsic-action keys to their definitions. */
    kind: BEING_INTRINSIC_ACTION,
    /** Array of valid intrinsic-action key values. */
    values: BeingIntrinsicActions,
    /** Type guard testing whether a value is a valid Being intrinsic-action key. */
    isValue: isBeingIntrinsicAction,
    /** Map of intrinsic-action keys to their localized labels. */
    labels: BeingIntrinsicActionLabels,
} = defineType("SOHL.Being.ACTION", {
    SHOCKTEST: {
        subType: ACTION_SUBTYPE.INTRINSIC,
        title: "SOHL.Being.ACTION.shocktest",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "far fa-face-eyes-xmarks",
        executor: "shockTest",
        visible: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    STUMBLETEST: {
        subType: ACTION_SUBTYPE.INTRINSIC,
        title: "SOHL.Being.ACTION.stumbleTest",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "far fa-person-falling",
        executor: "stumbleTest",
        visible: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    FUMBLETEST: {
        subType: ACTION_SUBTYPE.INTRINSIC,
        title: "SOHL.Being.ACTION.fumbleTest",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "far fa-ball-pile",
        executor: "fumbleTest",
        visible: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    MORALETEST: {
        subType: ACTION_SUBTYPE.INTRINSIC,
        title: "SOHL.Being.ACTION.moraleTest",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "far fa-people-group",
        executor: "moraleTest",
        visible: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    FEARTEST: {
        subType: ACTION_SUBTYPE.INTRINSIC,
        title: "SOHL.Being.ACTION.fearTest",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "far fa-face-scream",
        executor: "fearTest",
        visible: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    CALCIMPACT: {
        subType: ACTION_SUBTYPE.INTRINSIC,
        title: "SOHL.Being.ACTION.calcImpact",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "fas fa-person-burst",
        executor: "calcImpact",
        visible: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    CONTRACTAFFLICTIONTEST: {
        subType: ACTION_SUBTYPE.INTRINSIC,
        title: "SOHL.Being.ACTION.contractAfflictionTEST",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "fas fa-virus",
        executor: "contractAfflictionTest",
        visible: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    OPPOSEDTESTRESUME: {
        subType: ACTION_SUBTYPE.INTRINSIC,
        title: "SOHL.Being.ACTION.opposedTestResume",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "fas fa-people-arrows",
        executor: "opposedTestResume",
        visible: "false",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
    },
    AUTOMATEDCOMBATSTART: {
        subType: ACTION_SUBTYPE.INTRINSIC,
        title: "SOHL.Being.ACTION.automatedCombatStart",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "fas fa-swords",
        executor: "automatedCombatStart",
        visible: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    AUTOMATEDBLOCKRESUME: {
        subType: ACTION_SUBTYPE.INTRINSIC,
        title: "SOHL.Being.ACTION.automatedBlockResume",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "fas fa-shield",
        executor: "automatedBlockResume",
        visible: "false",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
    },

    AUTOMATEDCOUNTERSTRIKERESUME: {
        subType: ACTION_SUBTYPE.INTRINSIC,
        title: "SOHL.Being.ACTION.automatedCounterstrikeResume",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "fas fa-circle-half-stroke",
        executor: "automatedCounterstrikeResume",
        visible: "false",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
    },
    AUTOMATEDDODGERESUME: {
        subType: ACTION_SUBTYPE.INTRINSIC,
        title: "SOHL.Being.ACTION.automatedDodgeResume",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "fas fa-person-walking-arrow-loop-left",
        executor: "automatedDodgeResume",
        visible: "false",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
    },
    AUTOMATEDIGNORERESUME: {
        subType: ACTION_SUBTYPE.INTRINSIC,
        title: "SOHL.Being.ACTION.automatedIgnoreResume",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "fas fa-ban",
        executor: "automatedIgnoreResume",
        visible: "false",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.HIDDEN,
    },
} as StrictObject<Partial<SohlActionData>>);
