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
import { ITEM_KIND } from "@utils/constants";
import { Gear, GearDataModel } from "@common/item/Gear";

export class MiscGear<TData extends MiscGear.Data = MiscGear.Data>
    extends Gear<TData>
    implements MiscGear.Logic
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

export namespace MiscGear {
    export const Kind = ITEM_KIND.MISCGEAR;

    export interface Logic<TData extends MiscGear.Data = MiscGear.Data>
        extends Gear.Logic<TData> {}

    export interface Data<
        TLogic extends MiscGear.Logic<Data> = MiscGear.Logic<any>,
    > extends Gear.Data<TLogic> {}
}

function defineMiscGearSchema(): foundry.data.fields.DataSchema {
    return {
        ...GearDataModel.defineSchema(),
    };
}

type MiscGearSchema = ReturnType<typeof defineMiscGearSchema>;

export class MiscGearDataModel<
        TSchema extends foundry.data.fields.DataSchema = MiscGearSchema,
        TLogic extends
            MiscGear.Logic<MiscGear.Data> = MiscGear.Logic<MiscGear.Data>,
    >
    extends GearDataModel<TSchema, TLogic>
    implements MiscGear.Data<TLogic>
{
    static readonly LOCALIZATION_PREFIXES = ["MiscGear"];

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineMiscGearSchema();
    }
}

export class MiscGearSheet extends SohlItemSheetBase {
    static override PARTS = {
        ...super.PARTS,
        properties: {
            template: "systems/sohl/templates/item/miscgear.hbs",
        },
    };

    override async _preparePropertiesContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }
}
