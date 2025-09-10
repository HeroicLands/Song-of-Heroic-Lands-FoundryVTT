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

import { ImpactResult } from "@common/result/ImpactResult";
import {
    defineType,
    DEFEND_MISHAP,
    SOHL_CONTEXT_MENU_SORT_GROUP,
} from "@utils/constants";
const kDefendResult = Symbol("DefendResult");
const kData = Symbol("DefendResult.Data");
const kContext = Symbol("DefendResult.Context");

export class DefendResult extends ImpactResult {
    situationalModifier: number;
    readonly [kDefendResult] = true;

    static isA(obj: unknown): obj is DefendResult {
        return typeof obj === "object" && obj !== null && kDefendResult in obj;
    }

    constructor(
        data: Partial<DefendResult.Data> = {},
        options: Partial<DefendResult.Options> = {},
    ) {
        super(data, options);
        this.situationalModifier = data.situationalModifier ?? 0;
    }

    async evaluate(): Promise<boolean> {
        const allowed = await super.evaluate();
        if (!allowed) return false;

        if (
            this.testType === DefendResult.DEFEND_TESTTYPE.BLOCK.id ||
            this.testType === DefendResult.DEFEND_TESTTYPE.COUNTERSTRIKE.id
        ) {
            if (this.isCritical && !this.isSuccess && this.lastDigit === 0) {
                this.mishaps.add(DEFEND_MISHAP.FUMBLE_TEST);
            }
            if (this.isCritical && !this.isSuccess && this.lastDigit === 5) {
                this.mishaps.add(DEFEND_MISHAP.STUMBLE_TEST);
            }
            this.deliversImpact = false;
        } else if (this.testType === DefendResult.DEFEND_TESTTYPE.DODGE.id) {
            if (this.isCritical && !this.isSuccess) {
                this.mishaps.add(DEFEND_MISHAP.STUMBLE_TEST);
            }
            this.deliversImpact = false;
        }
        return true;
    }
}

export namespace DefendResult {
    export const {
        kind: DEFEND_TESTTYPE,
        values: DefendTestTypes,
        isValue: isDefendTestType,
    } = defineType("SOHL.DefendResult.TestType", {
        BLOCK: {
            id: "blockTest",
            iconClass: "fas fa-shield",
            condition: (header: HTMLElement): boolean => {
                return true;
            },
            group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
        },
        COUNTERSTRIKE: {
            id: "counterstrikeTest",
            iconClass: "fas fa-circle-half-stroke",
            condition: (header: HTMLElement): boolean => {
                return true;
            },
            group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
        },
        DODGE: {
            id: "dodgeTest",
            iconClass: "fas fa-person-walking-arrow-loop-left",
            // condition: (header: HTMLElement): boolean => {
            //     const item = SohlContextMenu._getContextItem(header);
            //     const dodge = item?.actor?.items
            //         ?.values()
            //         .find(
            //             (it: SohlItem) =>
            //                 Skill.Data.isA(it.system) && it.name === "Dodge",
            //         );
            //     return dodge && !dodge.system.masteryLevel.disabled;
            // },
            group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
        },
        IGNORE: {
            id: "ignore",
            iconClass: "fas fa-ban",
            condition: (header: HTMLElement): boolean => {
                return true;
            },
            group: SOHL_CONTEXT_MENU_SORT_GROUP.ESSENTIAL,
        },
    });
    export type DefendTestType =
        (typeof DEFEND_TESTTYPE)[keyof typeof DEFEND_TESTTYPE];

    export interface Data extends ImpactResult.Data {
        readonly [kData]: true;

        situationalModifier: number;
    }

    export namespace Data {
        export function isA(obj: unknown): obj is Data {
            return typeof obj === "object" && obj !== null && kData in obj;
        }
    }

    export interface Options extends ImpactResult.Options {}

    export class Context extends ImpactResult.Context {
        readonly [kContext] = true;

        isA(obj: unknown): obj is Context {
            return typeof obj === "object" && obj !== null && kContext in obj;
        }

        constructor(data: Partial<DefendResult.Context.Data> = {}) {
            super(data);
        }
    }

    export namespace Context {
        export interface Data extends ImpactResult.Context.Data {}
    }
}
