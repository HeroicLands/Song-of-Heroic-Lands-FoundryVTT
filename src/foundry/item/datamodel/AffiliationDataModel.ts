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

import { SohlItemProxy } from "@logic/common/item";
import { AffiliationData } from "@logic/common/item/data";
import { AffiliationPerformer } from "@logic/common/item/performer";
import { SohlItemDataModel } from "@foundry/item/datamodel";
const { NumberField, StringField } = (foundry.utils as any).fields;

export class AffiliationDataModel
    extends SohlItemDataModel<AffiliationPerformer>
    implements AffiliationData
{
    protected static readonly logicClass = AffiliationPerformer;
    declare readonly parent: SohlItemProxy<AffiliationPerformer>;
    society!: string;
    office!: string;
    title!: string;
    level!: number;

    static defineSchema() {
        return {
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
}
