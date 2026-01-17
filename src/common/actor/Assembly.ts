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

import {
    SohlActorBaseLogic,
    SohlActorData,
    SohlActorDataModel,
    SohlActorLogic,
    SohlActorSheetBase,
} from "@common/actor/SohlActor";
import { ACTOR_KIND, ACTOR_METADATA } from "@utils/constants";
const { DocumentIdField } = foundry.data.fields;

export class AssemblyLogic<
    TData extends AssemblyData = AssemblyData,
> extends SohlActorBaseLogic<TData> {
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

export interface AssemblyData<
    TLogic extends SohlActorLogic<AssemblyData> = SohlActorLogic<any>,
> extends SohlActorData<TLogic> {
    canonicalItemId: string | null;
}

function defineAssemblyDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlActorDataModel.defineSchema(),

        /**
         * The ID of the canonical item that this assembly represents, if any.
         *
         * @remarks
         * An assembly often represents a singlular item and all of its nested
         * items. This field indicates the item that is considered to be the
         * "root" item of the assembly; that is, the item that the assembly represents.
         * It is possible for an assembly to not have a canonical item, in which case
         * this field will be `null`.
         */
        canonicalItemId: new DocumentIdField({
            initial: null,
        }),
    };
}

type AssemblyDataSchema = ReturnType<typeof defineAssemblyDataSchema>;

/**
 * The Foundry VTT data model for the Assembly actor.
 */
export class AssemblyDataModel<
        TSchema extends foundry.data.fields.DataSchema = AssemblyDataSchema,
        TLogic extends
            AssemblyLogic<AssemblyData> = AssemblyLogic<AssemblyData>,
    >
    extends SohlActorDataModel<TSchema, TLogic>
    implements AssemblyData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.Assembly.DATA"];
    static override readonly kind = ACTOR_KIND.ASSEMBLY;
    canonicalItemId!: string | null;

    static defineSchema(): foundry.data.fields.DataSchema {
        return defineAssemblyDataSchema();
    }
}

export class AssemblySheet extends SohlActorSheetBase {}
