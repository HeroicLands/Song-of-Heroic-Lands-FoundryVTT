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

import { SohlItemDataModel } from "@src/document/item/foundry/SohlItem";
import { DomainLogic, DomainData } from "@src/document/item/logic/DomainLogic";
import {
    ITEM_KIND,
    DomainSubTypes,
    DOMAIN_SUBTYPE,
    DomainSubType,
} from "@src/utils/constants";
const { StringField } = foundry.data.fields;

function defineDomainSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        subType: new StringField({
            choices: DomainSubTypes,
            required: true,
            default: DOMAIN_SUBTYPE.ARCANE,
        }),
        philosophyCode: new StringField({
            blank: false,
            required: true,
        }),
    };
}

type DomainSchema = ReturnType<typeof defineDomainSchema>;

export class DomainDataModel<
    TSchema extends foundry.data.fields.DataSchema = DomainSchema,
    TLogic extends DomainLogic<DomainData> = DomainLogic<DomainData>,
>
    extends SohlItemDataModel<TSchema, TLogic>
    implements DomainData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.Domain",
        "SOHL.Item",
    ];
    static override readonly kind = ITEM_KIND.DOMAIN;
    subType!: DomainSubType;
    philosophyCode!: string;

    static defineSchema(): foundry.data.fields.DataSchema {
        return defineDomainSchema();
    }
}
