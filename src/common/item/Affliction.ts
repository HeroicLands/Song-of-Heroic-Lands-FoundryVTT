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

import { SohlItem } from "@common/item";
import { SubTypeMixin } from "@common/item";
import { RegisterClass } from "@utils/decorators";
import { defineType, SohlContextMenu, toHTMLString } from "@utils";
import { SohlDataModel, SohlLogic } from "@common";
import { ValueModifier } from "@common/modifier";
import { SohlAction } from "@common/event";
import { SuccessTestResult } from "@common/result";
const { StringField, BooleanField, NumberField } = foundry.data.fields;

const kAffliction = Symbol("Affliction");
const kData = Symbol("Affliction.Data");

@RegisterClass(
    new SohlLogic.Element({
        kind: "Affliction",
        defaultAction: Affliction.INTRINSIC_ACTION.HEALINGTEST.id,
        intrinsicActions: Affliction.IntrinsicActions,
    }),
)
export class Affliction
    extends SubTypeMixin(SohlLogic)
    implements Affliction.Logic
{
    declare readonly parent: Affliction.Data;
    isDormant!: boolean;
    isTreated!: boolean;
    diagnosisBonus!: ValueModifier;
    level!: ValueModifier;
    healingRate!: ValueModifier;
    contagionIndex!: ValueModifier;
    transmission!: Affliction.Transmission;
    readonly [kAffliction] = true;

    static isA(obj: unknown): obj is Affliction {
        return typeof obj === "object" && obj !== null && kAffliction in obj;
    }

    get canTransmit(): boolean {
        // TODO - Implement Affliction canTransmit
        return true;
    }

    get canContract(): boolean {
        // TODO - Implement Affliction canContract
        return true;
    }

    get hasCourse(): boolean {
        // TODO - Implement Affliction hasCourse
        return true;
    }

    get canTreat(): boolean {
        // TODO - Implement Affliction canTreat
        return true;
    }

    get canHeal(): boolean {
        // TODO - Implement Affliction canHeal
        return true;
    }

    async transmit(context: SohlAction.Context): Promise<void> {
        const {
            type = `affliction-${(this.item as any)?.name}-transmit`,
            title = `${this.label} Transmit`,
        } = context;
        // TODO - Affliction Transmit
        sohl.log.warn("Affliction Transmit Not Implemented");
    }

    async contractTest(
        context: SohlAction.Context,
    ): Promise<Nullable<SuccessTestResult>> {
        const {
            type = `${this.label}-contract-test`,
            title = `${this.label} Contract Test`,
        } = context;

        // TODO - Affliction Contract Test
        throw new Error("Affliction Contract Test Not Implemented");
    }

    async courseTest(
        context: SohlAction.Context,
    ): Promise<Nullable<SuccessTestResult>> {
        const {
            type = `${this.label}-course-test`,
            title = `${this.label} Course Test`,
        } = context;

        // TODO - Affliction Course Test
        throw new Error("Affliction Course Test Not Implemented");
    }

    async diagnosisTest(
        context: SohlAction.Context,
    ): Promise<Nullable<SuccessTestResult>> {
        const {
            type = `${this.label}-diagnosis-test`,
            title = `${this.label} Diagnosis Test`,
        } = context;

        // TODO - Affliction Diagnosis Test
        throw new Error("Affliction Diagnosis Test Not Implemented");
    }

    async treatmentTest(
        context: SohlAction.Context,
    ): Promise<Nullable<SuccessTestResult>> {
        const {
            type = `${this.label}-treatment-test`,
            title = `${this.label} Treatment Test`,
        } = context;

        // TODO - Affliction Treatment Test
        throw new Error("Affliction Treatment Test Not Implemented");
    }

    async healingTest(
        context: SohlAction.Context,
    ): Promise<Nullable<SuccessTestResult>> {
        const {
            type = `${this.label}-healing-test`,
            title = `${this.label} Healing Test`,
        } = context;

        // TODO - Affliction Healing Test
        throw new Error("Affliction Healing Test Not Implemented");
    }

    /** @override */
    initialize(context: SohlAction.Context): void {
        this.isDormant = false;
        this.isTreated = false;
        this.diagnosisBonus = sohl.game.CONFIG.ValueModifier(
            {},
            { parent: this },
        );
        this.level = sohl.game.CONFIG.ValueModifier({}, { parent: this });
        this.healingRate = sohl.game.CONFIG.ValueModifier({}, { parent: this });
        this.contagionIndex = sohl.game.CONFIG.ValueModifier(
            {},
            { parent: this },
        );
        this.transmission = Affliction.TRANSMISSION.NONE;

        this.healingRate = sohl.game.CONFIG.ValueModifier(this);
        if (this.parent.healingRateBase === -1) {
            this.healingRate.disabled = "No Healing Rate";
        } else {
            this.healingRate.base = this.parent.healingRateBase;
        }
        this.contagionIndex = sohl.game.CONFIG.ValueModifier(this, {
            base: this.parent.contagionIndexBase,
        });
        this.level = sohl.game.CONFIG.ValueModifier(this, {
            base: this.parent.levelBase,
        });
    }

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context): void {}

    /** @inheritdoc */
    override finalize(context: SohlAction.Context): void {}
}

