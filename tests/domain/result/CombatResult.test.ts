/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import { CombatResult } from "@src/entity/result/CombatResult";
import { OpposedTestResult } from "@src/entity/result/OpposedTestResult";
import { AttackResult } from "@src/entity/result/AttackResult";
import { ImpactResult } from "@src/entity/result/ImpactResult";
import { IMPACT_ASPECT, TEST_TYPE } from "@src/utils/constants";

// Success-level scale: critical failure -1, marginal failure 0,
// marginal success 1, critical success 2.

/**
 * Build a minimal stand-in for an Attack/Defend result. Carries the fields the
 * CombatResult resolution reads: normSuccessLevel, isSuccess, testType, roll.
 * (Who lands a blow is derived by CombatResult getters, not written onto the
 * side.)
 *
 * - `asAttack` sets the prototype to `AttackResult` so `instanceof AttackResult`
 *   holds — how CombatResult recognises a Counterstrike (and the attacker side).
 * - `withImpact` attaches a rollable impact + parent/speaker so CombatResult can
 *   produce an `ImpactResult` for a landing side.
 */
function makeSide(opts: {
    level: number; // normSuccessLevel
    testType?: string;
    rollTotal?: number;
    asAttack?: boolean;
    withImpact?: boolean;
}): any {
    const side: any = {
        normSuccessLevel: opts.level,
        isSuccess: opts.level >= 1,
        isCritical: opts.level === 2 || opts.level === -1,
        testType: opts.testType,
        roll: { total: opts.rollTotal ?? 50 },
        mishaps: new Set<string>(),
        toJSON: () => ({}),
    };
    if (opts.withImpact) {
        // Duck-typed ImpactModifier (CombatResult only reads diceFormula +
        // aspectType) plus the fields ImpactResult's constructor needs.
        side.impact = { diceFormula: "1d6+2", aspectType: IMPACT_ASPECT.EDGED };
        side.aimBodyPartCode = "head";
        side.title = "Broadsword";
        side.parent = { item: {} };
        side.speaker = {};
    }
    // Own data props above shadow the prototype's getters on read.
    if (opts.asAttack) Object.setPrototypeOf(side, AttackResult.prototype);
    return side;
}

function makeCombat(attacker: any, defender: any): CombatResult {
    return new CombatResult(
        {
            attackResult: attacker,
            defendResult: defender,
            speaker: { toJSON: () => ({}) } as any,
        } as any,
        { parent: {} as any },
    );
}

describe("CombatResult constructor", () => {
    it("creates an instance extending OpposedTestResult", () => {
        const cr = makeCombat(makeSide({ level: 1 }), makeSide({ level: 0 }));
        expect(cr).toBeInstanceOf(CombatResult);
        expect(cr).toBeInstanceOf(OpposedTestResult);
    });

    it("throws when attackResult is missing", () => {
        expect(
            () =>
                new CombatResult(
                    { defendResult: makeSide({ level: 0 }) } as any,
                    { parent: {} as any },
                ),
        ).toThrow(/attackResult/);
    });

    it("throws when defendResult is missing", () => {
        expect(
            () =>
                new CombatResult(
                    { attackResult: makeSide({ level: 1 }) } as any,
                    { parent: {} as any },
                ),
        ).toThrow(/defendResult/);
    });

    it("stores attackResult and defendResult and seeds resolution fields", () => {
        const atk = makeSide({ level: 1 });
        const def = makeSide({ level: 0 });
        const cr = makeCombat(atk, def);
        expect(cr.attackResult).toBe(atk);
        expect(cr.defendResult).toBe(def);
        expect(cr.margin).toBe(0);
        expect(cr.tacticalAdvantages).toEqual({ side: "none", count: 0 });
        expect(cr.weaponBreakCheck).toBe("none");
    });
});

describe("tacticalAdvantagesFor", () => {
    it.each([
        [3, { side: "attacker", count: 2 }],
        [2, { side: "attacker", count: 1 }],
        [1, { side: "none", count: 0 }],
        [0, { side: "none", count: 0 }],
        [-1, { side: "none", count: 0 }],
        [-2, { side: "defender", count: 1 }],
        [-3, { side: "defender", count: 2 }],
    ])("VS %i -> %o", (vs, expected) => {
        expect(CombatResult.tacticalAdvantagesFor(vs)).toEqual(expected);
    });
});

describe("calcMeleeCombatResult — Block", () => {
    const block = (atk: number, def: number) => {
        const cr = makeCombat(
            makeSide({ level: atk }),
            makeSide({ level: def, testType: TEST_TYPE.BLOCK.id }),
        );
        cr.opposedTestEvaluate();
        return cr;
    };

    it("lands the attack when the attacker out-margins the block", () => {
        const cr = block(2, 0); // VS 2
        expect(cr.attackerLandsBlow).toBe(true);
        expect(cr.defenderLandsBlow).toBe(false);
        expect(cr.weaponBreakCheck).toBe("none");
        expect(cr.tacticalAdvantages).toEqual({ side: "attacker", count: 1 });
    });

    it("lands the attack on a tie and forces a defender weapon-break roll", () => {
        const cr = block(1, 1); // VS 0
        expect(cr.attackerLandsBlow).toBe(true);
        expect(cr.weaponBreakCheck).toBe("defender");
    });

    it("stops the attack when the block wins", () => {
        const cr = block(0, 1); // VS -1
        expect(cr.attackerLandsBlow).toBe(false);
        expect(cr.weaponBreakCheck).toBe("none");
    });

    it("awards the defender Tactical Advantages on a decisive block", () => {
        const cr = block(-1, 1); // VS -2
        expect(cr.attackerLandsBlow).toBe(false);
        expect(cr.tacticalAdvantages).toEqual({ side: "defender", count: 1 });
    });
});

