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

import type { SohlEventContext } from "@common/event/SohlEventContext";

import {
    SohlActor,
    SohlActorDataModel,
    SohlActorSheetBase,
} from "@common/actor/SohlActor";
import { ACTOR_KIND } from "@utils/constants";
const { DocumentIdField } = foundry.data.fields;

export class Assembly extends SohlActor.BaseLogic implements Assembly.Logic {
    /** @inheritdoc */
    override initialize(context: SohlEventContext): void {
        super.initialize(context);
    }

    /** @inheritdoc */
    override evaluate(context: SohlEventContext): void {
        super.evaluate(context);
    }

    /** @inheritdoc */
    override finalize(context: SohlEventContext): void {
        super.finalize(context);
    }
}

export namespace Assembly {
    export const Kind = ACTOR_KIND.ASSEMBLY;

    /**
     * The data shape for the Assembly actor.
     */
    export interface Logic<
        TData extends SohlActor.Data<any> = SohlActor.Data<any>,
    > extends SohlActor.Logic<TData> {}

    export interface Data<
        TLogic extends SohlActor.Logic<Data> = SohlActor.Logic<any>,
    > extends SohlActor.Data<TLogic> {
        canonicalItemId: string | null;
    }
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
            Assembly.Logic<Assembly.Data> = Assembly.Logic<Assembly.Data>,
    >
    extends SohlActorDataModel<TSchema, TLogic>
    implements Assembly.Data<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["Assembly"];
    static override readonly kind = Assembly.Kind;
    canonicalItemId!: string | null;

    static defineSchema(): foundry.data.fields.DataSchema {
        return defineAssemblyDataSchema();
    }
}

export class AssemblySheet extends SohlActorSheetBase {
    static override PARTS = {
        ...super.PARTS,
        properties: {
            template: "systems/sohl/templates/actor/assembly.hbs",
        },
    };
}
