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
import { instanceToJSON, instanceFromJSON } from "@src/utils/helpers";
import { MasteryLevelModifier } from "@src/domain/modifier/MasteryLevelModifier";
import { ImpactModifier } from "@src/domain/modifier/ImpactModifier";
import { ValueDelta } from "@src/domain/modifier/ValueDelta";
import { SimpleRoll } from "@src/utils/SimpleRoll";
import { SuccessTestResult } from "@src/domain/result/SuccessTestResult";
import { AttackResult } from "@src/domain/result/AttackResult";
import {
    VALUE_DELTA_OPERATOR,
    MARGINAL_SUCCESS,
    CRITICAL_SUCCESS,
} from "@src/utils/constants";

/** A parent logic stub sufficient for result/modifier construction. */
const parent = {
    id: "p",
    name: "P",
    label: "P",
    data: { kind: "skill" },
    item: { logic: { availableFate: [] } },
} as any;

/** Serialize exactly as a chat-card data attribute would: toJSON -> string. */
function toAttr(obj: object): string {
    return JSON.stringify(instanceToJSON(obj));
}

function addDelta(m: { deltas: ValueDelta[] }, value: number): void {
    m.deltas.push(
        new ValueDelta({
            name: "SOHL.INFO.test",
            shortcode: "TST",
            op: VALUE_DELTA_OPERATOR.ADD,
            value: String(value),
        }),
    );
    (m as any).dirty = true;
}

describe("result round-trip (serialize -> string -> rehydrate)", () => {
    describe("MasteryLevelModifier", () => {
        it("rehydrates as a live instance with identical computed value", () => {
            const m = new MasteryLevelModifier({ baseValue: 45 } as any, {
                parent,
            });
            addDelta(m, 20);
            m.successLevelMod = 1;
            m.critSuccessDigits = [0, 5];
            const effective = m.constrainedEffective; // 45 + 20

            const revived = instanceFromJSON<MasteryLevelModifier>(
                toAttr(m),
                parent,
            );

            expect(revived).toBeInstanceOf(MasteryLevelModifier);
            expect(revived.constrainedEffective).toBe(effective);
            expect(revived.successLevelMod).toBe(1);
            expect(revived.critSuccessDigits).toEqual([0, 5]);
            expect(revived.deltas[0]).toBeInstanceOf(ValueDelta);
            expect(revived.deltas[0].numValue).toBe(20);
        });

        it("supports re-test: the rehydrated modifier recomputes when changed", () => {
            const m = new MasteryLevelModifier({ baseValue: 45 } as any, {
                parent,
            });
            addDelta(m, 20);
            const revived = instanceFromJSON<MasteryLevelModifier>(
                toAttr(m),
                parent,
            );
            const before = revived.constrainedEffective; // 65
            addDelta(revived, 10);
            expect(revived.constrainedEffective).toBe(before + 10);
        });
    });

    describe("SuccessTestResult", () => {
        it("rehydrates with a live SimpleRoll and MasteryLevelModifier", () => {
            const roll = new SimpleRoll({
                numDice: 1,
                dieFaces: 100,
                modifier: 0,
                rolls: [55],
            });
            const mlMod = new MasteryLevelModifier({ baseValue: 45 } as any, {
                parent,
            });
            const r = new SuccessTestResult(
                { roll, masteryLevelModifier: mlMod } as any,
                { parent },
            );

            const revived = instanceFromJSON<SuccessTestResult>(
                toAttr(r),
                parent,
            );

            expect(revived).toBeInstanceOf(SuccessTestResult);
            expect(revived.roll).toBeInstanceOf(SimpleRoll);
            expect(revived.roll.total).toBe(55);
            expect(revived.masteryLevelModifier).toBeInstanceOf(
                MasteryLevelModifier,
            );
            expect(revived.masteryLevelModifier.constrainedEffective).toBe(45);
            expect(revived.mishaps).toBeInstanceOf(Set);
        });
    });

    describe("snapshot (evaluated outcome survives the trip)", () => {
        it("restores successLevel on rehydrate without re-evaluating", () => {
            // Simulate a result the attacker has already evaluated.
            const r = new SuccessTestResult(
                {
                    roll: new SimpleRoll({
                        numDice: 1,
                        dieFaces: 100,
                        rolls: [5],
                    }),
                    masteryLevelModifier: new MasteryLevelModifier(
                        { baseValue: 50 } as any,
                        { parent },
                    ),
                } as any,
                { parent },
            );
            (r as any)._successLevel = CRITICAL_SUCCESS;
            expect(r.successLevel).toBe(CRITICAL_SUCCESS);

            const revived = instanceFromJSON<SuccessTestResult>(
                toAttr(r),
                parent,
            );

            // The defender reads the attacker's outcome as-is; it must NOT
            // reset to MARGINAL_FAILURE the way a fresh test would.
            expect(revived.successLevel).toBe(CRITICAL_SUCCESS);
        });

        it("a snapshot AttackResult keeps its evaluated success level", () => {
            const a = new AttackResult(
                {
                    roll: new SimpleRoll({
                        numDice: 1,
                        dieFaces: 100,
                        rolls: [30],
                    }),
                    masteryLevelModifier: new MasteryLevelModifier(
                        { baseValue: 50 } as any,
                        { parent },
                    ),
                    impact: new ImpactModifier(
                        {
                            roll: { numDice: 2, dieFaces: 6 },
                            aspect: "edged",
                        } as any,
                        { parent },
                    ),
                } as any,
                { parent },
            );
            (a as any)._successLevel = MARGINAL_SUCCESS;

            const revived = instanceFromJSON<AttackResult>(toAttr(a), parent);

            expect(revived.successLevel).toBe(MARGINAL_SUCCESS);
        });
    });

    describe("AttackResult", () => {
        it("rehydrates with a nested ImpactModifier and aim intact", () => {
            const impact = new ImpactModifier(
                {
                    roll: {
                        numDice: 2,
                        dieFaces: 6,
                        modifier: 1,
                        rolls: [3, 4],
                    },
                    aspect: "edged",
                } as any,
                { parent },
            );
            const a = new AttackResult(
                {
                    roll: new SimpleRoll({
                        numDice: 1,
                        dieFaces: 100,
                        rolls: [30],
                    }),
                    masteryLevelModifier: new MasteryLevelModifier(
                        { baseValue: 50 } as any,
                        { parent },
                    ),
                    impact,
                    aimBodyPartCode: "head",
                } as any,
                { parent },
            );

            const revived = instanceFromJSON<AttackResult>(toAttr(a), parent);

            expect(revived).toBeInstanceOf(AttackResult);
            expect(revived.impact).toBeInstanceOf(ImpactModifier);
            expect(revived.impact.numDice).toBe(2);
            expect(revived.impact.die).toBe(6);
            expect(revived.aimBodyPartCode).toBe("head");
            expect(revived.roll.total).toBe(30);
        });
    });
});
