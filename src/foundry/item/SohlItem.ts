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

import { SohlItemDataModel } from "@foundry/item";
import { SohlItemProxy } from "@logic/common/item";

export class SohlItem
    extends foundry.documents.Item
    implements SohlItemProxy<SohlItem>
{
    declare id: string;
    declare name: string;
    declare type: string;
    declare parent: foundry.documents.Actor | null;
    declare system: SohlItemDataModel;

    get actor(): foundry.documents.Actor {
        return this.parent;
    }

    get isNested(): boolean {
        return !!this.system.nestedIn;
    }

    get nestedItems(): SohlItem[] {
        return (this.actor as any)?.items.filter(
            (i: SohlItem) => i.system.nestedIn === this.id,
        );
    }

    async update(
        data: PlainObject | PlainObject[],
        options?: PlainObject,
    ): Promise<SohlItem | SohlItem[]> {
        return await super.update(data as any, options);
    }

    async delete(context?: PlainObject): Promise<SohlItem> {
        return await super.delete(context);
    }

    /**
     * @param {HTMLElement} btn The button element that was clicked.
     */
    async onChatCardButton(btn: HTMLElement): Promise<void> {
        // TODO: Handle chat card button clicks here
        console.log("Button clicked:", btn);
    }

    /**
     * @param {HTMLElement} btn The button element that was clicked.
     */
    async onChatCardEditAction(btn: HTMLElement): Promise<void> {
        // TODO: Handle chat card edit actions here
        console.log("Edit action clicked:", btn);
    }
}
