import { SimpleRoll } from "@src/entity/roll/SimpleRoll";
import { createRng } from "@src/entity/random/createRng";

// SimpleRoll is a SohlEntity and requires an owning parent Logic. These are
// pure dice-primitive unit tests, so a minimal stand-in parent suffices.
const parent = { kind: "test-parent" } as any;
const sr = (data?: Partial<SimpleRoll.Data>) =>
    new SimpleRoll(data ?? {}, { parent });
const srf = (formula: string) => SimpleRoll.fromFormula(formula, parent);

describe("SimpleRoll", () => {
    describe("constructor", () => {
        it("creates a roll with default values", () => {
            const roll = sr();
            expect(roll.numDice).toBe(0);
            expect(roll.dieFaces).toBe(0);
            expect(roll.modifier).toBe(0);
            expect(roll.rolls).toEqual([]);
        });

        it("accepts partial data", () => {
            const roll = sr({ numDice: 2, dieFaces: 6 });
            expect(roll.numDice).toBe(2);
            expect(roll.dieFaces).toBe(6);
            expect(roll.modifier).toBe(0);
        });

        it("accepts full data", () => {
            const roll = sr({
                numDice: 3,
                dieFaces: 8,
                modifier: 5,
                rolls: [3, 5, 7],
            });
            expect(roll.numDice).toBe(3);
            expect(roll.dieFaces).toBe(8);
            expect(roll.modifier).toBe(5);
            expect(roll.rolls).toEqual([3, 5, 7]);
        });
    });

    describe("fromFormula", () => {
        it("parses '2d6+3'", () => {
            const roll = srf("2d6+3");
            expect(roll.numDice).toBe(2);
            expect(roll.dieFaces).toBe(6);
            expect(roll.modifier).toBe(3);
        });

        it("parses 'd20' (implicit 1 die)", () => {
            const roll = srf("d20");
            expect(roll.numDice).toBe(1);
            expect(roll.dieFaces).toBe(20);
            expect(roll.modifier).toBe(0);
        });

        it("parses '3d8-2'", () => {
            const roll = srf("3d8-2");
            expect(roll.numDice).toBe(3);
            expect(roll.dieFaces).toBe(8);
            expect(roll.modifier).toBe(-2);
        });

        it("parses '+5' (modifier only)", () => {
            const roll = srf("+5");
            expect(roll.numDice).toBe(0);
            expect(roll.dieFaces).toBe(0);
            expect(roll.modifier).toBe(5);
        });

        it("parses '4d6' (no modifier)", () => {
            const roll = srf("4d6");
            expect(roll.numDice).toBe(4);
            expect(roll.dieFaces).toBe(6);
            expect(roll.modifier).toBe(0);
        });

        it("throws on invalid formula", () => {
            expect(() => srf("invalid")).toThrow("Invalid formula");
        });

        it("throws on completely malformed formula", () => {
            expect(() => srf("abc123xyz")).toThrow("Invalid formula");
        });
    });

    describe("roll", () => {
        it("returns a number", () => {
            const roll = sr({ numDice: 2, dieFaces: 6 });
            const result = roll.roll();
            expect(typeof result).toBe("number");
        });

        it("populates rolls array", () => {
            const roll = sr({ numDice: 3, dieFaces: 6 });
            roll.roll();
            expect(roll.rolls).toHaveLength(3);
        });

        it("each die is within valid range", () => {
            const roll = sr({ numDice: 10, dieFaces: 6 });
            roll.roll();
            for (const r of roll.rolls) {
                expect(r).toBeGreaterThanOrEqual(1);
                expect(r).toBeLessThanOrEqual(6);
            }
        });

        it("does not re-roll if already rolled", () => {
            const roll = sr({ numDice: 2, dieFaces: 6 });
            roll.roll();
            const firstRolls = [...roll.rolls];
            roll.roll();
            expect(roll.rolls).toEqual(firstRolls);
        });

        it("handles 0 dice", () => {
            const roll = sr({
                numDice: 0,
                dieFaces: 6,
                modifier: 5,
            });
            expect(roll.roll()).toBe(5);
            expect(roll.rolls).toHaveLength(0);
        });

        // Issue #599 — roll() draws from an injectable, seedable Rng.
        it("is reproducible under an injected seeded Rng", () => {
            const a = sr({ numDice: 5, dieFaces: 100 });
            const b = sr({ numDice: 5, dieFaces: 100 });
            a.roll(createRng("seed-x"));
            b.roll(createRng("seed-x"));
            expect(a.rolls).toEqual(b.rolls);
            expect(a.rolls.every((r) => r >= 1 && r <= 100)).toBe(true);
        });

        it("different seeds diverge", () => {
            const a = sr({ numDice: 8, dieFaces: 100 });
            const b = sr({ numDice: 8, dieFaces: 100 });
            a.roll(createRng("seed-a"));
            b.roll(createRng("seed-b"));
            expect(a.rolls).not.toEqual(b.rolls);
        });

        it("forced values still take precedence over an injected Rng", () => {
            SimpleRoll.forceValues(4, 4, 4);
            try {
                const roll = sr({ numDice: 3, dieFaces: 6 });
                roll.roll(createRng("ignored"));
                expect(roll.rolls).toEqual([4, 4, 4]);
            } finally {
                SimpleRoll.clearForced();
            }
        });
    });

    describe("setRolls", () => {
        it("sets specific dice results", () => {
            const roll = sr({ numDice: 2, dieFaces: 6 });
            roll.setRolls([3, 5]);
            expect(roll.rolls).toEqual([3, 5]);
        });

        it("throws when values length does not match numDice", () => {
            const roll = sr({ numDice: 2, dieFaces: 6 });
            expect(() => roll.setRolls([1, 2, 3])).toThrow(
                "Expected 2 roll values, got 3",
            );
        });
    });

    describe("total", () => {
        it("sums rolls plus modifier", () => {
            const roll = sr({
                numDice: 2,
                dieFaces: 6,
                modifier: 3,
                rolls: [4, 5],
            });
            expect(roll.total).toBe(12);
        });

        it("returns just modifier when no rolls", () => {
            const roll = sr({ modifier: 7 });
            expect(roll.total).toBe(7);
        });

        it("handles negative modifier", () => {
            const roll = sr({
                numDice: 1,
                dieFaces: 6,
                modifier: -2,
                rolls: [3],
            });
            expect(roll.total).toBe(1);
        });
    });

    describe("median", () => {
        it("computes median for 2d6", () => {
            const roll = sr({ numDice: 2, dieFaces: 6 });
            // median of 1d6 = 3.5, so 2d6 median = 7
            expect(roll.median).toBe(7);
        });

        it("returns a fractional median for an odd count of even-faced dice", () => {
            // 1d6 expected value = (6 + 1) / 2 = 3.5 (not rounded).
            expect(sr({ numDice: 1, dieFaces: 6 }).median).toBe(3.5);
            // 3d6 = 3 * 3.5 = 10.5.
            expect(sr({ numDice: 3, dieFaces: 6 }).median).toBe(10.5);
        });

        it("computes median for 1d20", () => {
            const roll = sr({ numDice: 1, dieFaces: 20 });
            // 1d20 expected value = (20 + 1) / 2 = 10.5 (not rounded).
            expect(roll.median).toBe(10.5);
        });

        it("includes modifier in median", () => {
            const roll = sr({
                numDice: 2,
                dieFaces: 6,
                modifier: 3,
            });
            expect(roll.median).toBe(10);
        });

        it("returns just modifier when 0 dice", () => {
            const roll = sr({
                numDice: 0,
                dieFaces: 6,
                modifier: 5,
            });
            expect(roll.median).toBe(5);
        });

        it("handles odd number of faces", () => {
            const roll = sr({ numDice: 1, dieFaces: 5 });
            // (5+1)/2 = 3
            expect(roll.median).toBe(3);
        });
    });

    describe("reset", () => {
        it("clears the rolls array", () => {
            const roll = sr({ numDice: 2, dieFaces: 6 });
            roll.roll();
            expect(roll.rolls.length).toBeGreaterThan(0);
            roll.reset();
            expect(roll.rolls).toEqual([]);
        });

        it("allows re-rolling after reset", () => {
            const roll = sr({ numDice: 1, dieFaces: 6 });
            roll.setRolls([3]);
            expect(roll.total).toBe(3);
            roll.reset();
            const result = roll.roll();
            expect(typeof result).toBe("number");
        });
    });

    describe("toJSON", () => {
        it("serializes to JSON with __kind field", () => {
            const roll = sr({
                numDice: 2,
                dieFaces: 6,
                modifier: 3,
                rolls: [3, 5],
            });
            const json = roll.toJSON();
            expect(json).toEqual({
                __kind: "SimpleRoll",
                numDice: 2,
                dieFaces: 6,
                modifier: 3,
                rolls: [3, 5],
            });
        });

        it("round-trips: toJSON output satisfies the Data/constructor contract", () => {
            const roll = sr({
                numDice: 3,
                dieFaces: 8,
                modifier: -1,
                rolls: [2, 4, 6],
            });
            // toJSON output is valid `data` for the constructor.
            const copy = sr(roll.toJSON() as Partial<SimpleRoll.Data>);
            expect(copy.numDice).toBe(3);
            expect(copy.dieFaces).toBe(8);
            expect(copy.modifier).toBe(-1);
            expect(copy.rolls).toEqual([2, 4, 6]);
            expect(copy.total).toBe(roll.total);
        });

        it("full JSON.stringify cycle revives via defaultFromJSON", async () => {
            const { defaultToJSON, defaultFromJSON } =
                await import("@src/utils/helpers");
            const roll = sr({
                numDice: 1,
                dieFaces: 100,
                rolls: [42],
            });
            const revived = defaultFromJSON(
                JSON.parse(JSON.stringify(defaultToJSON(roll))),
                { parent },
            ) as SimpleRoll;
            expect(revived).toBeInstanceOf(SimpleRoll);
            expect(revived.total).toBe(42);
        });
    });

    describe("result", () => {
        it("returns a single die value without brackets", () => {
            const roll = sr({
                numDice: 1,
                dieFaces: 6,
                modifier: 0,
                rolls: [4],
            });
            expect(roll.result).toBe("4");
        });

        it("returns multiple die values in brackets with modifier", () => {
            const roll = sr({
                numDice: 2,
                dieFaces: 6,
                modifier: 3,
                rolls: [2, 5],
            });
            expect(roll.result).toBe("[2, 5] +3");
        });

        it("returns modifier only when no dice", () => {
            const roll = sr({
                numDice: 0,
                dieFaces: 0,
                modifier: 7,
                rolls: [],
            });
            expect(roll.result).toBe("7");
        });

        it("returns '0' for empty roll", () => {
            const roll = sr();
            expect(roll.result).toBe("0");
        });
    });

    describe("formula", () => {
        it("returns dice formula string", () => {
            const roll = sr({
                numDice: 2,
                dieFaces: 6,
                modifier: 3,
                rolls: [],
            });
            expect(roll.formula).toBe("2d6+3");
        });

        it("returns modifier only when no dice", () => {
            const roll = sr({
                numDice: 0,
                dieFaces: 0,
                modifier: 5,
                rolls: [],
            });
            expect(roll.formula).toBe("5");
        });

        it("handles negative modifier", () => {
            const roll = sr({
                numDice: 1,
                dieFaces: 100,
                modifier: -10,
                rolls: [],
            });
            expect(roll.formula).toBe("1d100-10");
        });
    });

    describe("toFoundryRoll", () => {
        it.todo(
            "converts to a Foundry VTT Roll instance (requires Foundry mocking)",
        );
    });
});