export namespace Affliction {
    /**
     * The type moniker for the Affliction item.
     */
    export const Kind = "affliction";

    /**
     * The FontAwesome icon class for the Affliction item.
     */
    export const IconCssClass = "fas fa-face-nauseated";

    /**
     * The image path for the Affliction item.
     */
    export const Image = "systems/sohl/assets/icons/sick.svg";

    /**
     * Constants for the Heal Rate of an Affliction.
     */
    export const HealRate: StrictObject<number> = {
        NONE: -1,
        DEFEATED: 6,
        DEAD: 0,
    } as const;

    export const {
        kind: SUBTYPE,
        values: SubTypes,
        isValue: isSubType,
        labels: SubTypeLabels,
    } = defineType("Affliction.SUBTYPE", {
        PRIVATION: "privation",
        FATIGUE: "fatigue",
        DISEASE: "disease",
        INFECTION: "infection",
        POISONTOXIN: "poisontoxin",
        FEAR: "fear",
        MORALE: "morale",
        SHADOW: "shadow",
        PSYCHE: "psyche",
        AURALSHOCK: "auralshock",
    });
    export type SubType = (typeof SUBTYPE)[keyof typeof SUBTYPE];

    export const {
        kind: TRANSMISSION,
        values: Transmissions,
        isValue: isTransmission,
        labels: TransmissionLabels,
    } = defineType("Affliction.TRANSMISSION", {
        NONE: "none",
        AIRBORNE: "airborne",
        CONTACT: "contact",
        BODYFLUID: "bodyfluid",
        INJESTED: "injested",
        PROXIMITY: "proximity",
        VECTOR: "vector",
        PERCEPTION: "perception",
        ARCANE: "arcane",
        DIVINE: "divine",
        SPIRIT: "spirit",
    });
    export type Transmission = (typeof TRANSMISSION)[keyof typeof TRANSMISSION];

    export const {
        kind: FATIGUE_CATEGORY,
        values: FatigueCategories,
        isValue: isFatigueCategory,
        labels: FatigueCategoryLabels,
    } = defineType("Affliction.FATIGUE_CATEGORY", {
        WINDEDNESS: "windedness",
        WEARINESS: "weariness",
        WEAKNESS: "weakness",
    });
    export type FatigueCategory =
        (typeof FATIGUE_CATEGORY)[keyof typeof FATIGUE_CATEGORY];

    export const {
        kind: PRIVATION_CATEGORY,
        values: PrivationCategories,
        isValue: isPrivationCategory,
        labels: PrivationCategoryLabels,
    } = defineType("Affliction.PRIVATION_CATEGORY", {
        ASPHIXIA: "asphixia",
        COLD: "cold",
        HEAT: "heat",
        STARVATION: "starvation",
        DEHYDRATION: "dehydration",
        SLEEP_DEPRIVATION: "nosleep",
    });
    export type PrivationCategory =
        (typeof PRIVATION_CATEGORY)[keyof typeof PRIVATION_CATEGORY];

    export const {
        kind: FEAR_LEVEL,
        values: FearLevels,
        isValue: isFearLevel,
        labels: FearLevelLabels,
    } = defineType("Affliction.FEAR_LEVEL", {
        NONE: 0,
        BRAVE: 1,
        STEADY: 2,
        AFRAID: 3,
        TERRIFIED: 4,
        CATATONIC: 5,
    });
    export type FearLevel = (typeof FEAR_LEVEL)[keyof typeof FEAR_LEVEL];

    export const {
        kind: MORALE_LEVEL,
        values: MoraleLevels,
        isValue: isMoraleLevel,
        labels: MoraleLevelLabels,
    } = defineType("Affliction.MORALE_LEVEL", {
        NONE: 0,
        BRAVE: 1,
        STEADY: 2,
        WITHDRAWING: 3,
        ROUTED: 4,
        CATATONIC: 5,
    });
    export type MoraleLevel = (typeof MORALE_LEVEL)[keyof typeof MORALE_LEVEL];

