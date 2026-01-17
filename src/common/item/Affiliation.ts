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
    SohlItemBaseLogic,
    SohlItemData,
    SohlItemDataModel,
    SohlItemLogic,
    SohlItemSheetBase,
} from "@common/item/SohlItem";
import { ITEM_KIND, ITEM_METADATA } from "@utils/constants";
const { StringField, NumberField } = foundry.data.fields;

export class AffiliationLogic<
    TData extends AffiliationData = AffiliationData,
> extends SohlItemBaseLogic<TData> {
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

export interface AffiliationData<
    TLogic extends SohlItemLogic<AffiliationData> = SohlItemLogic<any>,
> extends SohlItemData<TLogic> {
    society: string;
    office: string;
    title: string;
    level: number;
}

function defineAffiliationDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        society: new StringField(),
        office: new StringField(),
        title: new StringField(),
        level: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
    };
}

type SohlAffiliationDataSchema = ReturnType<typeof defineAffiliationDataSchema>;

export class AffiliationDataModel<
        TSchema extends
            foundry.data.fields.DataSchema = SohlAffiliationDataSchema,
        TLogic extends
            AffiliationLogic<AffiliationData> = AffiliationLogic<AffiliationData>,
    >
    extends SohlItemDataModel<TSchema, TLogic>
    implements AffiliationData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.Affiliation.DATA"];
    static override readonly kind = ITEM_KIND.AFFILIATION;
    society!: string;
    office!: string;
    title!: string;
    level!: number;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineAffiliationDataSchema();
    }
}

export class AffiliationSheet extends SohlItemSheetBase {
    override async _preparePropertiesContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }
}
