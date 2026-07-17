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

import { describe, it, expect, vi } from "vitest";
import {
    instanceFromJSON,
    defaultToJSON,
    defaultFromJSON,
} from "@src/utils/helpers";

// The FoundryHelpers test mock predates the combatant-UUID lookup that
// AttackResult now performs in its constructor, so it does not export
// `fvttLogicFromUuidSync`. Supply it here (extending the mock) so building an
// AttackResult resolves its combatant to a minimal stand-in logic.
vi.mock("@src/core/FoundryHelpers", async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    return {
        ...actual,
        fvttLogicFromUuidSync: (uuid: string) => ({ uuid, name: "Combatant" }),
    };
});
import { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import { ImpactModifier } from "@src/entity/modifier/ImpactModifier";
import { ValueDelta } from "@src/entity/modifier/ValueDelta";
import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import { SuccessTestResult } from "@src/entity/result/SuccessTestResult";
import { AttackResult } from "@src/entity/result/AttackResult";
import { DefendResult } from "@src/entity/result/DefendResult";
import { OpposedTestResult } from "@src/entity/result/OpposedTestResult";
import { CombatResult } from "@src/entity/result/CombatResult";
import {
    VALUE_DELTA_OPERATOR,
    MARGINAL_SUCCESS,
    CRITICAL_SUCCESS,
} from "@src/utils/constants";

/** Full serialize→string→revive cycle via the defaultToJSON/defaultFromJSON pair. */
function cycle<T>(obj: object): T {
    return defaultFromJSON(JSON.parse(JSON.stringify(defaultToJSON(obj))), {
        parent,
    }) as T;
}

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
    return JSON.stringify(defaultToJSON(obj));
}

