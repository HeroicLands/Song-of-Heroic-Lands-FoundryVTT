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

import {
    SohlActorDataModel,
} from "@common/actor/foundry/SohlActor";
import { ACTOR_KIND } from "@utils/constants";
import type { AssemblyData } from "@common/actor/logic/AssemblyLogic";
import { AssemblyLogic } from "@common/actor/logic/AssemblyLogic";

function defineAssemblyDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlActorDataModel.defineSchema(),
    };
}

type AssemblyDataSchema = ReturnType<typeof defineAssemblyDataSchema>;

/**
 * The Foundry VTT data model for the Assembly actor.
 *
 * Assemblies have no schema fields beyond those inherited from
 * {@link SohlActorDataModel}. The canonical item is derived at runtime
 * from the embedded items collection.
 */
export class AssemblyDataModel<
        TSchema extends foundry.data.fields.DataSchema = AssemblyDataSchema,
        TLogic extends
            AssemblyLogic<AssemblyData> = AssemblyLogic<AssemblyData>,
    >
    extends SohlActorDataModel<TSchema, TLogic>
    implements AssemblyData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.Assembly", "SOHL.Actor"];
    static override readonly kind = ACTOR_KIND.ASSEMBLY;

    static defineSchema(): foundry.data.fields.DataSchema {
        return defineAssemblyDataSchema();
    }
}
