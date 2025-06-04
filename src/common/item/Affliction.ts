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
import {
    ActionContext,
    CONTEXTMENU_SORT_GROUP,
    defineType,
    HTMLString,
    SohlClassRegistry,
    SohlContextMenu,
    SohlContextMenuEntry,
} from "@utils";
import { SohlDataModel, SohlPerformer } from "@common";
import { ValueModifier } from "@common/modifier";
import { SohlAction } from "@common/event";
const { StringField, BooleanField, NumberField } = foundry.data.fields;

const kAffliction = Symbol("Affliction");
const kDataModel = Symbol("Affliction.DataModel");

@RegisterClass(
    new SohlPerformer.Element({
        kind: "Affliction",
        defaultAction: Affliction.IntrinsicActions.HEALINGTEST.id,
        intrinsicActions: Object.values(Affliction.IntrinsicActions),
    }),
)
export class Affliction extends SohlPerformer<Affliction.Data> {
    isDormant: boolean;
    isTreated: boolean;
    diagnosisBonus: ValueModifier;
    level: ValueModifier;
    healingRate: ValueModifier;
    contagionIndex: ValueModifier;
    transmission: Affliction.Transmission;

    readonly [kAffliction] = true;

    static isA(obj: unknown): obj is Affliction {
        return typeof obj === "object" && obj !== null && kAffliction in obj;
    }