function addDelta(m: { deltas: ValueDelta[] }, value: number): void {
    m.deltas.push(
        new ValueDelta(
            {
                name: "SOHL.INFO.test",
                shortcode: "TST",
                op: VALUE_DELTA_OPERATOR.ADD,
                value: String(value),
            },
            { parent },
        ),
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
            const roll = new SimpleRoll(
                {
                    numDice: 1,
                    dieFaces: 100,
                    modifier: 0,
                    rolls: [55],
                },
                { parent },
            );
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
                    roll: new SimpleRoll(
                        {
                            numDice: 1,
                            dieFaces: 100,
                            rolls: [5],
                        },
                        { parent },
                    ),
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
                    roll: new SimpleRoll(
                        {
                            numDice: 1,
                            dieFaces: 100,
                            rolls: [30],
                        },
                        { parent },
                    ),
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
                    mode: { itemUuid: "Item.mode", smId: "sm1" },
                    combatantUuid: "Combatant.c1",
                } as any,
                { parent },
            );
            (a as any)._successLevel = MARGINAL_SUCCESS;

            // `combatantUuid` is a transient the constructor resolves to a live
            // combatant (never stored on the instance, so never serialized) —
            // re-supply it on rehydrate the same way `parent` is re-supplied.
            const revived = instanceFromJSON<AttackResult>(
                { ...JSON.parse(toAttr(a)), combatantUuid: "Combatant.c1" },
                parent,
            );

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
                    aimBodyPartCode: "head",
                } as any,
                { parent },
            );
            const a = new AttackResult(
                {
                    roll: new SimpleRoll(
                        {
                            numDice: 1,
                            dieFaces: 100,
                            rolls: [30],
                        },
                        { parent },
                    ),
                    masteryLevelModifier: new MasteryLevelModifier(
                        { baseValue: 50 } as any,
                        { parent },
                    ),
                    impact,
                    mode: { itemUuid: "Item.mode", smId: "sm1" },
                    combatantUuid: "Combatant.c1",
                } as any,
                { parent },
            );

            // `combatantUuid` is a transient (see the snapshot test above);
            // re-supply it on rehydrate alongside `parent`.
            const revived = instanceFromJSON<AttackResult>(
                { ...JSON.parse(toAttr(a)), combatantUuid: "Combatant.c1" },
                parent,
            );

            expect(revived).toBeInstanceOf(AttackResult);
            expect(revived.impact).toBeInstanceOf(ImpactModifier);
            expect(revived.impact.numDice).toBe(2);
            expect(revived.impact.die).toBe(6);
            expect(revived.aimBodyPartCode).toBe("head");
            expect(revived.roll.total).toBe(30);
        });
    });

    describe("OpposedTestResult", () => {
        it("rehydrates both contestants' success tests via toJSON", () => {
            const source = new SuccessTestResult(
                {
                    roll: new SimpleRoll(
                        { numDice: 1, dieFaces: 100, rolls: [15] },
                        { parent },
                    ),
                    masteryLevelModifier: new MasteryLevelModifier(
                        { baseValue: 60 } as any,
                        { parent },
                    ),
                } as any,
                { parent },
            );
            const target = new SuccessTestResult(
                {
                    roll: new SimpleRoll(
                        { numDice: 1, dieFaces: 100, rolls: [95] },
                        { parent },
                    ),
                    masteryLevelModifier: new MasteryLevelModifier(
                        { baseValue: 40 } as any,
                        { parent },
                    ),
                } as any,
                { parent },
            );
            const o = new OpposedTestResult(
                {
                    sourceTestResult: source,
                    targetTestResult: target,
                    tieBreak: 1,
                    breakTies: true,
                } as any,
                { parent },
            );

            const revived = cycle<OpposedTestResult>(o);
            expect(revived).toBeInstanceOf(OpposedTestResult);
            expect(revived.sourceTestResult).toBeInstanceOf(SuccessTestResult);
            expect(revived.targetTestResult).toBeInstanceOf(SuccessTestResult);
            expect(revived.sourceTestResult.roll.total).toBe(15);
            expect(revived.targetTestResult.roll.total).toBe(95);
            expect(revived.tieBreak).toBe(1);
            expect(revived.breakTies).toBe(true);
        });
    });

    describe("CombatResult", () => {
        it("rehydrates its nested attack and defend results self-contained", () => {
            const attack = new AttackResult(
                {
                    roll: new SimpleRoll(
                        { numDice: 1, dieFaces: 100, rolls: [22] },
                        { parent },
                    ),
                    masteryLevelModifier: new MasteryLevelModifier(
                        { baseValue: 70 } as any,
                        { parent },
                    ),
                    impact: new ImpactModifier(
                        {
                            roll: { numDice: 2, dieFaces: 6 },
                            aspect: "edged",
                            aimBodyPartCode: "head",
                        } as any,
                        { parent },
                    ),
                    mode: { itemUuid: "Item.mode", smId: "sm1" },
                    combatantUuid: "Combatant.atk",
                } as any,
                { parent },
            );
            const defend = new DefendResult(
                {
                    roll: new SimpleRoll(
                        { numDice: 1, dieFaces: 100, rolls: [80] },
                        { parent },
                    ),
                    masteryLevelModifier: new MasteryLevelModifier(
                        { baseValue: 45 } as any,
                        { parent },
                    ),
                    label: "Dodge",
                    combatantUuid: "Combatant.def",
                } as any,
                { parent },
            );
            const c = new CombatResult(
                {
                    attackResult: attack,
                    defendResult: defend,
                } as any,
                { parent },
            );

            // No manual re-supply of combatantUuid: toJSON persists it.
            const revived = cycle<CombatResult>(c);
            expect(revived).toBeInstanceOf(CombatResult);
            expect(revived.attackResult).toBeInstanceOf(AttackResult);
            expect(revived.defendResult).toBeInstanceOf(DefendResult);
            expect(revived.attackResult.roll.total).toBe(22);
            expect(revived.attackResult.impact.numDice).toBe(2);
            expect(revived.defendResult.roll.total).toBe(80);
            expect(revived.defendResult.label).toBe("Dodge");
        });
    });

    describe("construct-from-toJSON (defaultFromJSON is the constructor)", () => {
        it("defaultFromJSON(x.toJSON(), { parent }) returns a live leaf instance, no stringify or `new X` needed", () => {
            const v = new ValueDelta(
                {
                    name: "SOHL.INFO.test",
                    shortcode: "TST",
                    op: VALUE_DELTA_OPERATOR.ADD,
                    value: "7",
                },
                { parent },
            );

            // `toJSON()` is a serialized PlainObject, never handed to a
            // constructor directly. `defaultFromJSON` is the supported bridge:
            // it revives (here, a leaf) and calls `new ValueDelta(...)` itself,
            // returning the live instance — so no `new X(defaultFromJSON(...))`.
            const revived = defaultFromJSON(v.toJSON(), {
                parent,
            }) as ValueDelta;

            expect(revived).toBeInstanceOf(ValueDelta);
            expect(revived.shortcode).toBe("TST");
            expect(revived.op).toBe(VALUE_DELTA_OPERATOR.ADD);
            expect(revived.numValue).toBe(7);
        });
    });
});
