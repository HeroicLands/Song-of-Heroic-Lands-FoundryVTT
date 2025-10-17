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
    SohlItem,
    SohlItemDataModel,
    SohlItemSheetBase,
} from "@common/item/SohlItem";
import {
    ITEM_KIND,
    PhilosophySubType,
    PhilosophySubTypes,
} from "@utils/constants";
const { StringField } = foundry.data.fields;

export class Philosophy<TData extends Philosophy.Data = Philosophy.Data>
    extends SohlItem.BaseLogic<TData>
    implements Philosophy.Logic<TData>
{
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

export namespace Philosophy {
    export const Kind = ITEM_KIND.PHILOSOPHY;

    export interface Logic<
        TData extends Philosophy.Data<any> = Philosophy.Data<any>,
    > extends SohlItem.Logic<TData> {}

    export interface Data<
        TLogic extends Philosophy.Logic<Data> = Philosophy.Logic<any>,
    > extends SohlItem.Data<TLogic> {
        subType: PhilosophySubType;
    }
}

function definePhilosophyDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        subType: new StringField({
            choices: PhilosophySubTypes,
            required: true,
        }),
    };
}

type PhilosophyDataSchema = ReturnType<typeof definePhilosophyDataSchema>;

export class PhilosophyDataModel<
        TSchema extends foundry.data.fields.DataSchema = PhilosophyDataSchema,
        TLogic extends
            Philosophy.Logic<Philosophy.Data> = Philosophy.Logic<Philosophy.Data>,
    >
    extends SohlItemDataModel<TSchema, TLogic>
    implements Philosophy.Data<TLogic>
{
    static readonly LOCALIZATION_PREFIXES = ["Philosophy"];
    static readonly kind = Philosophy.Kind;
    subType!: PhilosophySubType;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return definePhilosophyDataSchema();
    }
}

export class PhilosophySheet extends SohlItemSheetBase {
    static override PARTS = {
        ...super.PARTS,
        properties: {
            template: "systems/sohl/templates/item/affliction.hbs",
        },
    };

    override async _preparePropertiesContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }
}
