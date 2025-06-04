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

import { CombatTechniqueStrikeModeData } from "@common/item/datamodel";
import { PerformerClassRegistryElement, SohlPerformer } from "@common";
import { RegisterClass } from "@utils/decorators";
import { StrikeModePerformer } from "./StrikeModePerformer";

@RegisterClass(
    new PerformerClassRegistryElement({
        kind: "CombatTechniqueStrikeModePerformer",
    }),
)
export class CombatTechniqueStrikeModePerformer extends StrikeModePerformer<CombatTechniqueStrikeModeData> {
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
import { CombatTechniqueStrikeModePerformer } from "@common/item/performer";
import {
    SohlItemDataModel,
    StrikeModeData,
    StrikeModeDataModel,
} from "@common/item/datamodel";
import { RegisterClass } from "@utils/decorators";
import { DataModelClassRegistryElement } from "@common/SohlBaseDataModel";
import { isOfType } from "@utils";
const { NumberField } = (foundry.data as any).fields;

export const COMBATTECHNIQUESTRIKEMODE_TYPE =
    "combattechniquestrikemode" as const;
export const isCombatTechniqueStrikeModeData = (
    obj: any,
): obj is CombatTechniqueStrikeModeData =>
    isOfType(obj, COMBATTECHNIQUESTRIKEMODE_TYPE);

export interface CombatTechniqueStrikeModeData
    extends StrikeModeData<CombatTechniqueStrikeModePerformer> {
    lengthBase: number;
}

@RegisterClass(
    new DataModelClassRegistryElement({
        kind: COMBATTECHNIQUESTRIKEMODE_TYPE,
        logicClass: CombatTechniqueStrikeModePerformer,
        iconCssClass: "fas fa-hand-fist",
        img: "systems/sohl/assets/icons/punch.svg",
        sheet: "systems/sohl/templates/item/combattechniquestrikemode-sheet.hbs",
        schemaVersion: "0.6.0",
    }),
)
export class CombatTechniqueStrikeModeDataModel
    extends StrikeModeDataModel<CombatTechniqueStrikeModePerformer>
    implements CombatTechniqueStrikeModeData
{
    static override readonly LOCALIZATION_PREFIXES = [
        "COMBATTECHNIQUESTRIKEMODE",
    ];
    declare readonly parent: SohlItem<CombatTechniqueStrikeModePerformer>;
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
