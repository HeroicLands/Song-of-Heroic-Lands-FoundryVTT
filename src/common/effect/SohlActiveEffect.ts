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

import type { SohlActor } from "@common/actor/SohlActor";
import { SohlItem } from "@common/item/SohlItem";
import { SohlLogic } from "@common/SohlLogic";
import type { SohlContextMenu } from "@utils/SohlContextMenu";

const kSohlActiveEffect = Symbol("SohlActiveEffect");

export class SohlActiveEffect extends ActiveEffect {
    readonly [kSohlActiveEffect] = true;

    static isA(obj: unknown): obj is SohlActor {
        return (
            typeof obj === "object" && obj !== null && kSohlActiveEffect in obj
        );
    }

    get logic(): SohlLogic {
        return (this.system as any).logic;
    }

    get item(): SohlItem | null {
        return this.parent instanceof SohlItem ? this.parent : null;
    }

    get actor(): SohlActor {
        return (this.item?.actor || this.parent) as unknown as SohlActor;
    }

    static _getContextOptions(doc: SohlActiveEffect): SohlContextMenu.Entry[] {
        return doc._getContextOptions();
    }

    _getContextOptions(): SohlContextMenu.Entry[] {
        return this.logic._getContextOptions();
    }
}
