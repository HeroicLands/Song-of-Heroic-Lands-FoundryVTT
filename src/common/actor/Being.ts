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

import type { ValueModifier } from "@common/modifier/ValueModifier";
import type { ImpactResult } from "@common/result/ImpactResult";
import type { SuccessTestResult } from "@common/result/SuccessTestResult";
import type { SohlActionContext } from "@common/SohlActionContext";
import {
    SohlActor,
    SohlActorBaseLogic,
    SohlActorData,
    SohlActorDataModel,
    SohlActorLogic,
    SohlActorSheetBase,
} from "@common/actor/SohlActor";
import {
    ACTOR_KIND,
    ITEM_KIND,
    TRAIT_INTENSITY,
} from "@utils/constants";
import type { SohlItem } from "@common/item/SohlItem";

const { StringField } = foundry.data.fields;

/**
 * Logic for the **Being** actor type — a single person, creature, or NPC.
 *
 * A Being is the most detailed actor type in SoHL, representing an individual
 * entity with a full anatomy model (body zones, body parts, body locations),
 * skills, traits, injuries, afflictions, gear, and mystical abilities. Beings
 * are the primary participants in combat, skill tests, and social interactions.
 *
 * @typeParam TData - The Being data interface.
 */
export class BeingLogic<
    TData extends BeingData = BeingData,
