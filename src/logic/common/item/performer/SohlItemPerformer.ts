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

import { SohlItem, SohlItemDataModel } from "@foundry/item";
import { SohlPerformer } from "@logic/common/core";
import { SohlItemProxy } from "@logic/common/item";

export class SohlItemPerformer extends SohlPerformer {
    declare parent: SohlItemDataModel;
    readonly nestedIn: SohlItemProxy | null;

    get item(): SohlItemProxy {
        return this.parent.item;
    }

    constructor(
        parent: SohlItemDataModel,
        data: PlainObject = {},
        options: PlainObject = {},
    ) {
        super(parent, data, options);
        this.nestedIn =
            (this.parent.nestedIn &&
                this.item.actor &&
                this.item.actor.items
                    .values()
                    .find(
                        (it: SohlItemProxy) => it.id === this.parent.nestedIn,
                    )) ||
            null;
    }
}