describe("calcMeleeCombatResult — Counterstrike", () => {
    const cx = (atk: number, def: number) => {
        const cr = makeCombat(
            makeSide({ level: atk }),
            // A counterstrike's response is itself an AttackResult, which
            // always carries an impact formula; CombatResult rolls it whenever
            // the counterstrike lands, so the side must supply one (+ parent).
            makeSide({
                level: def,
                testType: TEST_TYPE.COUNTERSTRIKE.id,
                asAttack: true,
                withImpact: true,
            }),
        );
        cr.opposedTestEvaluate();
        return cr;
    };

    it("lands the attacker on a tie or better", () => {
        const cr = cx(1, 1); // VS 0
        expect(cr.attackerLandsBlow).toBe(true);
    });

    it("lands the defender whenever its own roll succeeds (both can hit)", () => {
        const cr = cx(2, 1); // attacker CS, defender MS
        expect(cr.attackerLandsBlow).toBe(true);
        expect(cr.defenderLandsBlow).toBe(true);
    });

    it("lands only the defender when the attack fails", () => {
        const cr = cx(-1, 1); // VS -2, defender succeeds
        expect(cr.attackerLandsBlow).toBe(false);
        expect(cr.defenderLandsBlow).toBe(true);
        expect(cr.tacticalAdvantages).toEqual({ side: "defender", count: 1 });
    });

    it("lands neither when the attack fails and the defender also fails", () => {
        const cr = cx(-1, 0); // VS -1, defender marginal failure
        expect(cr.attackerLandsBlow).toBe(false);
        expect(cr.defenderLandsBlow).toBe(false);
    });
});

describe("calcMeleeCombatResult — Ignore", () => {
    const ignore = (atk: number) => {
        const cr = makeCombat(
            makeSide({ level: atk }),
            makeSide({ level: 0, testType: TEST_TYPE.IGNORE.id }),
        );
        cr.opposedTestEvaluate();
        return cr;
    };

    it("lands the attack when it succeeds (no defense contest)", () => {
        const cr = ignore(1);
        expect(cr.attackerLandsBlow).toBe(true);
    });

    it("does not land when the unopposed attack itself fails", () => {
        const cr = ignore(0); // marginal failure
        expect(cr.attackerLandsBlow).toBe(false);
    });

    it("awards the attacker a Tactical Advantage on a critical hit", () => {
        const cr = ignore(2);
        expect(cr.attackerLandsBlow).toBe(true);
        expect(cr.tacticalAdvantages).toEqual({ side: "attacker", count: 1 });
    });
});

describe("calcDodgeCombatResult — Dodge", () => {
    const dodge = (atk: number, def: number, atkRoll = 50, defRoll = 50) => {
        const cr = makeCombat(
            makeSide({ level: atk, rollTotal: atkRoll }),
            makeSide({
                level: def,
                testType: TEST_TYPE.DODGE.id,
                rollTotal: defRoll,
            }),
        );
        cr.opposedTestEvaluate();
        return cr;
    };

    it("lands the attack when it out-margins the dodge", () => {
        const cr = dodge(2, 0); // VS 2
        expect(cr.attackerLandsBlow).toBe(true);
    });

    it("on a tie, lands the attack when the dodge roll is lower than the attack roll", () => {
        const cr = dodge(1, 1, 70, 40); // tie; dodge 40 < attack 70 -> lands
        expect(cr.attackerLandsBlow).toBe(true);
    });

    it("on a tie, misses when the dodge roll is not lower than the attack roll", () => {
        const cr = dodge(1, 1, 40, 70); // tie; dodge 70 not < attack 40 -> miss
        expect(cr.attackerLandsBlow).toBe(false);
    });

    it("never deals defender damage and misses when the dodge wins", () => {
        const cr = dodge(0, 1); // VS -1
        expect(cr.attackerLandsBlow).toBe(false);
        expect(cr.defenderLandsBlow).toBe(false);
    });
});

describe("opposedTestEvaluate dispatch", () => {
    it("routes a dodge defense through the dodge calculator (tie uses rolls)", () => {
        const cr = makeCombat(
            makeSide({ level: 1, rollTotal: 80 }),
            makeSide({ level: 1, testType: TEST_TYPE.DODGE.id, rollTotal: 30 }),
        );
        cr.opposedTestEvaluate();
        // Dodge-specific tie rule applied (roll comparison), not the melee rule.
        expect(cr.attackerLandsBlow).toBe(true);
        expect(cr.margin).toBe(0);
    });

    it("routes block/counterstrike/ignore through the melee calculator", () => {
        const cr = makeCombat(
            makeSide({ level: 1 }),
            makeSide({ level: 1, testType: TEST_TYPE.BLOCK.id }),
        );
        cr.opposedTestEvaluate();
        expect(cr.weaponBreakCheck).toBe("defender"); // melee/block tie behavior
    });
});

