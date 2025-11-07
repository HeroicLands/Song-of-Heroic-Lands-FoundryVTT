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
    COMMON_ACTOR_SHEETS,
    COMMON_ITEM_DATA_MODEL,
    COMMON_ITEM_SHEETS,
    SohlSystem,
} from "@common/SohlSystem";
import { LgndCombatModifier } from "@legendary/modifier/LgndCombatModifier";
import { LgndImpactModifier } from "@legendary/modifier/LgndImpactModifier";
import { LgndSuccessTestResult } from "@legendary/result/LgndSuccessTestResult";
import { LgndOpposedTestResult } from "@legendary/result/LgndOpposedTestResult";
import { LgndCombatResult } from "@legendary/result/LgndCombatResult";
import { SohlDataModel } from "@common/SohlDataModel";
import {
    ACTOR_KIND,
    ActorKinds,
    DefinedType,
    defineType,
    ITEM_KIND,
    ItemKinds,
} from "@utils/constants";
import { SohlActor } from "@common/actor/SohlActor";
import { SohlItem } from "@common/item/SohlItem";
import { ContainerGearLogic } from "@common/item/ContainerGear";
import { Assembly, AssemblySheet } from "@common/actor/Assembly";
import { EntitySheet } from "@common/actor/Entity";

type ActorDMMap = Record<string, Constructor<SohlDataModel<any, SohlActor>>>;
const ACTOR_DM_DEF: ActorDMMap = {
    ...COMMON_ACTOR_DATA_MODEL,
} satisfies ActorDMMap;
const defActor: DefinedType<ActorDMMap> = defineType<ActorDMMap>(
    "TYPES.Actor",
    ACTOR_DM_DEF,
);
export const {
    kind: LGND_ACTOR_DATA_MODEL,
    isValue: isLgndActorDataModel,
    labels: LgndActorDataModelLabels,
}: {
    kind: ActorDMMap;
    isValue: (value: unknown) => value is ActorDMMap[keyof ActorDMMap];
    labels: StrictObject<string>;
} = defActor;
export const LgndActorDataModels: ActorDMMap[keyof ActorDMMap][] =
    Object.values(LGND_ACTOR_DATA_MODEL);

type ItemDMMap = Record<string, Constructor<SohlDataModel<any, SohlItem>>>;
const ITEM_DM_DEF: ItemDMMap = {
    ...COMMON_ITEM_DATA_MODEL,
} satisfies ItemDMMap;
const defItem: DefinedType<ItemDMMap> = defineType<ItemDMMap>(
    "TYPES.Item",
    ITEM_DM_DEF,
);
export const {
    kind: LGND_ITEM_DATA_MODEL,
    isValue: isLgndItemDataModel,
    labels: LgndItemDataModelLabels,
}: {
    kind: ItemDMMap;
    isValue: (value: unknown) => value is ItemDMMap[keyof ItemDMMap];
    labels: StrictObject<string>;
} = defItem;
export const LgndItemDataModels: ItemDMMap[keyof ItemDMMap][] =
    Object.values(LGND_ITEM_DATA_MODEL);

export class LegendarySystem extends SohlSystem {
    static override get CONFIG(): SohlSystem.Config {
        return foundry.utils.mergeObject(
            SohlSystem.CONFIG,
            {
                Actor: {
                    documentSheets: ActorKinds.map((kind) => {
                        return {
                            cls: COMMON_ACTOR_SHEETS[kind],
                            types: [kind],
                        };
                    }),
                    dataModels: LGND_ACTOR_DATA_MODEL,
                },
                Item: {
                    documentSheets: ItemKinds.map((kind) => {
                        return { cls: COMMON_ITEM_SHEETS[kind], types: [kind] };
                    }),
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
