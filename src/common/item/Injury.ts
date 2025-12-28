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

import type { ActionData } from "@common/item/Action";
import type { SohlActionContext } from "@common/SohlActionContext";
import {
    ACTION_SUBTYPE,
    defineType,
    IMPACT_ASPECT,
    ImpactAspect,
    ImpactAspects,
    ITEM_KIND,
    ITEM_METADATA,
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
const { NumberField, BooleanField, StringField, DocumentIdField } =
    foundry.data.fields;

export class InjuryLogic<
    TData extends InjuryData = InjuryData,
> extends SohlItemBaseLogic<TData> {
    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(context: SohlActionContext): void {
        super.initialize(context);
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

export interface InjuryData<
    TLogic extends InjuryLogic<InjuryData> = InjuryLogic<any>,
> extends SohlItemData<TLogic> {
    injuryLevelBase: number;
    healingRateBase: number;
    aspect: ImpactAspect;
    isTreated: boolean;
    isBleeding: boolean;
    bodyLocationId: string;
}

function defineInjuryDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        injuryLevelBase: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
        healingRateBase: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
        aspect: new StringField({
            initial: IMPACT_ASPECT.BLUNT,
            choices: ImpactAspects,
        }),
        isTreated: new BooleanField({ initial: false }),
        isBleeding: new BooleanField({ initial: false }),
        bodyLocationId: new DocumentIdField(),
    };
}

type InjuryDataSchema = ReturnType<typeof defineInjuryDataSchema>;

export class InjuryDataModel<
        TSchema extends foundry.data.fields.DataSchema = InjuryDataSchema,
        TLogic extends InjuryLogic<InjuryData> = InjuryLogic<InjuryData>,
    >
    extends SohlItemDataModel<TSchema, TLogic>
    implements InjuryData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.Injury.DATA"];
    static override readonly kind = ITEM_KIND.INJURY;
    injuryLevelBase!: number;
    healingRateBase!: number;
    aspect!: ImpactAspect;
    isTreated!: boolean;
    isBleeding!: boolean;
    bodyLocationId!: string;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineInjuryDataSchema();
    }
}

export class InjurySheet extends SohlItemSheetBase {
    override async _preparePropertiesContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }
}

export const {
    kind: SHOCK,
    values: Shock,
    isValue: isShock,
} = defineType("SOHL.Injury.SHOCK", {
    NONE: 0,
    STUNNED: 1,
    INCAPACITATED: 2,
    UNCONCIOUS: 3,
    KILLED: 4,
});
export type Shock = (typeof SHOCK)[keyof typeof SHOCK];

export const UNTREATED = {
    hr: 4,
    infect: true,
    bleed: false,
    impair: false,
    newInj: -1,
} as const;

export const INJURY_LEVELS = ["NA", "M1", "S2", "S3", "G4", "G5"];

export const {
    kind: INTRINSIC_ACTION,
    values: IntrinsicActions,
    isValue: isIntrinsicAction,
    labels: IntrinsicActionLabels,
} = defineType("SOHL.Injury.INTRINSIC_ACTION", {
    TREATMENTTEST: {
        subType: ACTION_SUBTYPE.INTRINSIC_ACTION,
        title: "SOHL.Injury.INTRINSIC_ACTION.treatmenttest.title",
        scope: SOHL_ACTION_SCOPE.SELF,
        iconFAClass: "fas fa-staff-snake",
        executor: "treatmentTest",
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
            // const physician = item?.actor?.getSkillByAbbrev("pysn");
            // return physician && !physician.system.$masteryLevel.disabled;
        }),
        group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
    },
    HEALINGTEST: {
        subType: ACTION_SUBTYPE.INTRINSIC_ACTION,
        title: "SOHL.Injury.INTRINSIC_ACTION.healingtest.title",
        scope: SOHL_ACTION_SCOPE.SELF,
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
export type IntrinsicAction =
    (typeof INTRINSIC_ACTION)[keyof typeof INTRINSIC_ACTION];
