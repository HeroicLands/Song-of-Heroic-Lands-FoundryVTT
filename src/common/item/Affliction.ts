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
import type { SohlEventContext } from "@common/event/SohlEventContext";
import type { SuccessTestResult } from "@common/result/SuccessTestResult";
import type { SohlIntrinsicAction } from "@common/event/SohlIntrinsicAction";
import type { Injury } from "@common/item/Injury";
import {
    AFFLICTION_TRANSMISSION,
    AfflictionHealRate,
    AfflictionSubType,
    AfflictionSubTypes,
    AfflictionTransmission,
    AfflictionTransmissions,
    defineType,
    getContextItem,
    ITEM_KIND,
    SOHL_CONTEXT_MENU_SORT_GROUP,
} from "@utils/constants";
import {
    SohlItem,
    SohlItemDataModel,
    SohlItemSheetBase,
} from "@common/item/SohlItem";
import { SohlContextMenu } from "@utils/SohlContextMenu";
import { toDocumentId } from "@utils/helpers";
const { StringField, BooleanField, NumberField } = foundry.data.fields;

export class Affliction<TData extends Affliction.Data = Affliction.Data>
    extends SohlItem.BaseLogic<TData>
    implements Affliction.Logic<TData>
{
    isDormant!: boolean;
    isTreated!: boolean;
    diagnosisBonus!: ValueModifier;
    level!: ValueModifier;
    healingRate!: ValueModifier;
    contagionIndex!: ValueModifier;
    transmission!: AfflictionTransmission;

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
    ): Promise<SuccessTestResult | null> {
        const {
            type = `${this.label}-contract-test`,
            title = `${this.label} Contract Test`,
        } = context;

        // TODO - Affliction Contract Test
        throw new Error("Affliction Contract Test Not Implemented");
    }

    async courseTest(
        context: SohlEventContext,
    ): Promise<SuccessTestResult | null> {
        const {
            type = `${this.label}-course-test`,
            title = `${this.label} Course Test`,
        } = context;

        // TODO - Affliction Course Test
        throw new Error("Affliction Course Test Not Implemented");
    }

    async diagnosisTest(
        context: SohlEventContext,
    ): Promise<SuccessTestResult | null> {
        const {
            type = `${this.label}-diagnosis-test`,
            title = `${this.label} Diagnosis Test`,
        } = context;

        // TODO - Affliction Diagnosis Test
        throw new Error("Affliction Diagnosis Test Not Implemented");
    }

    async treatmentTest(
        context: SohlEventContext,
    ): Promise<SuccessTestResult | null> {
        const {
            type = `${this.label}-treatment-test`,
            title = `${this.label} Treatment Test`,
        } = context;

        // TODO - Affliction Treatment Test
        throw new Error("Affliction Treatment Test Not Implemented");
    }

    async healingTest(
        context: SohlEventContext,
    ): Promise<SuccessTestResult | null> {
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
        if (this.data.healingRateBase === -1) {
            this.healingRate.disabled = "No Healing Rate";
        } else {
            this.healingRate.base = this.data.healingRateBase;
        }
        this.contagionIndex = sohl.CONFIG.ValueModifier(this, {
            base: this.data.contagionIndexBase,
        });
        this.level = sohl.CONFIG.ValueModifier(this, {
            base: this.data.levelBase,
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
    export const Kind = ITEM_KIND.AFFLICTION;

    export interface Logic<
        TData extends Affliction.Data<any> = Affliction.Data<any>,
    > extends SohlItem.Logic<TData> {
        get canTransmit(): boolean;
        get canContract(): boolean;
        get hasCourse(): boolean;
        get canTreat(): boolean;
        get canHeal(): boolean;
        transmit(context: SohlEventContext): Promise<void>;
        contractTest(
            context: SohlEventContext,
        ): Promise<SuccessTestResult | null>;
        courseTest(
            context: SohlEventContext,
        ): Promise<SuccessTestResult | null>;
        diagnosisTest(
            context: SohlEventContext,
        ): Promise<SuccessTestResult | null>;
        treatmentTest(
            context: SohlEventContext,
        ): Promise<SuccessTestResult | null>;
        healingTest(
            context: SohlEventContext,
        ): Promise<SuccessTestResult | null>;
    }

    export interface Data<
        TLogic extends Affliction.Logic<Data> = Affliction.Logic<any>,
    > extends SohlItem.Data<TLogic> {
        subType: AfflictionSubType;
        category: string;
        isDormant: boolean;
        isTreated: boolean;
        diagnosisBonusBase: number;
        levelBase: number;
        healingRateBase: number;
        contagionIndexBase: number;
        transmission: AfflictionTransmission;
    }

    /**
     * The intrinsic actions available to Affliction items.
     * This structure should correspond to the methods on the
     * Affliction class that can be invoked as intrinsic actions.
     */
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
                const item = getContextItem(header);
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
                const item = getContextItem(header);
                return !!item && !(item.system as Injury.Data).isTreated;
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
}

function defineAfflictionSchema(): PlainObject {
    return {
        ...SohlItemDataModel.defineSchema(),
        subType: new StringField({
            choices: AfflictionSubTypes,
            required: true,
        }),
        category: new StringField({ initial: "" }),
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

type AfflictionDataSchema = ReturnType<typeof defineAfflictionSchema>;

export class AfflictionDataModel<
        TSchema extends foundry.data.fields.DataSchema = AfflictionDataSchema,
        TLogic extends
            Affliction.Logic<Affliction.Data> = Affliction.Logic<Affliction.Data>,
    >
    extends SohlItemDataModel<TSchema, TLogic>
    implements Affliction.Data<TLogic>
{
    static readonly LOCALIZATION_PREFIXES = ["Affliction"];
    static readonly kind = Affliction.Kind;
    subType!: AfflictionSubType;
    category!: string;
    isDormant!: boolean;
    isTreated!: boolean;
    diagnosisBonusBase!: number;
    levelBase!: number;
    healingRateBase!: number;
    contagionIndexBase!: number;
    transmission!: AfflictionTransmission;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineAfflictionSchema();
    }
}

export class AfflictionSheet extends SohlItemSheetBase {
    static override PARTS = {
        ...super.PARTS,
        properties: {
            template: "systems/sohl/templates/item/affliction.hbs",
        },
    };

    override async _preparePropertiesContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }
}