> extends SohlActorBaseLogic<TData> {
    /**
     * Overall health state, derived from injury levels across body zones
     *
     * @type {ValueModifier}
     */
    health!: ValueModifier;

    /**
     * Base healing rate, ultimately influenced by traits and treatment
     */
    healingBase!: ValueModifier;

    /**
     * Total number of zones on this being.
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
     * Current shock state, derived from accumulated injuries and other factors.
     *
     * @type {number}
     */
    shockState!: number;

    /**
     * Apply the impact of an attack or effect to this being, calculating the resulting
     * location and damage. If armor or other defenses are unable to fully mitigate the impact,
     * this will return the resulting damage and location as an {@link ImpactResult} that can
     * then be used to apply damage to the being's body zones and parts.
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
    override evaluate(): void {
        super.evaluate();
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
    }
}

export interface BeingData<
    TLogic extends SohlActorLogic<BeingData> = SohlActorLogic<any>,
> extends SohlActorData<TLogic> {}

function defineBeingDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlActorDataModel.defineSchema(),
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
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.Being",
        "SOHL.Actor",
    ];
    static override readonly kind = ACTOR_KIND.BEING;

    static defineSchema(): foundry.data.fields.DataSchema {
        return defineBeingDataSchema();
    }
}

export abstract class BeingSheet extends SohlActorSheetBase {
    static override DEFAULT_OPTIONS = {
        classes: ["being"],
        window: {
            resizable: true,
        },
        position: { width: 900, height: 640 },
        dragDrop: [
            {
                dragSelector: ".item-list .item",
                dropSelector: null,
            },
        ],
    };

    /* -------------------------------------------- */
    /*  Part Context Dispatcher                     */
    /* -------------------------------------------- */

    async _preparePartContext(
        partId: string,
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>
    > {
        switch (partId) {
            case "header":
                return this._prepareHeaderContext(context, options);
            case "tabs":
                return this._prepareTabsContext(context, options);
            case "facade":
                return this._prepareFacadeContext(context, options);
            case "profile":
                return this._prepareProfileContext(context, options);
            case "skills":
                return this._prepareSkillsContext(context, options);
            case "combat":
                return this._prepareCombatContext(context, options);
            case "trauma":
                return this._prepareTraumaContext(context, options);
            case "mysteries":
                return this._prepareMysteriesContext(context, options);
            case "gear":
                return this._prepareGearContext(context, options);
            case "actions":
                return this._prepareActionsContext(context, options);
            case "effects":
                return this._prepareEffectsContext(context, options);
            default:
                return context;
        }
    }

    /* -------------------------------------------- */
    /*  Context Preparation Methods                 */
    /* -------------------------------------------- */

    /** Prepare context for the sheet header: name, image, health, status effects, body parts. */
    async _prepareHeaderContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>,
        _options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>
    > {
        const actor = this.document;
        const logic = actor.logic as BeingLogic;

        // Status effects: check which ones are active
        const statuses = (actor as any).statuses ?? new Set<string>();
        const statusEffects = {
            auralShock: statuses.has("auralShock"),
            sleep: statuses.has("sleep"),
            prone: statuses.has("prone"),
            stunned: statuses.has("stunned"),
            incapacitated: statuses.has("incapacitated"),
            unconscious: statuses.has("unconscious"),
            dead: statuses.has("dead"),
        };

        // Body parts with injury state
        const bodyParts = (actor.allItemTypes[ITEM_KIND.BODYPART] ?? []).map(
            (item: SohlItem) => ({
                id: item.id,
                name: item.name,
                item,
            }),
        );

        return Object.assign(context, {
            actorName: actor.name,
            actorImg: actor.img,
            health: logic?.health,
            shockState: logic?.shockState,
            statusEffects,
            bodyParts,
        });
    }

    /** Prepare context for the Tabs navigation. */
    async _prepareTabsContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>,
        _options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>
    > {
        return context;
    }

    /** Prepare context for the Facade tab: bio image and description. */
    async _prepareFacadeContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>,
        _options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>
    > {
        const system = this.document.system as any;
        return Object.assign(context, {
            bioImage: system.bioImage,
            descriptionHTML: await TextEditor.enrichHTML(
                system.description ?? "",
            ),
        });
    }

    /** Prepare context for the Profile tab: attributes, traits, affiliations, biography. */
    async _prepareProfileContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>,
        _options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>
    > {
        const actor = this.document;
        const traits = actor.allItemTypes[ITEM_KIND.TRAIT] ?? [];

        // Separate attributes (intensity === "attribute") from other traits
        const attributes: SohlItem[] = [];
        const traitGroups: StrictObject<SohlItem[]> = {};

        for (const trait of traits) {
            const data = trait.system as any;
            if (data.intensity === TRAIT_INTENSITY.ATTRIBUTE) {
                attributes.push(trait);
            } else {
                const subType = data.subType ?? "other";
                (traitGroups[subType] ??= []).push(trait);
            }
        }

        const affiliations =
            actor.allItemTypes[ITEM_KIND.AFFILIATION] ?? [];

        const system = this.document.system as any;
        return Object.assign(context, {
            attributes,
            traitGroups,
            affiliations,
            biographyHTML: await TextEditor.enrichHTML(
                system.biography ?? "",
            ),
        });
    }

    /** Prepare context for the Skills tab: skills grouped by subType. */
    async _prepareSkillsContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>,
        _options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>
    > {
        const skills = this.document.allItemTypes[ITEM_KIND.SKILL] ?? [];
        const skillGroups: StrictObject<SohlItem[]> = {};

        for (const skill of skills) {
            const subType = (skill.system as any).subType ?? "other";
            (skillGroups[subType] ??= []).push(skill);
        }

        // Sort skills within each group by name
        for (const group of Object.values(skillGroups)) {
            group.sort((a: SohlItem, b: SohlItem) =>
                a.name.localeCompare(b.name),
            );
        }

        return Object.assign(context, { skillGroups });
    }

    /**
     * Prepare context for the Combat tab: weapons with strike modes,
     * combat techniques, and the full body anatomy structure.
     */
    async _prepareCombatContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>,
        _options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>
    > {
        const actor = this.document;

        // Equipped weapons with their nested strike modes
        const weapons = actor.allItemTypes[ITEM_KIND.WEAPONGEAR] ?? [];
        const meleeWeapons: any[] = [];
        const missileWeapons: any[] = [];

        for (const weapon of weapons) {
            if (!(weapon.system as any).isEquipped) continue;

            const meleeStrikeModes: SohlItem[] = [];
            const missileStrikeModes: SohlItem[] = [];

            // Find nested strike modes
            for (const item of actor.allItems.values()) {
                if ((item.system as any).nestedIn !== weapon.id) continue;
                if (item.type === ITEM_KIND.MELEEWEAPONSTRIKEMODE) {
                    meleeStrikeModes.push(item);
                } else if (
                    item.type === ITEM_KIND.MISSILEWEAPONSTRIKEMODE
                ) {
                    missileStrikeModes.push(item);
                }
            }

            if (meleeStrikeModes.length > 0) {
                meleeWeapons.push({
                    weapon,
                    strikeModes: meleeStrikeModes,
                });
            }
            if (missileStrikeModes.length > 0) {
                missileWeapons.push({
                    weapon,
                    strikeModes: missileStrikeModes,
                });
            }
        }

        // Combat techniques
        const combatTechniques =
            actor.allItemTypes[ITEM_KIND.COMBATTECHNIQUESTRIKEMODE] ?? [];

        // Body anatomy hierarchy: zones → parts → locations
        const bodyZones = (
            actor.allItemTypes[ITEM_KIND.BODYZONE] ?? []
        ).map((zone: SohlItem) => {
            const parts = (
                actor.allItemTypes[ITEM_KIND.BODYPART] ?? []
            ).filter(
                (part: SohlItem) =>
                    (part.system as any).nestedIn === zone.id,
            );

            return {
                zone,
                parts: parts.map((part: SohlItem) => {
                    const locations = (
                        actor.allItemTypes[ITEM_KIND.BODYLOCATION] ?? []
                    ).filter(
                        (loc: SohlItem) =>
                            (loc.system as any).nestedIn === part.id,
                    );
                    return { part, locations };
                }),
            };
        });

        return Object.assign(context, {
            meleeWeapons,
            missileWeapons,
            combatTechniques,
            bodyZones,
        });
    }

    /** Prepare context for the Trauma tab: injuries and afflictions. */
    async _prepareTraumaContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>,
        _options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>
    > {
        const actor = this.document;
        const logic = actor.logic as BeingLogic;

        const injuries = actor.allItemTypes[ITEM_KIND.INJURY] ?? [];
        const afflictions =
            actor.allItemTypes[ITEM_KIND.AFFLICTION] ?? [];

        // Group afflictions by subType
        const afflictionGroups: StrictObject<SohlItem[]> = {};
        for (const affliction of afflictions) {
            const subType =
                (affliction.system as any).subType ?? "other";
            (afflictionGroups[subType] ??= []).push(affliction);
        }

        return Object.assign(context, {
            injuries,
            afflictionGroups,
            shockState: logic?.shockState,
        });
    }

    /**
     * Prepare context for the Mysteries tab: mysteries, mystical abilities,
     * philosophies, and domains.
     */
    async _prepareMysteriesContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>,
        _options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>
    > {
        const actor = this.document;

        // Mysteries grouped by subType
        const mysteries = actor.allItemTypes[ITEM_KIND.MYSTERY] ?? [];
        const mysteryGroups: StrictObject<SohlItem[]> = {};
        for (const mystery of mysteries) {
            const subType = (mystery.system as any).subType ?? "other";
            (mysteryGroups[subType] ??= []).push(mystery);
        }

        // Mystical abilities grouped by subType
        const abilities =
            actor.allItemTypes[ITEM_KIND.MYSTICALABILITY] ?? [];
        const abilityGroups: StrictObject<SohlItem[]> = {};
        for (const ability of abilities) {
            const subType = (ability.system as any).subType ?? "other";
            (abilityGroups[subType] ??= []).push(ability);
        }

        // Philosophies with their associated domains
        const philosophies =
            actor.allItemTypes[ITEM_KIND.PHILOSOPHY] ?? [];
        const domains = actor.allItemTypes[ITEM_KIND.DOMAIN] ?? [];

        const philosophyEntries = philosophies.map(
            (philosophy: SohlItem) => {
                const assocDomains = domains.filter(
                    (d: SohlItem) =>
                        (d.system as any).philosophyCode ===
                        (philosophy.system as any).shortcode,
                );
                return { philosophy, domains: assocDomains };
            },
        );

        // Mystical devices
        const mysticalDevices =
            actor.allItemTypes[ITEM_KIND.MYSTICALDEVICE] ?? [];

        return Object.assign(context, {
            mysteryGroups,
            abilityGroups,
            philosophyEntries,
            mysticalDevices,
        });
    }

    /**
     * Prepare context for the Gear tab: containers with nested items
     * and encumbrance totals.
     */
    async _prepareGearContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>,
        _options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>
    > {
        const actor = this.document;

        // Build container hierarchy
        const containers: any[] = [];
        const containerGear =
            actor.allItemTypes[ITEM_KIND.CONTAINERGEAR] ?? [];

        // Virtual "On Body" container for ungrouped gear
        const onBodyItems: SohlItem[] = [];

        // Collect all gear items
        const gearTypes = [
            ITEM_KIND.ARMORGEAR,
            ITEM_KIND.WEAPONGEAR,
            ITEM_KIND.MISCGEAR,
            ITEM_KIND.CONCOCTIONGEAR,
            ITEM_KIND.PROJECTILEGEAR,
            ITEM_KIND.CONTAINERGEAR,
        ];
        const allGear: SohlItem[] = [];
        for (const type of gearTypes) {
            allGear.push(...(actor.allItemTypes[type] ?? []));
        }

        // Sort gear into containers
        const containerIds = new Set(
            containerGear.map((c: SohlItem) => c.id),
        );
        for (const gear of allGear) {
            const nestedIn = (gear.system as any).nestedIn;
            if (nestedIn && containerIds.has(nestedIn)) continue; // handled by container
            if (!nestedIn || !containerIds.has(nestedIn)) {
                onBodyItems.push(gear);
            }
        }

        // Build each container's content list
        for (const container of containerGear) {
            const items = allGear.filter(
                (g: SohlItem) =>
                    (g.system as any).nestedIn === container.id,
            );
            items.sort((a: SohlItem, b: SohlItem) =>
                a.name.localeCompare(b.name),
            );
            containers.push({ container, items });
        }

        onBodyItems.sort((a: SohlItem, b: SohlItem) =>
            a.name.localeCompare(b.name),
        );

        return Object.assign(context, {
            containers,
            onBodyItems,
        });
    }

    /** Prepare context for the Actions tab: actor-level actions. */
    async _prepareActionsContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>,
        _options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>
    > {
        const actions = this.document.logic?.actions ?? [];
        return Object.assign(context, { actions });
    }

    /** Prepare context for the Effects tab: own and transferred effects. */
    async _prepareEffectsContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>,
        _options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlActor>
    > {
        const effects =
            (this.document as any).effects?.contents ?? [];
        const trxEffects: PlainObject = {};
        const transferredEffects =
            (this.document as any).transferredEffects;
        if (transferredEffects) {
            for (const effect of transferredEffects) {
                if (!effect.disabled) {
                    trxEffects[effect.id] = effect;
                }
            }
        }
        return Object.assign(context, { effects, trxEffects });
    }
}
