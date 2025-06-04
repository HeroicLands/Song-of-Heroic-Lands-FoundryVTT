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

import { MeleeWeaponStrikeModeData } from "@common/item/datamodel";
import { PerformerClassRegistryElement, SohlPerformer } from "@common";
import { RegisterClass } from "@utils/decorators";
import { StrikeModePerformer } from "./StrikeModePerformer";

@RegisterClass(
    new PerformerClassRegistryElement({
        kind: "MeleeWeaponStrikeModePerformer",
    }),
)
export class MeleeWeaponStrikeModePerformer extends StrikeModePerformer<MeleeWeaponStrikeModeData> {
    /** @inheritdoc */
    override initialize(context: SohlAction.Context = {}): void {}

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context = {}): void {}

    /** @inheritdoc */
    override finalize(context: SohlAction.Context = {}): void {}
}
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
import { MeleeWeaponStrikeModePerformer } from "@common/item/performer";
import { StrikeModeData, StrikeModeDataModel } from "@common/item/datamodel";
import { DataModelClassRegistryElement } from "@common";
import { RegisterClass } from "@utils/decorators";
import { isOfType } from "@utils";
const { NumberField } = (foundry.data as any).fields;

export const MELEEWEAPONSTRIKEMODE_TYPE = "meleestrikemode" as const;
export const isMeleeWeaponStrikeModeData = (
    obj: any,
): obj is MeleeWeaponStrikeModeData =>
    isOfType(obj, MELEEWEAPONSTRIKEMODE_TYPE);

export interface MeleeWeaponStrikeModeData
    extends StrikeModeData<MeleeWeaponStrikeModePerformer> {}

@RegisterClass(
    new DataModelClassRegistryElement({
        kind: MELEEWEAPONSTRIKEMODE_TYPE,
        logicClass: MeleeWeaponStrikeModePerformer,
        iconCssClass: "fas fa-sword",
        img: "systems/sohl/assets/icons/sword.svg",
        sheet: "systems/sohl/templates/item/meleestrikemode-sheet.hbs",
        schemaVersion: "0.6.0",
    }),
)
export class MeleeWeaponStrikeModeDataModel
    extends StrikeModeDataModel<MeleeWeaponStrikeModePerformer>
    implements MeleeWeaponStrikeModeData
{
    static override readonly LOCALIZATION_PREFIXES = ["MELEEWEAPONSTRIKEMODE"];
    declare readonly parent: SohlItem<MeleeWeaponStrikeModePerformer>;

    static defineSchema() {
        return {
            ...super.defineSchema(),
            lengthBase: new NumberField({
                integer: true,
                initial: 0,
                min: 0,
            }),
        };
    }
}