describe("impact rolled on the blow landing", () => {
    it("produces an attacker ImpactResult when the attack lands", () => {
        const cr = makeCombat(
            makeSide({ level: 1, withImpact: true }),
            makeSide({ level: 0, testType: TEST_TYPE.BLOCK.id }),
        );
        cr.opposedTestEvaluate();
        expect(cr.attackerLandsBlow).toBe(true);
        expect(cr.attackerImpact).toBeInstanceOf(ImpactResult);
        expect(cr.attackerImpact!.aspect).toBe(IMPACT_ASPECT.EDGED);
        expect(cr.cxImpact).toBeUndefined();
    });

    it("produces no ImpactResult when the attack does not land", () => {
        const cr = makeCombat(
            makeSide({ level: 0, withImpact: true }),
            makeSide({ level: 1, testType: TEST_TYPE.BLOCK.id }),
        );
        cr.opposedTestEvaluate();
        expect(cr.attackerLandsBlow).toBe(false);
        expect(cr.attackerImpact).toBeUndefined();
    });

    it("produces a defender ImpactResult on a landing counterstrike", () => {
        const cr = makeCombat(
            makeSide({ level: 0 }),
            makeSide({
                level: 1,
                testType: TEST_TYPE.COUNTERSTRIKE.id,
                asAttack: true,
                withImpact: true,
            }),
        );
        cr.opposedTestEvaluate();
        expect(cr.defenderLandsBlow).toBe(true);
        expect(cr.cxImpact).toBeInstanceOf(ImpactResult);
    });
});

describe("evaluate — snapshot attacker, evaluate only the defender", () => {
    function evaluatable(opts: {
        level: number;
        testType?: string;
        evalReturn?: boolean;
    }): any {
        const side = makeSide(opts);
        side.evaluated = false;
        side.evaluate = async () => {
            side.evaluated = true;
            return opts.evalReturn ?? true;
        };
        return side;
    }

    it("evaluates the defender locally and reads the attacker as a snapshot", async () => {
        const atk = evaluatable({ level: 1 });
        const def = evaluatable({ level: 0, testType: TEST_TYPE.BLOCK.id });
        const cr = makeCombat(atk, def);

        const ok = await cr.evaluate();

        // The attacker's AttackResult is a pre-evaluated snapshot from the
        // attacker's client; re-evaluating it would hit the attacker's
        // ownership gate on the defender's machine.
        expect(atk.evaluated).toBe(false);
        expect(def.evaluated).toBe(true);
        expect(ok).toBe(true);
        // Resolution ran, using the attacker's snapshot success level.
        expect(cr.margin).toBe(atk.normSuccessLevel - def.normSuccessLevel);
    });

    it("returns false and skips resolution when the defense evaluation fails", async () => {
        const atk = evaluatable({ level: 1 });
        const def = evaluatable({
            level: 0,
            testType: TEST_TYPE.BLOCK.id,
            evalReturn: false,
        });
        const cr = makeCombat(atk, def);

        const ok = await cr.evaluate();

        expect(ok).toBe(false);
        expect(atk.evaluated).toBe(false);
        expect(cr.margin).toBe(0); // opposedTestEvaluate never ran
    });
});

describe("CombatResult deduplication (#203)", () => {
    it("attackResult getter aliases sourceTestResult", () => {
        const atk = makeSide({ level: 1 });
        const def = makeSide({ level: 0 });
        const cr = makeCombat(atk, def);
        expect(cr.attackResult).toBe(cr.sourceTestResult);
    });

    it("defendResult getter aliases targetTestResult", () => {
        const atk = makeSide({ level: 1 });
        const def = makeSide({ level: 0 });
        const cr = makeCombat(atk, def);
        expect(cr.defendResult).toBe(cr.targetTestResult);
    });

    it("toJSON() does not emit redundant attackResult or defendResult keys", () => {
        const atk = makeSide({ level: 1 });
        const def = makeSide({ level: 0 });
        const cr = makeCombat(atk, def);
        const json = JSON.parse(JSON.stringify(cr.toJSON()));
        expect(json).not.toHaveProperty("attackResult");
        expect(json).not.toHaveProperty("defendResult");
        expect(json).toHaveProperty("sourceTestResult");
        expect(json).toHaveProperty("targetTestResult");
    });

    it("construction with only attackResult/defendResult — no sourceTestResult needed", () => {
        const atk = makeSide({ level: 1 });
        const def = makeSide({ level: 0 });
        const cr = new CombatResult(
            { attackResult: atk, defendResult: def } as any,
            { parent: {} as any },
        );
        expect(cr.attackResult).toBe(atk);
        expect(cr.defendResult).toBe(def);
    });
});
