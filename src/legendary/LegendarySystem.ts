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

import {
    COMMON_ACTOR_DATA_MODEL,
    COMMON_ITEM_DATA_MODEL,
    SohlSystem,
} from "@common/SohlSystem";
import { LgndCombatModifier } from "@legendary/modifier/LgndCombatModifier";
import { LgndImpactModifier } from "@legendary/modifier/LgndImpactModifier";
import { LgndSuccessTestResult } from "@legendary/result/LgndSuccessTestResult";
import { LgndOpposedTestResult } from "@legendary/result/LgndOpposedTestResult";
import { LgndCombatResult } from "@legendary/result/LgndCombatResult";
import { SohlDataModel } from "@common/SohlDataModel";
import { ActorKinds, defineType, ITEM_KIND, ItemKinds } from "@utils/constants";
import { SohlActor } from "@common/actor/SohlActor";
import { SohlItem } from "@common/item/SohlItem";
import { ContainerGear } from "@common/item/ContainerGear";

export const {
    kind: LGND_ACTOR_DATA_MODEL,
    values: LgndActorDataModels,
    isValue: isLgndActorDataModel,
    labels: LgndActorDataModelLabels,
} = defineType("TYPES.Actor", {
    ...COMMON_ACTOR_DATA_MODEL,
} as Record<string, Constructor<SohlDataModel<any>>>);

export const {
    kind: LGND_ITEM_DATA_MODEL,
    values: LgndItemDataModels,
    isValue: isLgndItemDataModel,
    labels: LgndItemDataModelLabels,
} = defineType("TYPES.Item", {
    ...COMMON_ITEM_DATA_MODEL,
} as Record<string, Constructor<SohlDataModel<any>>>);

export class LegendarySystem extends SohlSystem {
    static override get CONFIG(): SohlSystem.Config {
        return foundry.utils.mergeObject(
            SohlSystem.CONFIG,
            {
                Actor: {
                    documentSheets: [
                        {
                            cls: SohlActor.Sheet, // This should probably be a specific Legendary Actor sheet
                            types: ActorKinds,
                        },
                    ],
                    dataModels: LGND_ACTOR_DATA_MODEL,
                },
                Item: {
                    documentSheets: [
                        {
                            cls: SohlItem.Sheet, // This should probably be a specific Legendary Item sheet
                            types: ItemKinds.filter(
                                (t) => t !== ITEM_KIND.CONTAINERGEAR,
                            ),
                        },
                        {
                            cls: ContainerGear.Sheet, // This should probably be a specific Legendary Item sheet
                            types: [ITEM_KIND.CONTAINERGEAR],
                        },
                    ],
                    dataModels: LGND_ITEM_DATA_MODEL,
                },
                CombatModifier: LgndCombatModifier,
                ImpactModifier: LgndImpactModifier,
                SuccessTestResult: LgndSuccessTestResult,
                OpposedTestResult: LgndOpposedTestResult,
                CombatResult: LgndCombatResult,
            },
            { inplace: false },
        ) as unknown as SohlSystem.Config;
    }

    static override readonly ID: string = "legendary";
    static override readonly TITLE: string = "Legendary";
    static override readonly INIT_MESSAGE: string = ` _                               _
| |                             | |
| |     ___  __ _  ___ _ __   __| | __ _ _ __ _   _
| |    / _ \\/ _\` |/ _ \\ '_ \\ / _\` |/ _\` | '__| | | |
| |___|  __/ (_| |  __/ | | | (_| | (_| | |  | |_| |
\\_____/\\___|\\__, |\\___|_| |_|\\__,_|\\__,_|_|   \\__, |
             __/ |                             __/ |
            |___/                             |___/
===========================================================`;

    private static _instance: LegendarySystem | null = null;

    static getInstance(): LegendarySystem {
        if (!this._instance) {
            this._instance = new LegendarySystem();
        }
        return this._instance;
    }
}