    constructor(
        parent: Affliction.Data,
        data: PlainObject = {},
        options: PlainObject = {},
    ) {
        super(parent, data, options);
        this.isDormant = data.isDormant || false;
        this.isTreated = data.isTreated || false;
        this.diagnosisBonus = data.diagnosisBonusBase || 0;
        this.level = data.levelBase || 0;
        this.healingRate = data.healingRateBase || 0;
        this.contagionIndex = data.contagionIndexBase || 0;
        this.transmission = data.transmission || Affliction.TRANSMISSION.NONE;
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

    transmit(context: SohlAction.Context = {}): void {
        const {
            type = `affliction-${(this.item as any)?.name}-transmit`,
            title = `${this.label} Transmit`,
        } = context;
        // TODO - Affliction Transmit
        sohl.log.warn("Affliction Transmit Not Implemented");
    }

    contractTest(context: SohlAction.Context = {}): void {
        const {
            type = `${this.label}-contract-test`,
            title = `${this.label} Contract Test`,
        } = context;

        // TODO - Affliction Contract Test
        sohl.log.warn("Affliction Contract Test Not Implemented");
    }

    courseTest(context: SohlAction.Context = {}): void {
        const {
            type = `${this.label}-course-test`,
            title = `${this.label} Course Test`,
        } = context;

        // TODO - Affliction Course Test
        sohl.log.warn("Affliction Course Test Not Implemented");
    }

    diagnosisTest(context: SohlAction.Context = {}): void {
        const {
            type = `${this.label}-diagnosis-test`,
            title = `${this.label} Diagnosis Test`,
        } = context;

        // TODO - Affliction Diagnosis Test
        sohl.log.warn("Affliction Diagnosis Test Not Implemented");
    }

    treatmentTest(context: SohlAction.Context = {}): void {
        const {
            type = `${this.label}-treatment-test`,
            title = `${this.label} Treatment Test`,
        } = context;

        // TODO - Affliction Treatment Test
        sohl.log.warn("Affliction Treatment Test Not Implemented");
    }

    healingTest(context: SohlAction.Context = {}): void {
        const {
            type = `${this.label}-healing-test`,
            title = `${this.label} Healing Test`,
        } = context;

        // TODO - Affliction Healing Test
        sohl.log.warn("Affliction Healing Test Not Implemented");
    }

    /** @override */
    initialize(context: SohlAction.Context = {}): void {
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
    override evaluate(context: SohlAction.Context = {}): void {}

    /** @inheritdoc */
    override finalize(context: SohlAction.Context = {}): void {}
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

    export const IntrinsicActions: StrictObject<SohlContextMenuEntry> = {
        TRANSMITAFFLICTION: {
            id: "transmit",
            functionName: "transmitAffliction",
            name: "Transmit Affliction",
            iconClass: "fas fa-head-side-cough",
            condition: (header: HTMLElement) => {
                const item = SohlContextMenu._getContextItem(
                    header,
                ) as SohlItem<Affliction>;
                return item?.system.logic.canTransmit;
            },
            group: CONTEXTMENU_SORT_GROUP.ESSENTIAL,
        },
        CONTRACTAFFLICTIONTEST: {
            id: "contract",
            functionName: "contractAfflictionTest",
            name: "Contract Affliction Test",
            iconClass: "fas fa-virus",
            condition: () => true,
            group: CONTEXTMENU_SORT_GROUP.GENERAL,
        },
        COURSETTEST: {
            id: "course",
            functionName: "courseTest",
            name: "Course Test",
            iconClass: "fas fa-heart-pulse",
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
            group: CONTEXTMENU_SORT_GROUP.ESSENTIAL,
        },
        FATIGUETEST: {
            id: SUBTYPE.FATIGUE,
            functionName: "fatigueTest",
            name: "Fatigue Test",
            iconClass: "fas fa-face-downcast-sweat",
            condition: () => true,
            group: CONTEXTMENU_SORT_GROUP.GENERAL,
        },
        MORALETEST: {
            id: SUBTYPE.MORALE,
            name: "Morale Test",
            iconClass: "far fa-people-group",
            condition: () => true,
            group: CONTEXTMENU_SORT_GROUP.GENERAL,
        },
        FEARTEST: {
            id: SUBTYPE.FEAR,
            functionName: "fearTest",
            name: "Fear Test",
            iconClass: "far fa-face-scream",
            condition: () => true,
            group: CONTEXTMENU_SORT_GROUP.GENERAL,
        },

        TREATMENTTEST: {
            id: "treatment",
            functionName: "treatmentTest",
            name: "Treatment Test",
            iconClass: "fas fa-staff-snake",
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
            group: CONTEXTMENU_SORT_GROUP.ESSENTIAL,
        },
        DIAGNOSISTEST: {
            id: "diagnosis",
            functionName: "diagnosisTest",
            name: "Diagnosis Test",
            iconClass: "fas fa-stethoscope",
            condition: (header: HTMLElement) => {
                const item = SohlContextMenu._getContextItem(header);
                return !!item && !item.system.isTreated;
            },
            group: CONTEXTMENU_SORT_GROUP.ESSENTIAL,
        },
        HEALINGTEST: {
            id: "healing",
            functionName: "healingTest",
            name: "Healing Test",
            iconClass: "fas fa-heart-pulse",
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
            group: CONTEXTMENU_SORT_GROUP.ESSENTIAL,
        },
    };

    export interface Data<TPerformer extends Affliction = Affliction>
        extends SubTypeMixin.Data<TPerformer, SubType> {
        category: string;
        isDormant: boolean;
        isTreated: boolean;
        diagnosisBonusBase: number;
        levelBase: number;
        healingRateBase: number;
        contagionIndexBase: number;
        transmission: Transmission;
    }

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
    export class DataModel
        extends SubTypeMixin.DataModel<
            typeof SohlItem.DataModel<Affliction>,
            SubType,
            typeof SubTypes,
            Affliction
        >(SohlItem.DataModel<Affliction>, SubTypes)
        implements Data<Affliction>
    {
        static readonly LOCALIZATION_PREFIXES = ["Affliction"];
        declare subType: SubType;
        declare category: string;
        declare isDormant: boolean;
        declare isTreated: boolean;
        declare diagnosisBonusBase: number;
        declare levelBase: number;
        declare healingRateBase: number;
        declare contagionIndexBase: number;
        declare transmission: Transmission;
        readonly [kDataModel] = true;

        static isA(obj: unknown): obj is DataModel {
            return typeof obj === "object" && obj !== null && kDataModel in obj;
        }

        static defineSchema() {
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