describe("SimpleRoll forced values (deterministic testing, #598)", () => {
    // Hygiene: a leftover forced value would leak into the next roll — always
    // clear between tests (mirrors the e2e afterEach discipline).
    afterEach(() => SimpleRoll.clearForced());

    it("roll() consumes a forced value instead of rolling randomly", () => {
        SimpleRoll.forceValues(5);
        const roll = sr({ numDice: 1, dieFaces: 100 });
        expect(roll.roll()).toBe(5);
        expect(roll.rolls).toEqual([5]);
    });

    it("the constituent values are correct so display derives correctly", () => {
        SimpleRoll.forceValues(3, 5);
        const roll = sr({ numDice: 2, dieFaces: 6, modifier: 2 });
        expect(roll.roll()).toBe(10); // 3 + 5 + 2
        expect(roll.result).toBe("[3, 5] +2");
        expect(roll.rolls).toEqual([3, 5]);
    });

    it("consumes numDice values per roll, FIFO across successive rolls", () => {
        SimpleRoll.forceValues(5, 100, 1); // three single-die rolls in order
        expect(sr({ numDice: 1, dieFaces: 100 }).roll()).toBe(5);
        expect(sr({ numDice: 1, dieFaces: 100 }).roll()).toBe(100);
        expect(sr({ numDice: 1, dieFaces: 100 }).roll()).toBe(1);
    });

    it("falls back to Math.random once the forced queue is exhausted", () => {
        SimpleRoll.forceValues(5);
        expect(sr({ numDice: 1, dieFaces: 6 }).roll()).toBe(5); // forced
        const next = sr({ numDice: 1, dieFaces: 6 });
        next.roll(); // random fallback
        expect(next.rolls[0]).toBeGreaterThanOrEqual(1);
        expect(next.rolls[0]).toBeLessThanOrEqual(6);
    });

    it("forcedRemaining reflects the queue; clearForced empties it", () => {
        SimpleRoll.forceValues(1, 2, 3);
        expect(SimpleRoll.forcedRemaining).toBe(3);
        sr({ numDice: 2, dieFaces: 6 }).roll(); // consumes 2
        expect(SimpleRoll.forcedRemaining).toBe(1);
        SimpleRoll.clearForced();
        expect(SimpleRoll.forcedRemaining).toBe(0);
    });

    it("does not consume forced values for a pre-seeded roll (rolls already set)", () => {
        SimpleRoll.forceValues(5);
        const preset = sr({ numDice: 1, dieFaces: 100, rolls: [42] });
        expect(preset.roll()).toBe(42); // uses its own rolls, not the queue
        expect(SimpleRoll.forcedRemaining).toBe(1); // untouched
    });

    it("accepts a spread array of values", () => {
        const seq = [10, 20, 30];
        SimpleRoll.forceValues(...seq);
        expect(SimpleRoll.forcedRemaining).toBe(3);
    });
});
