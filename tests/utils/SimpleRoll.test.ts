import { SimpleRoll } from "@utils/SimpleRoll";

describe("SimpleRoll", () => {
    describe("constructor", () => {
        it("creates a roll with default values", () => {
            const roll = new SimpleRoll();
            expect(roll.numDice).toBe(0);
            expect(roll.dieFaces).toBe(0);
            expect(roll.modifier).toBe(0);
            expect(roll.rolls).toEqual([]);
        });

        it("accepts partial data", () => {
            const roll = new SimpleRoll({ numDice: 2, dieFaces: 6 });
            expect(roll.numDice).toBe(2);
            expect(roll.dieFaces).toBe(6);
            expect(roll.modifier).toBe(0);
        });

        it("accepts full data", () => {
            const roll = new SimpleRoll({
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
            const roll = SimpleRoll.fromFormula("2d6+3");
            expect(roll.numDice).toBe(2);
            expect(roll.dieFaces).toBe(6);
            expect(roll.modifier).toBe(3);
        });

        it("parses 'd20' (implicit 1 die)", () => {
            const roll = SimpleRoll.fromFormula("d20");
            expect(roll.numDice).toBe(1);
            expect(roll.dieFaces).toBe(20);
            expect(roll.modifier).toBe(0);
        });

        it("parses '3d8-2'", () => {
            const roll = SimpleRoll.fromFormula("3d8-2");
            expect(roll.numDice).toBe(3);
            expect(roll.dieFaces).toBe(8);
            expect(roll.modifier).toBe(-2);
        });

        it("parses '+5' (modifier only)", () => {
            const roll = SimpleRoll.fromFormula("+5");
            expect(roll.numDice).toBe(0);
            expect(roll.dieFaces).toBe(0);
            expect(roll.modifier).toBe(5);
        });

        it("parses '4d6' (no modifier)", () => {
            const roll = SimpleRoll.fromFormula("4d6");
            expect(roll.numDice).toBe(4);
            expect(roll.dieFaces).toBe(6);
            expect(roll.modifier).toBe(0);
        });

        it("throws on invalid formula", () => {
            expect(() => SimpleRoll.fromFormula("invalid")).toThrow(
                "Invalid formula",
            );
        });

        it("throws on completely malformed formula", () => {
            expect(() => SimpleRoll.fromFormula("abc123xyz")).toThrow(
                "Invalid formula",
            );
        });
    });

    describe("roll", () => {
        it("returns a number", () => {
            const roll = new SimpleRoll({ numDice: 2, dieFaces: 6 });
            const result = roll.roll();
            expect(typeof result).toBe("number");
        });

        it("populates rolls array", () => {
            const roll = new SimpleRoll({ numDice: 3, dieFaces: 6 });
            roll.roll();
            expect(roll.rolls).toHaveLength(3);
        });

        it("each die is within valid range", () => {
            const roll = new SimpleRoll({ numDice: 10, dieFaces: 6 });
            roll.roll();
            for (const r of roll.rolls) {
                expect(r).toBeGreaterThanOrEqual(1);
                expect(r).toBeLessThanOrEqual(6);
            }
        });

        it("does not re-roll if already rolled", () => {
            const roll = new SimpleRoll({ numDice: 2, dieFaces: 6 });
            roll.roll();
            const firstRolls = [...roll.rolls];
            roll.roll();
            expect(roll.rolls).toEqual(firstRolls);
        });

        it("handles 0 dice", () => {
            const roll = new SimpleRoll({
                numDice: 0,
                dieFaces: 6,
                modifier: 5,
            });
            expect(roll.roll()).toBe(5);
            expect(roll.rolls).toHaveLength(0);
        });
    });

    describe("setRolls", () => {
        it("sets specific dice results", () => {
            const roll = new SimpleRoll({ numDice: 2, dieFaces: 6 });
            roll.setRolls([3, 5]);
            expect(roll.rolls).toEqual([3, 5]);
        });

        it("throws when values length does not match numDice", () => {
            const roll = new SimpleRoll({ numDice: 2, dieFaces: 6 });
            expect(() => roll.setRolls([1, 2, 3])).toThrow(
                "Expected 2 roll values, got 3",
            );
        });
    });

    describe("total", () => {
        it("sums rolls plus modifier", () => {
            const roll = new SimpleRoll({
                numDice: 2,
                dieFaces: 6,
                modifier: 3,
                rolls: [4, 5],
            });
            expect(roll.total).toBe(12);
        });

        it("returns just modifier when no rolls", () => {
            const roll = new SimpleRoll({ modifier: 7 });
            expect(roll.total).toBe(7);
        });

        it("handles negative modifier", () => {
            const roll = new SimpleRoll({
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
            const roll = new SimpleRoll({ numDice: 2, dieFaces: 6 });
            // median of 1d6 = 3.5, so 2d6 median = 7
            expect(roll.median).toBe(7);
        });

        it("computes median for 1d20", () => {
            const roll = new SimpleRoll({ numDice: 1, dieFaces: 20 });
            // median of 1d20 with even faces = (20/2 + 0.5) = 10.5, round = 11
            expect(roll.median).toBe(11);
        });

        it("includes modifier in median", () => {
            const roll = new SimpleRoll({
                numDice: 2,
                dieFaces: 6,
                modifier: 3,
            });
            expect(roll.median).toBe(10);
        });

        it("returns just modifier when 0 dice", () => {
            const roll = new SimpleRoll({ numDice: 0, dieFaces: 6, modifier: 5 });
            expect(roll.median).toBe(5);
        });

        it("handles odd number of faces", () => {
            const roll = new SimpleRoll({ numDice: 1, dieFaces: 5 });
            // (5+1)/2 = 3
            expect(roll.median).toBe(3);
        });
    });

    describe("reset", () => {
        it("clears the rolls array", () => {
            const roll = new SimpleRoll({ numDice: 2, dieFaces: 6 });
            roll.roll();
            expect(roll.rolls.length).toBeGreaterThan(0);
            roll.reset();
            expect(roll.rolls).toEqual([]);
        });

        it("allows re-rolling after reset", () => {
            const roll = new SimpleRoll({ numDice: 1, dieFaces: 6 });
            roll.setRolls([3]);
            expect(roll.total).toBe(3);
            roll.reset();
            const result = roll.roll();
            expect(typeof result).toBe("number");
        });
    });

    describe("toJSON", () => {
        it.todo("serializes to JSON with __kind field");
    });

    describe("createRoll", () => {
        it.todo("generates a Foundry VTT Roll instance (requires Foundry mocking)");
    });
});
