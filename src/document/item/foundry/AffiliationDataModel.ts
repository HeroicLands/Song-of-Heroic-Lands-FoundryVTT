/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { SohlItemDataModel } from "@src/document/item/foundry/SohlItemDataModel";
import {
    AffiliationLogic,
    AffiliationData,
} from "@src/document/item/logic/AffiliationLogic";
import { ITEM_KIND } from "@src/utils/constants";
const { StringField, NumberField } = foundry.data.fields;

/**
 * Builds the data schema for the Affiliation item, extending the base item
 * schema with affiliation-specific fields (society, office, title, level).
 * @returns The Foundry data schema for the affiliation.
 */
function defineAffiliationDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        society: new StringField({
            initial: "",
        }),
        office: new StringField({
            initial: "",
        }),
        title: new StringField({
            initial: "",
        }),
        level: new NumberField({
            integer: true,
            initial: 0,
            min: 0,
        }),
    };
}

type SohlAffiliationDataSchema = ReturnType<typeof defineAffiliationDataSchema>;

/** @internal */
export class AffiliationDataModel<
    TSchema extends foundry.data.fields.DataSchema = SohlAffiliationDataSchema,
    TLogic extends AffiliationLogic<AffiliationData> =
        AffiliationLogic<AffiliationData>,
>
    extends SohlItemDataModel<TSchema, TLogic>
    implements AffiliationData<TLogic>
{
    /** @inheritDoc */
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.Affiliation",
        "SOHL.Item",
    ];
    /** @inheritDoc */
    static override readonly kind = ITEM_KIND.AFFILIATION;
    society!: string;
    office!: string;
    title!: string;
    level!: number;

    /**
     * Returns the Foundry data schema for the affiliation item.
     * @returns The affiliation data schema.
     */
    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineAffiliationDataSchema();
    }
}
