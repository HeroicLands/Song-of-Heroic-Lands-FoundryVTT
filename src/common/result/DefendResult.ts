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

import { SohlItem } from "@common/item";
import { ImpactResult } from "@common/result";
import { SKILL_TYPE } from "@common/item/data";
import { CONTEXTMENU_SORT_GROUP, defineType, SohlContextMenu } from "@utils";

export const {
    kind: DEFENDRESULT_MISHAP,
    values: DefendResultMishaps,
    isValue: isDefendResultMishap,
} = defineType({
    STUMBLE_TEST: "stumbletest",
    STUMBLE: "stumble",
    FUMBLE_TEST: "fumbletest",
    FUMBLE: "fumble",
    WEAPON_BREAK: "weaponBreak",
});
export type DefendResultMishap =
    (typeof DEFENDRESULT_MISHAP)[keyof typeof DEFENDRESULT_MISHAP];

const DEFENDRESULT_TESTTYPE = {
    BLOCK: {
        id: "blockTest",
        iconClass: "fas fa-shield",
        condition: (header: any) => true,
        group: CONTEXTMENU_SORT_GROUP.ESSENTIAL,
    },
    COUNTERSTRIKE: {
        id: "counterstrikeTest",
        iconClass: "fas fa-circle-half-stroke",
        condition: (header: any) => true,
        group: CONTEXTMENU_SORT_GROUP.ESSENTIAL,
    },
    DODGE: {
        id: "dodgeTest",
        iconClass: "fas fa-person-walking-arrow-loop-left",
        condition: (header: HTMLElement) => {
            const item = SohlContextMenu._getContextItem(header);
            const dodge = item?.actor?.items
                ?.values()
                .find(
                    (it: SohlItem) =>
                        it.type === SKILL_TYPE && it.name === "Dodge",
                );
            return dodge && !dodge.system.masteryLevel.disabled;
        },
        group: CONTEXTMENU_SORT_GROUP.ESSENTIAL,
    },
    IGNORE: {
        id: "ignore",
        iconClass: "fas fa-ban",
        condition: () => true,
        group: CONTEXTMENU_SORT_GROUP.ESSENTIAL,
    },
} as const;

export class DefendResult extends ImpactResult {
    async evaluate(): Promise<boolean> {
        const allowed = await super.evaluate();
        if (!allowed) return false;

        if (
            this.testType === DEFENDRESULT_TESTTYPE.BLOCK.id ||
            this.testType === DEFENDRESULT_TESTTYPE.COUNTERSTRIKE.id
        ) {
            if (this.isCritical && !this.isSuccess && this.lastDigit === 0) {
                this.mishaps.add(DEFENDRESULT_MISHAP.FUMBLE_TEST);
            }
            if (this.isCritical && !this.isSuccess && this.lastDigit === 5) {
                this.mishaps.add(DEFENDRESULT_MISHAP.STUMBLE_TEST);
            }
            this.deliversImpact = false;
        } else if (this.testType === DEFENDRESULT_TESTTYPE.DODGE.id) {
            if (this.isCritical && !this.isSuccess) {
                this.mishaps.add(DEFENDRESULT_MISHAP.STUMBLE_TEST);
            }
            this.deliversImpact = false;
        }
        return true;
    }
}
