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

import { SuccessTestResult, TestResult } from "@logic/common/core/result";
import { DataField, RegisterClass } from "@utils";
import { ImpactModifier } from "@logic/common/core/modifier";
import { SimpleRoll } from "@utils";

@RegisterClass("ImpactResult", "0.6.0")
export class ImpactResult extends SuccessTestResult {
    @DataField("impactModifier", { type: ImpactModifier, required: true })
    impactModifier!: ImpactModifier;

    @DataField("deliversImpact", { type: Boolean, initial: false })
    deliversImpact!: boolean;

    @DataField("roll", { type: SimpleRoll, required: true })
    roll!: SimpleRoll;
}
