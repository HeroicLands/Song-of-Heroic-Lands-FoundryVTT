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

import { WeaponGearData } from "@common/item/datamodel";
import { PerformerClassRegistryElement } from "@common";
import { RegisterClass } from "@utils/decorators";
import { GearPerformer } from "./GearPerformer";

@RegisterClass(
    new PerformerClassRegistryElement({
        kind: "WeaponGearPerformer",
    }),
)
export class WeaponGearPerformer extends GearPerformer<WeaponGearData> {
    /** @inheritdoc */
    override initialize(context: SohlAction.Context = {}): void {
        super.initialize(options);
    }

    /** @inheritdoc */
    override evaluate(context: SohlAction.Context = {}): void {
        super.evaluate(options);
    }

    /** @inheritdoc */
    override finalize(context: SohlAction.Context = {}): void {
        super.finalize(options);
    }
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
import { WeaponGearPerformer } from "@common/item/performer";
import { GearData, GearDataModel } from "@common/item/datamodel";
import { DataModelClassRegistryElement } from "@common";
import { RegisterClass } from "@utils/decorators";
import { isOfType } from "@utils";
const { NumberField } = (foundry.data as any).fields;

export const WEAPONGEAR_TYPE = "weapongear" as const;
export const isWeaponGearData = (obj: any): obj is WeaponGearData =>
    isOfType(obj, WEAPONGEAR_TYPE);

export interface WeaponGearData extends GearData<WeaponGearPerformer> {
    lengthBase: number;
}

@RegisterClass(
    new DataModelClassRegistryElement({
        kind: WEAPONGEAR_TYPE,
        logicClass: WeaponGearPerformer,
        iconCssClass: "fas fa-sword",
        img: "systems/sohl/assets/icons/sword.svg",
        sheet: "systems/sohl/templates/item/weapongear-sheet.hbs",
        schemaVersion: "0.6.0",
    }),
)
export class WeaponGearDataModel
    extends GearDataModel<WeaponGearPerformer>
    implements WeaponGearData
{
    static override readonly LOCALIZATION_PREFIXES = ["WEAPONGEAR"];
    static override readonly _metadata = {
        ...GearDataModel._metadata,
        kind: WEAPONGEAR_TYPE,
        cls: WeaponGearDataModel,
        iconCssClass: "fas fa-sword",
        img: "systems/sohl/assets/icons/sword.svg",
        sheet: "systems/sohl/templates/item/weapongear-sheet.hbs",
        schemaVersion: "0.6.0",
    } as const;
    protected static readonly logicClass = WeaponGearPerformer;
    declare readonly parent: SohlItem<WeaponGearPerformer>;
    lengthBase!: number;

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
