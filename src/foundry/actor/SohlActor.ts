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

import { SohlActorProxy } from "@logic/common/actor";
import { SohlPerformerData } from "@logic/common/core";
import { SohlItemProxy } from "@logic/common/item";
import { SohlMap } from "@utils";

export class SohlActor
    extends foundry.documents.Actor
    implements SohlActorProxy<SohlActor>
{
    declare id: string;
    declare name: string;
    declare type: string;
    declare system: SohlPerformerData;
    get items(): SohlMap<string, SohlItemProxy> {
        return new SohlMap(
            super.items.map((item: SohlItemProxy) => [item.id, item]),
        );
    }
    async update(
        data: PlainObject | PlainObject[],
        options?: PlainObject,
    ): Promise<SohlActor | SohlActor[]> {
        return await super.update(data as any, options);
    }
    async delete(context?: PlainObject): Promise<SohlActor> {
        return await super.delete(context);
    }
}
