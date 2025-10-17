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
import { DEFEND_MISHAP, TEST_TYPE } from "@utils/constants";

export class DefendResult extends ImpactResult {
    situationalModifier: number;

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
            this.testType === TEST_TYPE.BLOCK.id ||
            this.testType === TEST_TYPE.COUNTERSTRIKE.id
        ) {
            if (this.isCritical && !this.isSuccess && this.lastDigit === 0) {
                this.mishaps.add(DEFEND_MISHAP.FUMBLE_TEST);
            }
            if (this.isCritical && !this.isSuccess && this.lastDigit === 5) {
                this.mishaps.add(DEFEND_MISHAP.STUMBLE_TEST);
            }
            this.deliversImpact = false;
        } else if (this.testType === TEST_TYPE.DODGE.id) {
            if (this.isCritical && !this.isSuccess) {
                this.mishaps.add(DEFEND_MISHAP.STUMBLE_TEST);
            }
            this.deliversImpact = false;
        }
        return true;
    }
}

export namespace DefendResult {
    export const Kind: string = "DefendResult";

    export interface Data extends ImpactResult.Data {
        situationalModifier: number;
    }

    export interface Options extends ImpactResult.Options {}

    export interface ContextScope {
        priorTestResult: DefendResult | null;
    }
}
