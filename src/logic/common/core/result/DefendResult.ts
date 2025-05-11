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

import { ImpactResult } from "@logic/common/core/result";
import { ContextMenuSortGroup, SohlContextMenu } from "@foundry/core";
import { RegisterClass } from "@utils";

@RegisterClass("DefendResult", "0.6.0")
export class DefendResult extends ImpactResult {
    static override readonly Mishap = {
        ...super.Mishap,
        STUMBLE_TEST: "stumbletest",
        STUMBLE: "stumble",
        FUMBLE_TEST: "fumbletest",
        FUMBLE: "fumble",
        WEAPON_BREAK: "weaponBreak",
    } as const;

    static override readonly TestType = {
        BLOCK: {
            id: "blockTest",
            iconClass: "fas fa-shield",
            condition: (header: any) => true,
            group: ContextMenuSortGroup.ESSENTIAL,
        },
        COUNTERSTRIKE: {
            id: "counterstrikeTest",
            iconClass: "fas fa-circle-half-stroke",
            condition: (header: any) => true,
            group: ContextMenuSortGroup.ESSENTIAL,
        },
        DODGE: {
            id: "dodgeTest",
            iconClass: "fas fa-person-walking-arrow-loop-left",
            condition: (header: HTMLElement) => {
                const item = SohlContextMenu._getContextItem(header);
                const dodge = item?.actor?.getItem("Dodge");
                return dodge && !dodge.system.masteryLevel.disabled;
            },
            group: ContextMenuSortGroup.ESSENTIAL,
        },
        IGNORE: {
            id: "ignore",
            iconClass: "fas fa-ban",
            condition: () => true,
            group: ContextMenuSortGroup.ESSENTIAL,
        },
    } as const;

    static override readonly TestTypeEnum = Object.freeze(
        Object.fromEntries(
            Object.entries(DefendResult.TestType).map(([key, value]) => [
                key,
                value.id,
            ]),
        ),
    ) as StrictObject<string>;

    async evaluate(): Promise<boolean> {
        const allowed = await super.evaluate();
        if (!allowed) return false;

        if (
            this.testType === DefendResult.TestType.BLOCK.id ||
            this.testType === DefendResult.TestType.COUNTERSTRIKE.id
        ) {
            if (this.isCritical && !this.isSuccess && this.lastDigit === 0) {
                this.mishaps.add(DefendResult.Mishap.FUMBLE_TEST);
            }
            if (this.isCritical && !this.isSuccess && this.lastDigit === 5) {
                this.mishaps.add(DefendResult.Mishap.STUMBLE_TEST);
            }
            this.deliversImpact = false;
        } else if (this.testType === DefendResult.TestType.DODGE.id) {
            if (this.isCritical && !this.isSuccess) {
                this.mishaps.add(DefendResult.Mishap.STUMBLE_TEST);
            }
            this.deliversImpact = false;
        }
        return true;
    }
}
