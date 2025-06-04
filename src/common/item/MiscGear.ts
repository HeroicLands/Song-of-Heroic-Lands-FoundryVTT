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

import { MiscGearData } from "@common/item/datamodel";
import { PerformerClassRegistryElement, SohlPerformer } from "@common";
import { RegisterClass } from "@utils/decorators";

@RegisterClass(
    new PerformerClassRegistryElement({
        kind: "MiscGearPerformer",
    }),
)
export class MiscGearPerformer extends SohlPerformer<MiscGearData> {
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
import { MiscGearPerformer } from "@common/item/performer";
import { GearData, GearDataModel } from "@common/item/datamodel";
import { DataModelClassRegistryElement } from "@common/SohlBaseDataModel";
import { RegisterClass } from "@utils/decorators";
import { isOfType } from "@utils";
const { NumberField } = (foundry.data as any).fields;

export const MISCGEAR_TYPE = "domain" as const;
export const isMiscGearData = (obj: any): obj is MiscGearData =>
    isOfType(obj, MISCGEAR_TYPE);

export interface MiscGearData extends GearData<MiscGearPerformer> {}

@RegisterClass(
    new DataModelClassRegistryElement({
        kind: MISCGEAR_TYPE,
        logicClass: MiscGearPerformer,
        iconCssClass: "fas fa-ball-pile",
        img: "systems/sohl/assets/icons/miscgear.svg",
        sheet: "systems/sohl/templates/item/miscgear-sheet.hbs",
        schemaVersion: "0.6.0",
    }),
)
export class MiscGearDataModel
    extends GearDataModel<MiscGearPerformer>
    implements MiscGearData
{
    static override readonly LOCALIZATION_PREFIXES = ["MISCGEAR"];
    static override readonly _metadata = {
        ...GearDataModel._metadata,
    } as const;
    protected static readonly logicClass = MiscGearPerformer;
    declare readonly parent: SohlItem<MiscGearPerformer>;
}
