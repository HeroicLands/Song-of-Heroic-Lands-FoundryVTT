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

import type { SohlActionContext } from "@common/SohlActionContext";

import {
    SohlItem,
    SohlItemBaseLogic,
    SohlItemData,
    SohlItemDataModel,
    SohlItemLogic,
    SohlItemSheetBase,
} from "@common/item/SohlItem";
import {
    ITEM_KIND,
    ITEM_METADATA,
    PhilosophySubType,
    PhilosophySubTypes,
} from "@utils/constants";
const { StringField } = foundry.data.fields;

export class PhilosophyLogic<TData extends PhilosophyData = PhilosophyData>
    extends SohlItemBaseLogic<TData>
    implements PhilosophyLogic<TData>
{
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

export interface PhilosophyData<
    TLogic extends PhilosophyLogic<PhilosophyData> = PhilosophyLogic<any>,
> extends SohlItemData<TLogic> {
    subType: PhilosophySubType;
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
            PhilosophyLogic<PhilosophyData> = PhilosophyLogic<PhilosophyData>,
    >
    extends SohlItemDataModel<TSchema, TLogic>
    implements PhilosophyData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.Philosophy.DATA"];
    static override readonly kind = ITEM_KIND.PHILOSOPHY;
    subType!: PhilosophySubType;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return definePhilosophyDataSchema();
    }
}

export class PhilosophySheet extends SohlItemSheetBase {
    override async _preparePropertiesContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }
}
