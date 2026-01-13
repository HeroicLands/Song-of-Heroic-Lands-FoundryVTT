/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2025 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { ValueModifier } from "@common/modifier/ValueModifier";
import type { SohlItem } from "@common/item/SohlItem";
import {
    SohlActorBaseLogic,
    SohlActorData,
    SohlActorDataModel,
    SohlActorLogic,
    SohlActorSheetBase,
} from "@common/actor/SohlActor";
import type { ImpactResult } from "@common/result/ImpactResult";
import type { SuccessTestResult } from "@common/result/SuccessTestResult";
import type { SohlActionContext } from "@common/SohlActionContext";
import { ACTOR_KIND, ACTOR_METADATA } from "@utils/constants";

const { ArrayField, NumberField } = foundry.data.fields;

/**
 * The business logic class for the Being actor.
 */
export class BeingLogic<
    TData extends BeingData = BeingData,
> extends SohlActorBaseLogic<TData> {
    /**
     * Represents the health of a being.
     *
     * @type {ValueModifier}
     */
    health!: ValueModifier;

    /**
     * Represents the base healing rate
     */
    healingBase!: ValueModifier;

    /**
     * Represents the sum of all zones.
     *
     * @type {number}
     */
    zoneSum!: number;

    /**
     * Represents the base body weight of a being without any gear
     *
     * @type {ValueModifier}
     */
    bodyWeight!: ValueModifier;

    /**
     * Represents the level of shock the character is experiencing.
     *
     * @type {number}
     */
    shockState!: number;

    engagedOpponents!: ValueModifier;

    domains!: StrictObject<SohlItem[]>;

    magicMod!: ValueModifier;

    /* --------------------------------------------- */
    /* Common Being Actions                        */
    /* --------------------------------------------- */

    async improveWithSDR(context: SohlActionContext): Promise<void> {
        return;
    }

    async successTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        return null;
    }

    async fatigueTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        return null;
    }

    async courseTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        return null;
    }

    async treatmentTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        return null;
    }

    async diagnosisTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        return null;
    }

    async healingTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        return null;
    }

    async bleedingStoppageTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        return null;
    }

    async bloodlossAdvanceTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        return null;
    }

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
    override initialize(context: SohlActionContext): void {
        super.initialize(context);
        //     class HealthModifier extends CONFIG.SOHL.class.ValueModifier {
        //         static defineSchema() {
        //             return foundry.utils.mergeObject(super.defineSchema(), {
        //                 max: new fields.NumberField({
        //                     integer: true,
        //                     nullable: false,
        //                     initial: 0,
        //                     min: 0,
        //                 }),
        //                 pct: new SohlFunctionField({
        //                     initial: (thisVM) =>
        //                         Math.round(
        //                             (thisVM.effective /
        //                                 (thisVM.max || Number.EPSILON)) *
        //                                 100,
        //                         ),
        //                 }),
        //             });
        //         }
        //     }
        //     super.prepareBaseData();
        //     this.$health = new HealthModifier({}, { parent: this });
        //     this.$healingBase = new CONFIG.SOHL.class.ValueModifier(
        //         {},
        //         { parent: this },
        //     );
        //     this.$zoneSum = 0;
        //     this.$isSetup = true;
        //     this.$shockState = InjuryItemData.SHOCK.NONE;
        //     this.$engagedOpponents = new CONFIG.SOHL.class.ValueModifier(
        //         {},
        //         { parent: this },
        //     );
        //     this.$engagedOpponents.setBase(0);
        //     this.$domains = Object.fromEntries(
        //         Object.keys(PhilosophyItemData.categories).map((c) => [c, []]),
        //     );
        // }
    }

    /** @inheritdoc */
    override evaluate(context: SohlActionContext): void {
        super.evaluate(context);
    }

    /** @inheritdoc */
    override finalize(context: SohlActionContext): void {
        super.finalize(context);
    }
}

export interface BeingData<
    TLogic extends SohlActorLogic<BeingData> = SohlActorLogic<any>,
> extends SohlActorData<TLogic> {}

function defineBeingDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlActorDataModel.defineSchema(),
        baseMovement: new ArrayField(new NumberField({ initial: 0, min: 0 }), {
            initial: Array(53).fill(0),
        }),
    };
}

type BeingDataSchema = ReturnType<typeof defineBeingDataSchema>;

/**
 * The Foundry VTT data model for the Being actor.
 */
export class BeingDataModel<
        TSchema extends foundry.data.fields.DataSchema = BeingDataSchema,
        TLogic extends BeingLogic<BeingData> = BeingLogic<BeingData>,
    >
    extends SohlActorDataModel<TSchema, TLogic>
    implements BeingData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.Being.DATA"];
    static override readonly kind = ACTOR_KIND.BEING;

    static defineSchema(): foundry.data.fields.DataSchema {
        return defineBeingDataSchema();
    }
}

export class BeingSheet extends SohlActorSheetBase {
    static DEFAULT_OPTIONS: PlainObject = {
        id: "being-sheet",
        tag: "form",
        position: { width: 900, height: 640 },
        classes: ["being"],
        dragDrop: [
            {
                dragSelector: ".item-list .item",
                dropSelector: null,
            },
        ],
    };
}
