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

import { MissileWeaponStrikeModeData } from "@common/item/datamodel";
import { PerformerClassRegistryElement, SohlPerformer } from "@common";
import { RegisterClass } from "@utils/decorators";
import { StrikeModePerformer } from "@common/item/performer";

@RegisterClass(
    new PerformerClassRegistryElement({
        kind: "MissileWeaponStrikeModePerformer",
    }),
)
export class MissileWeaponStrikeModePerformer extends StrikeModePerformer<MissileWeaponStrikeModeData> {}
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
import { MissileWeaponStrikeModePerformer } from "@common/item/performer";
import {
    StrikeModeData,
    StrikeModeDataModel,
    PROJECTILEGEAR_SUBTYPE,
    ProjectileGearSubType,
} from "@common/item/datamodel";
import { DataModelClassRegistryElement } from "@common/SohlBaseDataModel";
import { RegisterClass } from "@utils/decorators";
import { isOfType } from "@utils";
const { StringField } = (foundry.data as any).fields;

export const MISSILEWEAPONSTRIKEMODE_TYPE = "missilestrikemode" as const;
export const isMissileWeaponStrikeModeData = (
    obj: any,
): obj is MissileWeaponStrikeModeData =>
    isOfType(obj, MISSILEWEAPONSTRIKEMODE_TYPE);

export interface MissileWeaponStrikeModeData
    extends StrikeModeData<MissileWeaponStrikeModePerformer> {
    projectileType: ProjectileGearSubType;
}

@RegisterClass(
    new DataModelClassRegistryElement({
        kind: MISSILEWEAPONSTRIKEMODE_TYPE,
        logicClass: MissileWeaponStrikeModePerformer,
        iconCssClass: "fas fa-bow-arrow",
        img: "systems/sohl/assets/icons/longbow.svg",
        sheet: "systems/sohl/templates/item/missilestrikemode-sheet.hbs",
        schemaVersion: "0.6.0",
    }),
)
export class MissileWeaponStrikeModeDataModel
    extends StrikeModeDataModel<MissileWeaponStrikeModePerformer>
    implements MissileWeaponStrikeModeData
{
    static override readonly LOCALIZATION_PREFIXES = [
        "MISSILEWEAPONSTRIKEMODE",
    ];
    declare readonly parent: SohlItem<MissileWeaponStrikeModePerformer>;
    projectileType!: ProjectileGearSubType;

    static defineSchema() {
        return {
            ...super.defineSchema(),
            projectileType: new StringField({
                initial: PROJECTILEGEAR_SUBTYPE.NONE,
                required: true,
                choices: Object.values(PROJECTILEGEAR_SUBTYPE),
            }),
        };
    }
}
