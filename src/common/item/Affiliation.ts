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
import { ITEM_KIND } from "@utils/constants";
const { StringField, NumberField } = foundry.data.fields;

export class Affiliation<TData extends Affiliation.Data = Affiliation.Data>
    extends SohlItem.BaseLogic<TData>
    implements Affiliation.Logic<TData>
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

export namespace Affiliation {
    export const Kind = ITEM_KIND.AFFILIATION;

    export interface Logic<
        TData extends SohlItem.Data<any> = SohlItem.Data<any>,
    > extends SohlItem.Logic<TData> {}

    export interface Data<
        TLogic extends SohlItem.Logic<Data> = SohlItem.Logic<any>,
    > extends SohlItem.Data<TLogic> {
        society: string;
        office: string;
        title: string;
        level: number;
    }
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
            Affiliation.Logic<Affiliation.Data> = Affiliation.Logic<Affiliation.Data>,
    >
    extends SohlItemDataModel<TSchema, TLogic>
    implements Affiliation.Data<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["Affiliation"];
    static override readonly kind = Affiliation.Kind;
    society!: string;
    office!: string;
    title!: string;
    level!: number;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineAffiliationDataSchema();
    }
}

export class AffiliationSheet extends SohlItemSheetBase {
    static override PARTS = {
        ...super.PARTS,
        properties: {
            template: "systems/sohl/templates/item/affiliation.hbs",
        },
    };

    override async _preparePropertiesContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }
}