    export const {
        kind: INTRINSIC_ACTION,
        values: IntrinsicActions,
        isValue: isIntrinsicAction,
    } = defineType("SOHL.Affliction.INTRINSIC_ACTION", {
        TRANSMITAFFLICTION: new SohlContextMenu.Entry({
            id: "transmit",
            functionName: "transmitAffliction",
            name: "Transmit Affliction",
            iconFAClass: "fas fa-head-side-cough",
            condition: (header: HTMLElement) => {
                const item = SohlContextMenu._getContextItem(
                    header,
                ) as SohlItem<Affliction>;
                return item?.system.logic.canTransmit;
            },
            group: SohlContextMenu.SORT_GROUP.ESSENTIAL,
        }),
        CONTRACTAFFLICTIONTEST: new SohlContextMenu.Entry({
            id: "contract",
            functionName: "contractAfflictionTest",
            name: "Contract Affliction Test",
            iconFAClass: "fas fa-virus",
            condition: () => true,
            group: SohlContextMenu.SORT_GROUP.GENERAL,
        }),
        COURSETTEST: new SohlContextMenu.Entry({
            id: "course",
            functionName: "courseTest",
            name: "Course Test",
            iconFAClass: "fas fa-heart-pulse",
            condition: (header: HTMLElement) => {
                // FIXME: This is a temporary fix to allow opposed tests to be
                // started from the item header. It should be replaced with a
                // proper implementation that allows opposed tests to be started
                // from any item in the context menu.
                return true;
                // const item = cast<BaseItem>(
                //     SohlContextMenu._getContextItem(header),
                // );
                // if (item?.system.isDormant) return false;
                // const endurance = item?.actor?.getTraitByAbbrev("end");
                // return endurance && !endurance.system.$masteryLevel.disabled;
            },
            group: SohlContextMenu.SORT_GROUP.ESSENTIAL,
        }),
        FATIGUETEST: new SohlContextMenu.Entry({
            id: SUBTYPE.FATIGUE,
            functionName: "fatigueTest",
            name: "Fatigue Test",
            iconFAClass: "fas fa-face-downcast-sweat",
            condition: () => true,
            group: SohlContextMenu.SORT_GROUP.GENERAL,
        }),
        MORALETEST: new SohlContextMenu.Entry({
            id: SUBTYPE.MORALE,
            name: "Morale Test",
            iconFAClass: "far fa-people-group",
            condition: () => true,
            group: SohlContextMenu.SORT_GROUP.GENERAL,
        }),
        FEARTEST: new SohlContextMenu.Entry({
            id: SUBTYPE.FEAR,
            functionName: "fearTest",
            name: "Fear Test",
            iconFAClass: "far fa-face-scream",
            condition: () => true,
            group: SohlContextMenu.SORT_GROUP.GENERAL,
        }),

        TREATMENTTEST: new SohlContextMenu.Entry({
            id: "treatment",
            functionName: "treatmentTest",
            name: "Treatment Test",
            iconFAClass: "fas fa-staff-snake",
            condition: (header: HTMLElement) => {
                // FIXME: This is a temporary fix to allow opposed tests to be
                // started from the item header. It should be replaced with a
                // proper implementation that allows opposed tests to be started
                // from any item in the context menu.
                return true;
                // const item = cast<BaseItem>(
                //     SohlContextMenu._getContextItem(header),
                // );
                // if (item?.system.isBleeding) return false;
                // const physician = item?.actor?.getSkillByAbbrev("pysn");
                // return physician && !physician.system.$masteryLevel.disabled;
            },
            group: SohlContextMenu.SORT_GROUP.ESSENTIAL,
        }),
        DIAGNOSISTEST: new SohlContextMenu.Entry({
            id: "diagnosis",
            functionName: "diagnosisTest",
            name: "Diagnosis Test",
            iconFAClass: "fas fa-stethoscope",
            condition: (header: HTMLElement) => {
                const item = SohlContextMenu._getContextItem(header);
                return !!item && !item.system.isTreated;
            },
            group: SohlContextMenu.SORT_GROUP.ESSENTIAL,
        }),
        HEALINGTEST: new SohlContextMenu.Entry({
            id: "healing",
            functionName: "healingTest",
            name: "Healing Test",
            iconFAClass: "fas fa-heart-pulse",
            condition: (header: HTMLElement) => {
                // FIXME: This is a temporary fix to allow opposed tests to be
                // started from the item header. It should be replaced with a
                // proper implementation that allows opposed tests to be started
                // from any item in the context menu.
                return true;
                // const item = cast<BaseItem>(
                //     SohlContextMenu._getContextItem(header),
                // );
                // if (item?.system.isBleeding) return false;
                // const endurance = item?.actor?.getTraitByAbbrev("end");
                // return endurance && !endurance.system.$masteryLevel.disabled;
            },
            group: SohlContextMenu.SORT_GROUP.ESSENTIAL,
        }),
    } as StrictObject<SohlContextMenu.Entry>);
    export type IntrinsicAction =
        (typeof INTRINSIC_ACTION)[keyof typeof INTRINSIC_ACTION];

