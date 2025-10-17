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

import type { SohlEventContext } from "@common/event/SohlEventContext";

import { SohlItem, SohlItemSheetBase } from "@common/item/SohlItem";
import {
    CONCOCTIONGEAR_POTENCY,
    ConcoctionGearPotency,
    ConcoctionGearSubType,
    ConcoctionGearSubTypes,
    ITEM_KIND,
} from "@utils/constants";
import { Gear, GearDataModel } from "@common/item/Gear";
const { NumberField, StringField } = foundry.data.fields;

export class ConcoctionGear<
        TData extends ConcoctionGear.Data = ConcoctionGear.Data,
    >
    extends Gear<TData>
    implements ConcoctionGear.Logic<TData>
{
    /** @inheritdoc */
    override initialize(context: SohlEventContext): void {
        super.initialize(context);
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

export namespace ConcoctionGear {
    export const Kind = ITEM_KIND.CONCOCTIONGEAR;

    export interface Logic<
        TData extends ConcoctionGear.Data = ConcoctionGear.Data,
    > extends Gear.Logic<TData> {}

    export interface Data<
        TLogic extends ConcoctionGear.Logic<Data> = ConcoctionGear.Logic<any>,
    > extends Gear.Data<TLogic> {
        subType: ConcoctionGearSubType;
        potency: ConcoctionGearPotency;
        strength: number;
    }
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
            ConcoctionGear.Logic<ConcoctionGear.Data> = ConcoctionGear.Logic<ConcoctionGear.Data>,
    >
    extends GearDataModel<TSchema, TLogic>
    implements ConcoctionGear.Data<TLogic>
{
    static readonly LOCALIZATION_PREFIXES = ["ConcoctionGear"];
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
