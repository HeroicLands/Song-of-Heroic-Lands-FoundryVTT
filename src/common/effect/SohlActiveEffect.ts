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

import type { SohlActor } from "@common/actor/SohlActor";
import type { SohlItem } from "@common/item/SohlItem";
import type { SohlContextMenu } from "@utils/SohlContextMenu";
import type { SohlEffectData } from "@common/effect/SohlEffectData";
import { ItemKinds } from "@utils/constants";

export class SohlActiveEffect extends ActiveEffect {
    /**
     * Get the logic object for this item.
     * @remarks
     * This is a convenience accessor to avoid having to access `this.system.logic`
     */
    get logic(): SohlEffectData {
        return (this.system as any).logic as SohlEffectData;
    }

    get item(): SohlItem | null {
        return ItemKinds.includes(this.parent?.type as any) ?
                (this.parent as SohlItem)
            :   null;
    }

    get actor(): SohlActor {
        return (this.item?.actor || this.parent) as unknown as SohlActor;
    }

    /**
     * Get the context menu options for a specific SohlItem document.
     * @param doc The SohlItem document to get context options for.
     * @returns The context menu options for the specified SohlItem document.
     */
    static _getContextOptions(doc: SohlActiveEffect): SohlContextMenu.Entry[] {
        return doc._getContextOptions();
    }

    /**
     * Get the context menu options for this item.
     * @returns The context menu options for this item.
     */
    _getContextOptions(): SohlContextMenu.Entry[] {
        return this.logic._getContextOptions();
    }
}
