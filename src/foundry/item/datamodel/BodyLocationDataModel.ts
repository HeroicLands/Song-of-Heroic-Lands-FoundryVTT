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
import { BodyLocationData } from "@logic/common/item/data";
import { BodyLocationPerformer } from "@logic/common/item/performer";
import { SohlItemDataModel } from "@foundry/item/datamodel";
const { BooleanField, StringField } = (foundry.utils as any).fields;

export class BodyLocationDataModel
    extends SohlItemDataModel<BodyLocationPerformer>
    implements BodyLocationData
{
    protected static readonly logicClass = BodyLocationPerformer;
    declare readonly parent: SohlItemProxy<BodyLocationPerformer>;
    abbrev!: string;
    isFumble!: boolean;
    isStumble!: boolean;

    static defineSchema() {
        return {
            abbrev: new StringField(),
            isFumble: new BooleanField({ initial: false }),
            isStumble: new BooleanField({ initial: false }),
        };
    }
}
