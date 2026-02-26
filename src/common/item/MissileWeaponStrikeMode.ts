/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
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
    ITEM_KIND,
    ITEM_METADATA,
    PROJECTILEGEAR_SUBTYPE,
    ProjectileGearSubType,
    ProjectileGearSubTypes,
} from "@utils/constants";
import {
    StrikeModeLogic,
    StrikeModeDataModel,
    StrikeModeData,
} from "@common/item/StrikeMode";
const { StringField } = foundry.data.fields;

export class MissileWeaponStrikeModeLogic<
    TData extends MissileWeaponStrikeModeData = MissileWeaponStrikeModeData,
> extends StrikeModeLogic<TData> {
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

export interface MissileWeaponStrikeModeData<
    TLogic extends
        MissileWeaponStrikeModeLogic<MissileWeaponStrikeModeData> = MissileWeaponStrikeModeLogic<any>,
> extends StrikeModeData<TLogic> {
    projectileType: ProjectileGearSubType;
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
            MissileWeaponStrikeModeLogic<MissileWeaponStrikeModeData> = MissileWeaponStrikeModeLogic<
            MissileWeaponStrikeModeData<MissileWeaponStrikeModeLogic<any>>
        >,
    >
    extends StrikeModeDataModel<TSchema, TLogic>
    implements MissileWeaponStrikeModeData
{
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.MissileWeaponStrikeMode.DATA",
    ];
    static override readonly kind = ITEM_KIND.MISSILEWEAPONSTRIKEMODE;
    projectileType!: ProjectileGearSubType;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineMissileWeaponStrikeModeSchema();
    }
}

export class MissileWeaponStrikeModeSheet extends SohlItemSheetBase {
    protected async _preparePropertiesContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        return context;
    }
}
