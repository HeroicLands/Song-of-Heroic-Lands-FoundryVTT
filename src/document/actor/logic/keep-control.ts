/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Keep-control tests (#851 Stumble / #852 Fumble) — the two "did you keep
 * control of your body?" checks a combat mishap can flag. A **Stumble** test
 * (better of Agility / Acrobatics) decides whether a lurching being keeps its
 * footing; a **Fumble** test (better of Dexterity / Legerdemain) whether it
 * keeps its grip. Both are ordinary success tests whose only bespoke part is how
 * the roll maps to a result — so, per the {@link sohl.entity.modifier.MasteryLevelModifier.successTest}
 * design, that mapping travels as **data** (a `successStarTable` passed in the
 * action scope), not as new bespoke test code. This module is the Foundry-free
 * builder of that table; the two executors live on {@link BeingLogic}.
 */

import { SafeExpression } from "@src/entity/expr/SafeExpression";
import { expressionScopes } from "@src/entity/expr/ExpressionScopeRegistry";
import type { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import type { SohlLogic } from "@src/core/logic/SohlLogic";

/**
 * Build the result-description table for a keep-control test — the four
 * success-level rows a Stumble / Fumble card shows as its **Result** line. Rows
 * are keyed off the localization `prefix` (`SOHL.Being.StumbleTest` /
 * `SOHL.Being.FumbleTest`), each carrying a `label` and `description` under a
 * `CritFail` / `MargFail` / `MargSuccess` / `CritSuccess` suffix. The star count
 * mirrors the standard success-level table (a critical result shows the extra
 * levels beyond the threshold), so the card renders identically to every other
 * test bar the bespoke keep-control text.
 *
 * @param parent - The logic owning the table's `SafeExpression` star formulas
 *   (the winning attribute / skill logic).
 * @param prefix - The localization key prefix identifying the test's row text.
 * @returns The keep-control result-description table.
 */
export function keepControlTable(
    parent: SohlLogic<any>,
    prefix: string,
): SuccessTestResult.LimitedDescription[] {
    const loc = (suffix: string) => sohl.i18n.localize(`${prefix}.${suffix}`);
    return [
        {
            // Critical failure — the worst keep-control outcome.
            maxValue: -1,
            lastDigits: [],
            success: false,
            label: loc("CritFail.label"),
            description: loc("CritFail.description"),
            result: new SafeExpression(
                { source: "successLevel + 1" },
                { parent, scope: expressionScopes.require("test.resultRow") },
            ),
        },
        {
            // Marginal failure — lost control, but not catastrophically.
            maxValue: 0,
            lastDigits: [],
            success: false,
            label: loc("MargFail.label"),
            description: loc("MargFail.description"),
            result: 0,
        },
        {
            // Marginal success — kept control.
            maxValue: 1,
            lastDigits: [],
            success: true,
            label: loc("MargSuccess.label"),
            description: loc("MargSuccess.description"),
            result: 0,
        },
        {
            // Critical success — kept control with room to spare.
            maxValue: Number.MAX_SAFE_INTEGER,
            lastDigits: [],
            success: true,
            label: loc("CritSuccess.label"),
            description: loc("CritSuccess.description"),
            result: new SafeExpression(
                { source: "successLevel - 1" },
                { parent, scope: expressionScopes.require("test.resultRow") },
            ),
        },
    ];
}
