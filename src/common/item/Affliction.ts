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

import {
    AFFLICTION_TRANSMISSION,
    AfflictionHealRate,
    AfflictionSubType,
    AfflictionSubTypes,
    AfflictionTransmission,
    AfflictionTransmissions,
    defineType,
    ITEM_KIND,
    SOHL_CONTEXT_MENU_SORT_GROUP,
} from "@utils/constants";
import { SohlItem } from "@common/item/SohlItem";
import { kSubTypeMixinData, SubTypeMixin } from "@common/item/SubTypeMixin";
import { SohlContextMenu } from "@utils/SohlContextMenu";
import type { ValueModifier } from "@common/modifier/ValueModifier";
import type { SohlEventContext } from "@common/event/SohlEventContext";

import type { SuccessTestResult } from "@common/result/SuccessTestResult";
import { SohlIntrinsicAction } from "@common/event/SohlIntrinsicAction";
import { toDocumentId } from "@utils/helpers";
import type { SohlAction } from "@common/event/SohlAction";
const { StringField, BooleanField, NumberField } = foundry.data.fields;

const kAffliction = Symbol("Affliction");
const kData = Symbol("Affliction.Data");

const {
    kind: INTRINSIC_ACTION,
    values: IntrinsicActions,
    isValue: isIntrinsicAction,
    labels: IntrinsicActionLabels,
} = defineType("SOHL.Affliction.INTRINSIC_ACTION", {
    TRANSMITAFFLICTION: {
        id: toDocumentId("ejfkdVfK2UQFaoDt"),
        label: "SOHL.Affliction.INTRINSIC_ACTION.TRANSMITAFFLICTION",
        functionName: "transmitAffliction",
        iconFAClass: "fas fa-head-side-cough",
        condition: (header: HTMLElement) => {
            const item = SohlContextMenu._getContextItem(
                header,
            ) as SohlItem<Affliction>;
            return item?.logic.canTransmit;
        },
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    CONTRACTAFFLICTIONTEST: {
        id: toDocumentId("c0XL3qx2N7voXae2"),
        label: "SOHL.Affliction.INTRINSIC_ACTION.CONTRACTAFFLICTIONTEST",
        functionName: "contractAfflictionTest",
        iconFAClass: "fas fa-virus",
        condition: () => true,
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    COURSETTEST: {
        id: toDocumentId("QyybbqhI2iygUhNk"),
        label: "SOHL.Affliction.INTRINSIC_ACTION.COURSETTEST",
        functionName: "courseTest",
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
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    FATIGUETEST: {
        id: toDocumentId("5faBqb1EKZKBLQ0h"),
        label: "SOHL.Affliction.INTRINSIC_ACTION.FATIGUETEST",
        functionName: "fatigueTest",
        iconFAClass: "fas fa-face-downcast-sweat",
        condition: () => true,
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    MORALETEST: {
        id: toDocumentId("QgS4LXXJ1zxnoQCI"),
        label: "SOHL.Affliction.INTRINSIC_ACTION.MORALETEST",
        functionName: "moraleTest",
        iconFAClass: "far fa-people-group",
        condition: () => true,
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    FEARTEST: {
        id: toDocumentId("cacuV1ttmEs0jDcz"),
        label: "SOHL.Affliction.INTRINSIC_ACTION.FEARTEST",
        functionName: "fearTest",
        iconFAClass: "far fa-face-scream",
        condition: () => true,
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    TREATMENTTEST: {
        id: toDocumentId("LilY1TVSGXvEoFEb"),
        label: "SOHL.Affliction.INTRINSIC_ACTION.TREATMENTTEST",
        functionName: "treatmentTest",
        iconFAClass: "fas fa-staff-snake",
        condition: (header: HTMLElement) => {
            void header;
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
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    DIAGNOSISTEST: {
        id: toDocumentId("g3rd7PIjQBtt8yAE"),
        label: "SOHL.Affliction.INTRINSIC_ACTION.DIAGNOSISTEST",
        functionName: "diagnosisTest",
        iconFAClass: "fas fa-stethoscope",
        condition: (header: HTMLElement) => {
            const item = SohlContextMenu._getContextItem(header);
            return !!item && !item.system.isTreated;
        },
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    HEALINGTEST: {
        id: toDocumentId("XnJNxg6COZyevjMe"),
        label: "SOHL.Affliction.INTRINSIC_ACTION.HEALINGTEST",
        functionName: "healingTest",
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
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
} as StrictObject<Partial<SohlIntrinsicAction.Data>>);
// IntrinsicAction type alias intentionally removed (was unused)

export class Affliction
    extends SubTypeMixin(SohlItem.BaseLogic)
    implements Affliction.Logic
{
    declare readonly _parent: Affliction.Data;
    isDormant!: boolean;
    isTreated!: boolean;
    diagnosisBonus!: ValueModifier;
    level!: ValueModifier;
    healingRate!: ValueModifier;
    contagionIndex!: ValueModifier;
    transmission!: AfflictionTransmission;
    readonly [kAffliction] = true;

    static isA(obj: unknown): obj is Affliction {
        return typeof obj === "object" && obj !== null && kAffliction in obj;
    }

    get intrinsicActions(): SohlAction[] {
        const actionKeys = new Set<string>();
        const actions: SohlAction[] = Object.keys(INTRINSIC_ACTION).map(
            (key) => {
                const data = INTRINSIC_ACTION[key];
                data.label ??= IntrinsicActionLabels[key];
                actionKeys.add(data.label);
                return new SohlIntrinsicAction(this, data);
            },
        );

        return super.intrinsicActions.reduce((acc, action) => {
            if (!actionKeys.has(action.label)) {
                actionKeys.add(action.label);
                acc.push(action);
            }
            return acc;
        }, actions);
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

    async transmit(context: SohlEventContext): Promise<void> {
        const {
            type = `affliction-${(this.item as any)?.name}-transmit`,
            title = `${this.label} Transmit`,
        } = context;
        // TODO - Affliction Transmit
        sohl.log.warn("Affliction Transmit Not Implemented");
    }

    async contractTest(
        context: SohlEventContext,
    ): Promise<Nullable<SuccessTestResult>> {
        const {
            type = `${this.label}-contract-test`,
            title = `${this.label} Contract Test`,
        } = context;

        // TODO - Affliction Contract Test
        throw new Error("Affliction Contract Test Not Implemented");
    }

    async courseTest(
        context: SohlEventContext,
    ): Promise<Nullable<SuccessTestResult>> {
        const {
            type = `${this.label}-course-test`,
            title = `${this.label} Course Test`,
        } = context;

        // TODO - Affliction Course Test
        throw new Error("Affliction Course Test Not Implemented");
    }

    async diagnosisTest(
        context: SohlEventContext,
    ): Promise<Nullable<SuccessTestResult>> {
        const {
            type = `${this.label}-diagnosis-test`,
            title = `${this.label} Diagnosis Test`,
        } = context;

        // TODO - Affliction Diagnosis Test
        throw new Error("Affliction Diagnosis Test Not Implemented");
    }

    async treatmentTest(
        context: SohlEventContext,
    ): Promise<Nullable<SuccessTestResult>> {
        const {
            type = `${this.label}-treatment-test`,
            title = `${this.label} Treatment Test`,
        } = context;

        // TODO - Affliction Treatment Test
        throw new Error("Affliction Treatment Test Not Implemented");
    }

    async healingTest(
        context: SohlEventContext,
    ): Promise<Nullable<SuccessTestResult>> {
        const {
            type = `${this.label}-healing-test`,
            title = `${this.label} Healing Test`,
        } = context;

        // TODO - Affliction Healing Test
        throw new Error("Affliction Healing Test Not Implemented");
    }

    /** @inheritdoc */
    override initialize(context: SohlEventContext): void {
        super.initialize(context);
        this.isDormant = false;
        this.isTreated = false;
        this.diagnosisBonus = sohl.CONFIG.ValueModifier({}, { parent: this });
        this.level = sohl.CONFIG.ValueModifier({}, { parent: this });
        this.healingRate = sohl.CONFIG.ValueModifier({}, { parent: this });
        this.contagionIndex = sohl.CONFIG.ValueModifier({}, { parent: this });
        this.transmission = AFFLICTION_TRANSMISSION.NONE;

        this.healingRate = sohl.CONFIG.ValueModifier(this);
        if (this._parent.healingRateBase === -1) {
            this.healingRate.disabled = "No Healing Rate";
        } else {
            this.healingRate.base = this._parent.healingRateBase;
        }
        this.contagionIndex = sohl.CONFIG.ValueModifier(this, {
            base: this._parent.contagionIndexBase,
        });
        this.level = sohl.CONFIG.ValueModifier(this, {
            base: this._parent.levelBase,
        });
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

export namespace Affliction {
    /**
     * The FontAwesome icon class for the Affliction item.
     */
    export const IconCssClass = "fas fa-face-nauseated";

    /**
     * The image path for the Affliction item.
     */
    export const Image = "systems/sohl/assets/icons/sick.svg";

    export interface Logic
        extends SohlItem.Logic,
            SubTypeMixin.Logic<AfflictionSubType> {
        readonly _parent: Affliction.Data;
        readonly [kAffliction]: true;
        get canTransmit(): boolean;
        get canContract(): boolean;
        get hasCourse(): boolean;
        get canTreat(): boolean;
        get canHeal(): boolean;
        transmit(context: SohlEventContext): Promise<void>;
        contractTest(
            context: SohlEventContext,
        ): Promise<Nullable<SuccessTestResult>>;
        courseTest(
            context: SohlEventContext,
        ): Promise<Nullable<SuccessTestResult>>;
        diagnosisTest(
            context: SohlEventContext,
        ): Promise<Nullable<SuccessTestResult>>;
        treatmentTest(
            context: SohlEventContext,
        ): Promise<Nullable<SuccessTestResult>>;
        healingTest(
            context: SohlEventContext,
        ): Promise<Nullable<SuccessTestResult>>;
    }

    export interface Data
        extends SubTypeMixin.Data<AfflictionSubType>,
            SohlItem.Data {
        readonly [kData]: true;
        category: string;
        isDormant: boolean;
        isTreated: boolean;
        diagnosisBonusBase: number;
        levelBase: number;
        healingRateBase: number;
        contagionIndexBase: number;
        transmission: AfflictionTransmission;
    }

    export namespace Data {
        export function isA(
            obj: unknown,
            subType?: AfflictionSubType,
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
        AfflictionSubType,
        typeof AfflictionSubTypes
    >(
        SohlItem.DataModel,
        AfflictionSubTypes,
    ) as unknown as Constructor<Affliction.Data> & SohlItem.DataModel.Statics;

    export class DataModel extends DataModelShape {
        static override readonly LOCALIZATION_PREFIXES = ["Affliction"];
        static override readonly kind = ITEM_KIND.AFFLICTION;
        readonly [kData] = true;
        declare readonly [kSubTypeMixinData] = true;
        subType!: AfflictionSubType;
        category!: string;
        isDormant!: boolean;
        isTreated!: boolean;
        diagnosisBonusBase!: number;
        levelBase!: number;
        healingRateBase!: number;
        contagionIndexBase!: number;
        transmission!: AfflictionTransmission;

        static override create<Logic>(
            data: PlainObject,
            options: PlainObject,
        ): Logic {
            if (!(options.parent instanceof SohlItem)) {
                throw new Error("Parent must be a SohlItem");
            }
            return new Affliction(data, { parent: options.parent }) as Logic;
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
                    initial: AfflictionHealRate.NONE,
                    min: AfflictionHealRate.NONE,
                }),
                contagionIndexBase: new NumberField({
                    integer: true,
                    initial: 0,
                    min: 0,
                }),
                transmission: new StringField({
                    initial: AFFLICTION_TRANSMISSION.NONE,
                    required: true,
                    choices: AfflictionTransmissions,
                }),
            };
        }
    }

    export class Sheet extends SohlItem.Sheet {
        static override readonly PARTS: StrictObject<foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
            foundry.utils.mergeObject(super.PARTS, {
                properties: {
                    template: "systems/sohl/templates/item/affliction.hbs",
                },
            });
    }
}
