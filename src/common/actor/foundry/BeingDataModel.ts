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
import type { BeingData } from "@common/actor/logic/BeingLogic";
import { BeingLogic } from "@common/actor/logic/BeingLogic";

const { StringField } = foundry.data.fields;

function defineBeingDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlActorDataModel.defineSchema(),
    };
}

type BeingDataSchema = ReturnType<typeof defineBeingDataSchema>;

/**
 * The Foundry VTT data model for the Being actor.
 */
export class BeingDataModel<
        TSchema extends foundry.data.fields.DataSchema = BeingDataSchema,
        TLogic extends BeingLogic<BeingData> = BeingLogic<BeingData>,
    >
    extends SohlActorDataModel<TSchema, TLogic>
    implements BeingData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.Being",
        "SOHL.Actor",
    ];
    static override readonly kind = ACTOR_KIND.BEING;

    static defineSchema(): foundry.data.fields.DataSchema {
        return defineBeingDataSchema();
    }
}
