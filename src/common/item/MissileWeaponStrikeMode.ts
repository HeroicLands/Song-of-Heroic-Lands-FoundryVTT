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
import { SohlItemSheetBase } from "@common/item/SohlItem";
import {
    ITEM_KIND,
    PROJECTILEGEAR_SUBTYPE,
    ProjectileGearSubType,
    ProjectileGearSubTypes,
} from "@utils/constants";
import { StrikeMode, StrikeModeDataModel } from "./StrikeMode";
const { StringField } = foundry.data.fields;

export class MissileWeaponStrikeMode<
        TData extends
            MissileWeaponStrikeMode.Data = MissileWeaponStrikeMode.Data,
    >
    extends StrikeMode<TData>
    implements MissileWeaponStrikeMode.Logic
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

export namespace MissileWeaponStrikeMode {
    export const Kind = ITEM_KIND.MISSILEWEAPONSTRIKEMODE;

    export interface Logic<
        TData extends
            MissileWeaponStrikeMode.Data = MissileWeaponStrikeMode.Data,
    > extends StrikeMode.Logic<TData> {}

    export interface Data<
        TLogic extends
            MissileWeaponStrikeMode.Logic<Data> = MissileWeaponStrikeMode.Logic<any>,
    > extends StrikeMode.Data<TLogic> {
        projectileType: ProjectileGearSubType;
    }
}

function defineMissileWeaponStrikeModeSchema(): foundry.data.fields.DataSchema {
    return {
        ...StrikeModeDataModel.defineSchema(),
        projectileType: new StringField({
            initial: PROJECTILEGEAR_SUBTYPE.NONE,
            required: true,
            choices: ProjectileGearSubTypes,
        }),
    };
}

type MissileWeaponStrikeModeSchema = ReturnType<
    typeof defineMissileWeaponStrikeModeSchema
>;

export class MissileWeaponStrikeModeDataModel<
        TSchema extends
            foundry.data.fields.DataSchema = MissileWeaponStrikeModeSchema,
        TLogic extends
            MissileWeaponStrikeMode.Logic<MissileWeaponStrikeMode.Data> = MissileWeaponStrikeMode.Logic<
            MissileWeaponStrikeMode.Data<MissileWeaponStrikeMode.Logic<any>>
        >,
    >
    extends StrikeModeDataModel<TSchema, TLogic>
    implements MissileWeaponStrikeMode.Data
{
    static readonly LOCALIZATION_PREFIXES = ["MELEEWEAPONSTRIKEMODE"];
    static override readonly kind = MissileWeaponStrikeMode.Kind;
    projectileType!: ProjectileGearSubType;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineMissileWeaponStrikeModeSchema();
    }
}

export class MissileWeaponStrikeModeSheet extends SohlItemSheetBase {
    static override PARTS = {
        ...super.PARTS,
        properties: {
            template:
                "systems/sohl/templates/item/combattechniquestrikemode.hbs",
        },
    };

    override async _preparePropertiesContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }
}
