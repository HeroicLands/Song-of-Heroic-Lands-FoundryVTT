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

import { describe, it, expect } from "vitest";
import { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import { SafeExpression } from "@src/entity/expr/SafeExpression";
import { BRAND } from "@src/utils/constants";

const parent = {
    id: "actor0000000001",
    name: "Hero",
    label: "Hero",
    data: { kind: "skill" },
    item: { logic: { availableFate: [] } },
    [BRAND.SohlLogic]: true,
} as any;

/** A one-row table whose star count is computed by a SafeExpression. */
function exprTable() {
    return [
        {
            maxValue: 999,
            lastDigits: [],
            label: "You go screaming down the halls in terror",
            description: "",
            success: false,
            result: new SafeExpression(
                { source: "successLevel + 1" },
                { parent },
            ),
        },
    ];
}

describe("success-star table serialization (#206)", () => {
    it("carries a SafeExpression result as data on the wire (not a dropped function)", () => {
        const result = new SuccessTestResult(
            { successStarTable: exprTable() } as any,
            { parent },
        );
        // JSON.stringify runs each SafeExpression's toJSON — the row's computed
        // result survives as a __kind-tagged source string, where a raw function
        // would have been silently dropped.
        const wire = JSON.parse(JSON.stringify(result.toJSON()));
        expect(wire.successStarTable[0].result.source).toBe("successLevel + 1");
        expect(wire.successStarTable[0].result.__kind).toBeTruthy();
        expect(wire.successStarTable[0].label).toBe(
            "You go screaming down the halls in terror",
        );
    });

    it("revives the wire table's SafeExpression into a live, evaluable instance", () => {
        const source = new SuccessTestResult(
            { successStarTable: exprTable() } as any,
            { parent },
        );
        const wire = JSON.parse(JSON.stringify(source.toJSON()));

        const revived = new SuccessTestResult(wire, { parent });
        const row = (revived as any)._successStarTable[0];
        expect(row.result).toBeInstanceOf(SafeExpression);
        expect(row.result.evaluate({ successLevel: 2 })).toBe(3);
        expect(row.label).toBe("You go screaming down the halls in terror");
    });

    it("passes literal (non-expression) rows through unchanged on revival", () => {
        const table = [
            {
                maxValue: 0,
                lastDigits: [],
                label: "Critical Failure",
                description: "",
                success: false,
                result: 2,
            },
        ];
        const source = new SuccessTestResult(
            { successStarTable: table } as any,
            { parent },
        );
        const wire = JSON.parse(JSON.stringify(source.toJSON()));
        const revived = new SuccessTestResult(wire, { parent });
        const row = (revived as any)._successStarTable[0];
        expect(row.result).toBe(2);
        expect(row.label).toBe("Critical Failure");
    });

    it("round-trips the built-in standard table (MasteryLevelModifier default)", () => {
        const mlMod = new MasteryLevelModifier({ baseValue: 50 } as any, {
            parent,
        });
        // Its default testDescTable carries `successLevel ± 1` SafeExpressions.
        const wire = JSON.parse(JSON.stringify(mlMod.toJSON()));
        const exprRow = wire.testDescTable.find(
            (r: any) => r.result && typeof r.result === "object",
        );
        expect(exprRow.result.source).toBe("successLevel + 1");

        const revived = new MasteryLevelModifier(wire, { parent });
        const liveRow = (revived as any).testDescTable.find(
            (r: any) => r.result instanceof SafeExpression,
        );
        expect(liveRow.result.evaluate({ successLevel: 3 })).toBe(4);
    });
});
