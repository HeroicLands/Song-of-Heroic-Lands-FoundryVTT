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

import type { MasteryLevelModifier } from "@common/modifier/MasteryLevelModifier";
import type { ValueModifier } from "@common/modifier/ValueModifier";
import type { Injury } from "@common/item/Injury";
import type { SohlItem } from "@common/item/SohlItem";
import {
    SohlActor,
    SohlActorDataModel,
    SohlActorSheetBase,
} from "@common/actor/SohlActor";
import type { ImpactResult } from "@common/result/ImpactResult";
import type { SuccessTestResult } from "@common/result/SuccessTestResult";
import type { SohlEventContext } from "@common/event/SohlEventContext";
import { SohlMap } from "@utils/collection/SohlMap";
import { ACTOR_KIND } from "@utils/constants";

/**
 * The business logic class for the Entity actor.
 */
export class Entity extends SohlActor.BaseLogic implements Entity.Logic {
    /**
     * Represents the health of a entity.
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
     * Represents the base body weight of a entity without any gear
     *
     * @type {ValueModifier}
     */
    bodyWeight!: ValueModifier;

    /**
     * Represents the level of shock the character is experiencing.
     *
     * @type {number}
     */
    shockState!: Injury.Shock;

    fate!: MasteryLevelModifier;

    engagedOpponents!: ValueModifier;

    domains!: StrictObject<SohlItem[]>;

    magicMod!: ValueModifier;

    // getIntrinsicActions(_data = this, defaultAction = null, actions = []) {
    //     return super.getIntrinsicActions(
    //         _data,
    //         defaultAction,
    //         Utility.uniqueActions(
    //             actions,
    //             [
    //                 SuccessTestResult.TEST_TYPE.IMPROVESDR,
    //                 SuccessTestResult.TEST_TYPE.SKILL,
    //                 SuccessTestResult.TEST_TYPE.SHOCK,
    //                 SuccessTestResult.TEST_TYPE.STUMBLE,
    //                 SuccessTestResult.TEST_TYPE.FUMBLE,
    //                 SuccessTestResult.TEST_TYPE.MORALE,
    //                 SuccessTestResult.TEST_TYPE.FEAR,
    //                 SuccessTestResult.TEST_TYPE.AFFLICTIONCONTRACT,
    //                 SuccessTestResult.TEST_TYPE.FATIGUE,
    //                 SuccessTestResult.TEST_TYPE.AFFLICTIONCOURSE,
    //                 SuccessTestResult.TEST_TYPE.TREATMENT,
    //                 SuccessTestResult.TEST_TYPE.DIAGNOSIS,
    //                 SuccessTestResult.TEST_TYPE.HEAL,
    //                 SuccessTestResult.TEST_TYPE.BLEEDINGSTOPPAGE,
    //                 SuccessTestResult.TEST_TYPE.BLOODLOSSADVANCE,
    //             ].map((a) => SuccessTestResult.testTypes[a]),
    //         ),
    //     );
    // }

    async improveWithSDR(context: SohlEventContext): Promise<void> {
        return;
    }

    async successTest(
        context: SohlEventContext,
    ): Promise<SuccessTestResult | null> {
        return null;
    }

    async fatigueTest(
        context: SohlEventContext,
    ): Promise<SuccessTestResult | null> {
        return null;
    }

    async courseTest(
        context: SohlEventContext,
    ): Promise<SuccessTestResult | null> {
        return null;
    }

    async treatmentTest(
        context: SohlEventContext,
    ): Promise<SuccessTestResult | null> {
        return null;
    }

    async diagnosisTest(
        context: SohlEventContext,
    ): Promise<SuccessTestResult | null> {
        return null;
    }

    async healingTest(
        context: SohlEventContext,
    ): Promise<SuccessTestResult | null> {
        return null;
    }

    async bleedingStoppageTest(
        context: SohlEventContext,
    ): Promise<SuccessTestResult | null> {
        return null;
    }

    async bloodlossAdvanceTest(
        context: SohlEventContext,
    ): Promise<SuccessTestResult | null> {
        return null;
    }

