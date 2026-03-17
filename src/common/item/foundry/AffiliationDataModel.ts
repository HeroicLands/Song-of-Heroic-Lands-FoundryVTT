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

import { SohlItemDataModel } from "@common/item/foundry/SohlItem";
import { AffiliationLogic, AffiliationData } from "@common/item/logic/AffiliationLogic";
import { ITEM_KIND } from "@utils/constants";
const { StringField, NumberField } = foundry.data.fields;

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

export class AffiliationDataModel<
        TSchema extends
            foundry.data.fields.DataSchema = SohlAffiliationDataSchema,
        TLogic extends
            AffiliationLogic<AffiliationData> = AffiliationLogic<AffiliationData>,
    >
    extends SohlItemDataModel<TSchema, TLogic>
    implements AffiliationData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.Affiliation", "SOHL.Item"];
    static override readonly kind = ITEM_KIND.AFFILIATION;
    society!: string;
    office!: string;
    title!: string;
    level!: number;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineAffiliationDataSchema();
    }
}