    export interface Logic extends SohlLogic.Logic {
        readonly parent: Affliction.Data;
        readonly [kAffliction]: true;
        get canTransmit(): boolean;
        get canContract(): boolean;
        get hasCourse(): boolean;
        get canTreat(): boolean;
        get canHeal(): boolean;
        transmit(context: SohlAction.Context): Promise<void>;
        contractTest(
            context: SohlAction.Context,
        ): Promise<Nullable<SuccessTestResult>>;
        courseTest(
            context: SohlAction.Context,
        ): Promise<Nullable<SuccessTestResult>>;
        diagnosisTest(
            context: SohlAction.Context,
        ): Promise<Nullable<SuccessTestResult>>;
        treatmentTest(
            context: SohlAction.Context,
        ): Promise<Nullable<SuccessTestResult>>;
        healingTest(
            context: SohlAction.Context,
        ): Promise<Nullable<SuccessTestResult>>;
    }

    export interface Data extends SubTypeMixin.Data<SubType>, SohlItem.Data {
        readonly [kData]: true;
        get logic(): SubTypeMixin.Logic<SubType>;
        category: string;
        isDormant: boolean;
        isTreated: boolean;
        diagnosisBonusBase: number;
        levelBase: number;
        healingRateBase: number;
        contagionIndexBase: number;
        transmission: Transmission;
    }

    export namespace Data {
        export function isA(
            obj: unknown,
            subType?: Affliction.SubType,
        ): obj is Data {
            return (
                typeof obj === "object" &&
                obj !== null &&
                kData in obj &&
                (subType ? (obj as Data).subType === subType : true)
            );
        }
    }

    const DataModelShape = SubTypeMixin.DataModel<
        typeof SohlItem.DataModel,
        Affliction.SubType,
        typeof Affliction.SubTypes
    >(
        SohlItem.DataModel,
        Affliction.SubTypes,
    ) as unknown as Constructor<Affliction.Data> & SohlItem.DataModel.Statics;

    @RegisterClass(
        new SohlDataModel.Element({
            kind: Kind,
            ctor: DataModel,
            logicClass: Affliction,
            iconCssClass: IconCssClass,
            img: Image,
            schemaVersion: "0.6.0",
            subTypes: SubTypes,
        }),
    )
    export class DataModel extends DataModelShape {
        readonly [kData] = true;
        static override readonly LOCALIZATION_PREFIXES = ["Affliction"];
        declare subType: SubType;
        declare category: string;
        declare isDormant: boolean;
        declare isTreated: boolean;
        declare diagnosisBonusBase: number;
        declare levelBase: number;
        declare healingRateBase: number;
        declare contagionIndexBase: number;
        declare transmission: Transmission;

        static isA(obj: unknown): obj is DataModel {
            return typeof obj === "object" && obj !== null && kData in obj;
        }

        get logic(): SubTypeMixin.Logic<SubType> {
            return super.logic as SubTypeMixin.Logic<SubType>;
        }

        static defineSchema(): foundry.data.fields.DataSchema {
            return {
                ...super.defineSchema(),
                isDormant: new BooleanField({ initial: false }),
                isTreated: new BooleanField({ initial: false }),
                diagnosisBonusBase: new NumberField({
                    integer: true,
                    initial: 0,
                }),
                levelBase: new NumberField({
                    integer: true,
                    initial: 0,
                    min: 0,
                }),
                healingRateBase: new NumberField({
                    integer: true,
                    initial: HealRate.NONE,
                    min: HealRate.NONE,
                }),
                contagionIndexBase: new NumberField({
                    integer: true,
                    initial: 0,
                    min: 0,
                }),
                transmission: new StringField({
                    initial: TRANSMISSION.NONE,
                    required: true,
                    choices: Transmissions,
                }),
            };
        }
    }

    export class Sheet extends SohlItem.Sheet {
        static override readonly PARTS: StrictObject<foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
            fvtt.utils.mergeObject(super.PARTS, {
                properties: {
                    template: "systems/sohl/templates/item/affliction.hbs",
                },
            });
    }
}
