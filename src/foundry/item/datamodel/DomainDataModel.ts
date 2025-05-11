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
import {
    DomainData,
    DIVINE_EMBODIMENT_CATEGORY,
    ELEMENT_CATEGORY,
    DivineEmbodimentCategoryValue,
    ElementCategoryValue,
} from "@logic/common/item/data";
import { DomainPerformer } from "@logic/common/item/performer";
import { SohlItemDataModel } from "@foundry/item/datamodel";
const { ArrayField, StringField } = (foundry.utils as any).fields;

export class DomainDataModel
    extends SohlItemDataModel<DomainPerformer>
    implements DomainData
{
    protected static readonly logicClass = DomainPerformer;
    declare readonly parent: SohlItemProxy<DomainPerformer>;
    abbrev!: string;
    cusp!: string;
    magicMod!: ElementCategoryValue[];
    embodiments!: DivineEmbodimentCategoryValue[];

    static defineSchema() {
        return {
            ...super.defineSchema(),
            abbrev: new StringField(),
            cusp: new StringField(),
            magicMod: new ArrayField(
                new StringField({
                    choices: Object.values(ELEMENT_CATEGORY),
                    initial: ELEMENT_CATEGORY.ARCANA,
                    required: true,
                }),
            ),
            embodiments: new ArrayField(
                new StringField({
                    choices: Object.values(DIVINE_EMBODIMENT_CATEGORY),
                    initial: DIVINE_EMBODIMENT_CATEGORY.DREAMS,
                    required: true,
                }),
            ),
        };
    }
}
