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

import type { SohlActionContext } from "@common/SohlActionContext";

import { SohlItem, SohlItemSheetBase } from "@common/item/SohlItem";
import {
    CONCOCTIONGEAR_POTENCY,
    ConcoctionGearPotency,
    ConcoctionGearSubType,
    ConcoctionGearSubTypes,
    ITEM_KIND,
} from "@utils/constants";
import { GearLogic, GearDataModel, GearData } from "@common/item/Gear";
const { NumberField, StringField } = foundry.data.fields;

export class ConcoctionGearLogic<
    TData extends ConcoctionGearData = ConcoctionGearData,
> extends GearLogic<TData> {
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

export interface ConcoctionGearData<
    TLogic extends
        ConcoctionGearLogic<ConcoctionGearData> = ConcoctionGearLogic<any>,
> extends GearData<TLogic> {
    subType: ConcoctionGearSubType;
    potency: ConcoctionGearPotency;
    strength: number;
}

function defineConcoctionGearSchema(): foundry.data.fields.DataSchema {
    return {
        ...GearDataModel.defineSchema(),
        subType: new StringField({
            choices: ConcoctionGearSubTypes,
            required: true,
        }),
        potency: new StringField({
            initial: CONCOCTIONGEAR_POTENCY.NOT_APPLICABLE,
            required: true,
            choices: Object.values(CONCOCTIONGEAR_POTENCY),
        }),
        strength: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
    };
}

type ConcoctionGearSchema = ReturnType<typeof defineConcoctionGearSchema>;

export class ConcoctionGearDataModel<
        TSchema extends foundry.data.fields.DataSchema = ConcoctionGearSchema,
        TLogic extends
            ConcoctionGearLogic<ConcoctionGearData> = ConcoctionGearLogic<ConcoctionGearData>,
    >
    extends GearDataModel<TSchema, TLogic>
    implements ConcoctionGearData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["ConcoctionGear"];
    static override readonly kind: string = ITEM_KIND.CONCOCTIONGEAR;
    subType!: ConcoctionGearSubType;
    potency!: ConcoctionGearPotency;
    strength!: number;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineConcoctionGearSchema();
    }
}

export class ConcoctionGearSheet extends SohlItemSheetBase {
    static override PARTS = {
        ...super.PARTS,
        properties: {
            template: "systems/sohl/templates/item/concoctiongear.hbs",
        },
    };

    override async _preparePropertiesContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }
}