    async calcImpact(context: SohlEventContext): Promise<ImpactResult | null> {
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
        context: SohlEventContext,
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
        context: SohlEventContext,
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
        context: SohlEventContext,
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
        context: SohlEventContext,
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
        context: SohlEventContext,
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

    async _createTestItem(
        context: SohlEventContext,
    ): Promise<SuccessTestResult | null> {
        // let createItem = (game as any).settings.get("sohl", "recordTrauma");
        // if (!options.testResult.isSuccess && createItem !== "disable") {
        //     if (createItem === "ask") {
        //         createItem = await Dialog.confirm({
        //             title: _l(
        //                 "SOHL.Actor.entity._createTestItem.dialog.title",
        //                 {
        //                     label: options.testResult.item.label,
        //                 },
        //             ),
        //             content: _l(
        //                 "SOHL.Actor.entity._createTestItem.dialog.content",
        //                 {
        //                     label: options.testResult.item.label,
        //                     name: this.name,
        //                 },
        //             ),
        //             yes: () => {
        //                 return "enable";
        //             },
        //         });
        //     }
        //     if (createItem === "enable") {
        //         await SohlItem.create(options.testResult.item.toObject(), {
        //             parent: this.item,
        //             clean: true,
        //         });
        //     }
        // }
        // return options.testResult;
        return null;
    }

    async contractAfflictionTest(
        context: SohlEventContext,
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
    async opposedTestResume(context: SohlEventContext): Promise<void> {
        // let { opposedTestResult } = options;
        // if (!opposedTestResult) {
        //     throw new Error("Must supply opposedTestResult");
        // }
        // const sourceItem = opposedTestResult.sourceTestResult.item;
        // const skill = await Utility.getOpposedItem({
        //     actor: this.parent,
        //     label: _l(
        //         "SOHL.Actor.entity.opposedTestResume.getOpposedItem.label",
        //     ),
        //     title: _l(
        //         "SOHL.Actor.entity.opposedTestResume.getOpposedItem.title",
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
        //                 "SOHL.Actor.entity.opposedTestResume.getOpposedItem.attributeLabel",
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
        //             "SOHL.Actor.entity.opposedTestResume.getOpposedItem.noUsableSkills",
        //             { name: token.name },
        //         ),
        //     );
        //     return null;
        // } else {
        //     skill.system.execute("opposedTestResume", options);
        // }
        return;
    }

    /** @inheritdoc */
    override initialize(context: SohlEventContext): void {
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
    override evaluate(context: SohlEventContext): void {
        super.evaluate(context);
    }

    /** @inheritdoc */
    override finalize(context: SohlEventContext): void {
        super.finalize(context);
    }
}

export namespace Entity {
    export const Kind = ACTOR_KIND.ENTITY;

    export interface Logic<
        TData extends SohlActor.Data<any> = SohlActor.Data<any>,
    > extends SohlActor.Logic<TData> {
        health: ValueModifier;
        healingBase: ValueModifier;
        zoneSum: number;
        bodyWeight: ValueModifier;
        shockState: Injury.Shock;
        fate: ValueModifier;
        engagedOpponents: ValueModifier;
        domains: StrictObject<SohlItem[]>;
        virtualItems: SohlMap<string, SohlItem>;
        improveWithSDR(context: SohlEventContext): Promise<void>;
        successTest(
            context: SohlEventContext,
        ): Promise<SuccessTestResult | null>;
        fatigueTest(
            context: SohlEventContext,
        ): Promise<SuccessTestResult | null>;
        courseTest(
            context: SohlEventContext,
        ): Promise<SuccessTestResult | null>;
        treatmentTest(
            context: SohlEventContext,
        ): Promise<SuccessTestResult | null>;
        diagnosisTest(
            context: SohlEventContext,
        ): Promise<SuccessTestResult | null>;
        healingTest(
            context: SohlEventContext,
        ): Promise<SuccessTestResult | null>;
        bleedingStoppageTest(
            context: SohlEventContext,
        ): Promise<SuccessTestResult | null>;
        bloodlossAdvanceTest(
            context: SohlEventContext,
        ): Promise<SuccessTestResult | null>;
        calcImpact(context: SohlEventContext): Promise<ImpactResult | null>;
        shockTest(context: SohlEventContext): Promise<SuccessTestResult | null>;
        stumbleTest(
            context: SohlEventContext,
        ): Promise<SuccessTestResult | null>;
        fumbleTest(
            context: SohlEventContext,
        ): Promise<SuccessTestResult | null>;
        moraleTest(
            context: SohlEventContext,
        ): Promise<SuccessTestResult | null>;
        fearTest(context: SohlEventContext): Promise<SuccessTestResult | null>;
        contractAfflictionTest(
            context: SohlEventContext,
        ): Promise<SuccessTestResult | null>;
        opposedTestResume(context: SohlEventContext): Promise<void>;
    }

    export interface Data<
        TLogic extends SohlActor.Logic<Data> = SohlActor.Logic<any>,
    > extends SohlActor.Data<TLogic> {}
}

function defineEntityDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlActorDataModel.defineSchema(),
    };
}

type EntityDataSchema = ReturnType<typeof defineEntityDataSchema>;

/**
 * The Foundry VTT data model for the Entity actor.
 */
export class EntityDataModel<
        TSchema extends foundry.data.fields.DataSchema = EntityDataSchema,
        TLogic extends Entity.Logic<Entity.Data> = Entity.Logic<Entity.Data>,
    >
    extends SohlActorDataModel<TSchema, TLogic>
    implements Entity.Data<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["ENTITY"];
    static override readonly kind = Entity.Kind;

    static defineSchema(): foundry.data.fields.DataSchema {
        return defineEntityDataSchema();
    }
}

export class EntitySheet extends SohlActorSheetBase {
    static override PARTS = {
        ...super.PARTS,
        properties: {
            template: "systems/sohl/templates/actor/entity.hbs",
        },
    };
}
