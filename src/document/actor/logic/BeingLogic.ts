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
import type { ImpactResult } from "@src/domain/result/ImpactResult";
import type { SuccessTestResult } from "@src/domain/result/SuccessTestResult";
import type { SohlActionContext } from "@src/core/SohlActionContext";
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
import {
    selectActorTokens,
    selectActorCombatant,
} from "@src/document/actor/logic/token-helpers";
import { getActiveScene, getActiveCombat } from "@src/core/FoundryHelpers";
import type { SohlTokenDocument } from "@src/document/token/SohlTokenDocument";
import type { SohlCombatant } from "@src/document/combatant/SohlCombatant";
import { readBaseMove } from "@src/domain/movement/move-helpers";
import { ITEM_KIND, MovementMedium } from "@src/utils/constants";

/**
 * Logic for the **Being** actor type — a single person, creature, or NPC.
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
        const lineageItem = (this.actor?.itemTypes as any)?.[ITEM_KIND.LINEAGE]?.[0];
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
            const heldLimbs =
                bodyStructure?.parts.filter(
                    (p) => p.canHoldItem && p.heldItem?.id === weapon.id,
                ).length ?? 0;
            const strikeModes =
                (weapon.logic as WeaponGearLogic | undefined)?.strikeModes ?? [];
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
        const embedded = (actor as any).isToken
            ? ((actor as any).token as SohlTokenDocument | null)
            : null;
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
     * this will return the resulting damage and location as an {@link ImpactResult} that can
     * then be used to apply damage to the being's body roles and parts.
     * @param [context.scope.CombatResult] The CombatResult representing the result of the attack or effect.
     * @returns The impact result, or null if no impact occurred.
     */
    async calcImpact(context: SohlActionContext): Promise<ImpactResult | null> {
        // let { impactResult, itemId } = options;
        // if (!(impactResult instanceof ImpactResult)) {
        //     if (!itemId) {
        //         throw new Error("must provide either impactResult or itemId");
        //     }
        //     const item = this.actor.getItem(itemId, {
        //         types: [
        //             MeleeWeaponStrikeModeItemData.TYPE_NAME,
        //             MissileWeaponStrikeModeItemData.TYPE_NAME,
        //             CombatTechniqueStrikeModeItemData.TYPE_NAME,
        //         ],
        //     });
        //     impactResult = Utility.JSON_reviver({
        //         thisArg: item.system,
        //     })("", impactResult);
        // }
        // return impactResult.item?.system.execute("calcImpact", {
        //     impactResult,
        // });
        return null;
    }

    async shockTest(
        context: SohlActionContext,
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

    async stumbleTest(
        context: SohlActionContext,
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

    async fumbleTest(
        context: SohlActionContext,
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

    async moraleTest(
        context: SohlActionContext,
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

    async fearTest(
        context: SohlActionContext,
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

    async contractAfflictionTest(
        context: SohlActionContext,
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
     * Select the appropriate item to use for the opposed test, then delegate processing
     * of the opposed request to that item.
     *
     * @param {object} options
     * @param {string} [options.sourceTestResult]
     * @param {number} [options.testType]
     * @returns {OpposedTestResult} result of the test
     */
    async opposedTestResume(context: SohlActionContext): Promise<void> {
        // let { opposedTestResult } = options;
        // if (!opposedTestResult) {
        //     throw new Error("Must supply opposedTestResult");
        // }
        // const sourceItem = opposedTestResult.sourceTestResult.item;
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
                flexibleLocations: (logic.data as any).locations?.flexible ?? [],
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

export interface BeingData<
    TLogic extends SohlActorLogic<BeingData> = SohlActorLogic<any>,
> extends SohlActorData<TLogic> {}
