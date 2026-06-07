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

import { DEFEND_MISHAP, TEST_TYPE, VALUE_DELTA_ID } from "@src/utils/constants";
import { SuccessTestResult } from "./SuccessTestResult";

/**
 * The defender's side of a combat exchange — a {@link SuccessTestResult} with
 * defense-specific data.
 *
 * ## Key properties
 *
 * - {@link situationalModifier} — player-entered modifier from the
 *   defense dialog.
 *
 * ## Evaluation
 *
 * {@link evaluate} performs the defense roll (block, counterstrike, or
 * dodge), determines success/failure, and checks for defense-specific
 * mishaps (shield break, stumble, fumble). The defense success level
 * is then compared against the {@link AttackResult} in the containing
 * {@link CombatResult} to determine the final outcome.
 */
export class DefendResult extends SuccessTestResult {
    constructor(
        data: Partial<DefendResult.Data> = {},
        options: Partial<DefendResult.Options> = {},
    ) {
        super(data, options);
        this.masteryLevelModifier.add(
            VALUE_DELTA_ID.PLAYER,
            data.situationalModifier,
        );
    }

    async evaluate(): Promise<boolean> {
        const allowed = await super.evaluate();
        if (!allowed) return false;

        if (!this.isSuccess) {
            if (
                this.testType === TEST_TYPE.BLOCK.id ||
                this.testType === TEST_TYPE.COUNTERSTRIKE.id
            ) {
                if (this.isCritical && this.lastDigit === 0) {
                    this.mishaps.add(DEFEND_MISHAP.FUMBLE_TEST);
                }
                if (this.isCritical && this.lastDigit === 5) {
                    this.mishaps.add(DEFEND_MISHAP.STUMBLE_TEST);
                }
            } else if (this.testType === TEST_TYPE.DODGE.id) {
                if (this.isCritical && !this.isSuccess) {
                    this.mishaps.add(DEFEND_MISHAP.STUMBLE_TEST);
                }
            }
        }
        return true;
    }
}

export namespace DefendResult {
    export const Kind: string = "DefendResult";

    export interface Data extends SuccessTestResult.Data {
        situationalModifier: number;
    }

    export interface Options extends SuccessTestResult.Options {}

    export interface ContextScope {
        priorTestResult: DefendResult | null;
    }
}
