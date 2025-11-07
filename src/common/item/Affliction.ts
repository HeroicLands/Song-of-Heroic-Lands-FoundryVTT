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
import type { SohlActionContext } from "@common/SohlActionContext";
import type { SuccessTestResult } from "@common/result/SuccessTestResult";
import type { InjuryData } from "@common/item/Injury";
import {
    ACTION_SUBTYPE,
    AFFLICTION_TRANSMISSION,
    AfflictionHealRate,
    AfflictionSubType,
    AfflictionSubTypes,
    AfflictionTransmission,
    AfflictionTransmissions,
    defineType,
    getContextItem,
    ITEM_KIND,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
} from "@utils/constants";
import {
    SohlItemBaseLogic,
    SohlItemData,
    SohlItemDataModel,
    SohlItemSheetBase,
} from "@common/item/SohlItem";
import { serializeFn } from "@utils/helpers";
import { ActionData } from "@common/item/Action";
const { StringField, BooleanField, NumberField } = foundry.data.fields;

export class AfflictionLogic<
    TData extends AfflictionData = AfflictionData,
> extends SohlItemBaseLogic<TData> {
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

    async transmit(context: SohlActionContext): Promise<void> {
        const {
            type = `affliction-${(this.item as any)?.name}-transmit`,
            title = `${this.label} Transmit`,
        } = context;
        // TODO - Affliction Transmit
        sohl.log.warn("Affliction Transmit Not Implemented");
    }

    async contractTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        const {
            type = `${this.label}-contract-test`,
            title = `${this.label} Contract Test`,
        } = context;

        // TODO - Affliction Contract Test
        throw new Error("Affliction Contract Test Not Implemented");
    }

    async courseTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        const {
            type = `${this.label}-course-test`,
            title = `${this.label} Course Test`,
        } = context;

        // TODO - Affliction Course Test
        throw new Error("Affliction Course Test Not Implemented");
    }

    async diagnosisTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        const {
            type = `${this.label}-diagnosis-test`,
            title = `${this.label} Diagnosis Test`,
        } = context;

        // TODO - Affliction Diagnosis Test
        throw new Error("Affliction Diagnosis Test Not Implemented");
    }

    async treatmentTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        const {
            type = `${this.label}-treatment-test`,
            title = `${this.label} Treatment Test`,
        } = context;

        // TODO - Affliction Treatment Test
        throw new Error("Affliction Treatment Test Not Implemented");
    }

    async healingTest(
        context: SohlActionContext,
    ): Promise<SuccessTestResult | null> {
        const {
            type = `${this.label}-healing-test`,
            title = `${this.label} Healing Test`,
        } = context;

        // TODO - Affliction Healing Test
        throw new Error("Affliction Healing Test Not Implemented");
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(context: SohlActionContext): void {
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
    override evaluate(context: SohlActionContext): void {
        super.evaluate(context);
    }

    /** @inheritdoc */
    override finalize(context: SohlActionContext): void {
        super.finalize(context);
    }
}

export interface AfflictionData<
    TLogic extends AfflictionLogic<AfflictionData> = AfflictionLogic<any>,
> extends SohlItemData<TLogic> {
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
            AfflictionLogic<AfflictionData> = AfflictionLogic<AfflictionData>,
    >
    extends SohlItemDataModel<TSchema, TLogic>
    implements AfflictionData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["Affliction"];
    static override readonly kind = ITEM_KIND.AFFLICTION;
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

/**
 * The intrinsic actions available to Affliction items.
 * This structure should correspond to the methods on the
 * Affliction class that can be invoked as intrinsic actions.
 */
export const {
    kind: AFFLICTION_INTRINSIC_ACTION,
    values: AfflictionIntrinsicActions,
    isValue: isAfflictionIntrinsicAction,
    labels: AfflictionIntrinsicActionLabels,
} = defineType("SOHL.Affliction.INTRINSIC_ACTION", {
    TRANSMITAFFLICTION: {
        subType: ACTION_SUBTYPE.INTRINSIC_ACTION,
        title: "SOHL.Affliction.INTRINSIC_ACTION.transmitaffliction.title",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "fas fa-head-side-cough",
        executor: "transmitAffliction",
        visible: serializeFn((header: HTMLElement) => {
            const item = getContextItem(header);
            return item?.logic.canTransmit;
        }),
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    CONTRACTAFFLICTIONTEST: {
        subType: ACTION_SUBTYPE.INTRINSIC_ACTION,
        title: "SOHL.Affliction.INTRINSIC_ACTION.contractafflictiontest.title",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "fas fa-virus",
        executor: "contractAfflictionTest",
        visible: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    COURSETTEST: {
        subType: ACTION_SUBTYPE.INTRINSIC_ACTION,
        title: "SOHL.Affliction.INTRINSIC_ACTION.coursetest.title",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "fas fa-heart-pulse",
        executor: "courseTest",
        visible: serializeFn((header: HTMLElement) => {
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
        }),
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    FATIGUETEST: {
        subType: ACTION_SUBTYPE.INTRINSIC_ACTION,
        title: "SOHL.Affliction.INTRINSIC_ACTION.fatigetest.title",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "fas fa-face-downcast-sweat",
        executor: "fatigueTest",
        visible: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    MORALETEST: {
        subType: ACTION_SUBTYPE.INTRINSIC_ACTION,
        title: "SOHL.Affliction.INTRINSIC_ACTION.moraletest.title",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "far fa-people-group",
        executor: "moraleTest",
        visible: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    FEARTEST: {
        subType: ACTION_SUBTYPE.INTRINSIC_ACTION,
        title: "SOHL.Affliction.INTRINSIC_ACTION.fearTest.title",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "far fa-face-scream",
        executor: "fearTest",
        visible: "true",
        group: SOHL_CONTEXT_MENU_SORT_GROUP.GENERAL,
    },
    TREATMENTTEST: {
        subType: ACTION_SUBTYPE.INTRINSIC_ACTION,
        title: "SOHL.Affliction.INTRINSIC_ACTION.treatmentTest.title",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "fas fa-staff-snake",
        executor: "treatmentTest",
        visible: serializeFn((header: HTMLElement) => {
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
        }),
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    DIAGNOSISTEST: {
        subType: ACTION_SUBTYPE.INTRINSIC_ACTION,
        title: "SOHL.Affliction.INTRINSIC_ACTION.DIAGNOSISTEST",
        iconFAClass: "fas fa-stethoscope",
        executor: "diagnosisTest",
        visible: serializeFn((header: HTMLElement) => {
            const item = getContextItem(header);
            return !!item && !(item.system as InjuryData).isTreated;
        }),
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    HEALINGTEST: {
        subType: ACTION_SUBTYPE.INTRINSIC_ACTION,
        title: "SOHL.Affliction.INTRINSIC_ACTION.HEALINGTEST",
        iconFAClass: "fas fa-heart-pulse",
        executor: "healingTest",
        visible: serializeFn((header: HTMLElement) => {
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
        }),
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
} as StrictObject<Partial<ActionData>>);
