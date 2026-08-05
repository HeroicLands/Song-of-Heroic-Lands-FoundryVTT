import { describe, it, expect } from "vitest";
import { validateTraditions } from "@src/entity/astrology";

describe("validateTraditions", () => {
    it("accepts a well-formed self-describing tradition and tags it source=world", () => {
        const { traditions, skipped } = validateTraditions({
            shortcode: "arc",
            label: "Arcane",
            signs: [
                {
                    shortcode: "alpha",
                    label: "Alpha",
                    start: { month: 1, day: 1 },
                    end: { month: 6, day: 30 },
                    cuspDays: 2,
                    skillModifiers: { pel: 15, "subtype:combat": 5 },
                },
            ],
        });
        expect(skipped).toEqual([]);
        expect(traditions.arc.key).toBe("arc");
        expect(traditions.arc.source).toBe("world");
        expect(traditions.arc.signs[0].shortcode).toBe("alpha");
    });

    it("keys the tradition by its own shortcode and honours the source", () => {
        const { traditions } = validateTraditions(
            {
                shortcode: "astrokyklos",
                label: "Astrokýklos",
                signs: [
                    {
                        shortcode: "arnos",
                        start: { month: 1, day: 4 },
                        end: { month: 2, day: 3 },
                        cuspDays: 2,
                        skillModifiers: { "subtype:nature": 15 },
                    },
                ],
            },
            "builtin",
        );
        expect(Object.keys(traditions)).toEqual(["astrokyklos"]);
        expect(traditions.astrokyklos.key).toBe("astrokyklos");
        expect(traditions.astrokyklos.label).toBe("Astrokýklos");
        expect(traditions.astrokyklos.source).toBe("builtin");
    });

    it("defaults label to the shortcode, plus cuspDays and empty skillModifiers", () => {
        const { traditions } = validateTraditions({
            shortcode: "t",
            signs: [
                {
                    shortcode: "s1",
                    start: { month: 1, day: 1 },
                    end: { month: 12, day: 30 },
                },
            ],
        });
        expect(traditions.t.label).toBe("t");
        expect(traditions.t.signs[0].label).toBe("s1");
        expect(traditions.t.signs[0].cuspDays).toBe(0);
        expect(traditions.t.signs[0].skillModifiers).toEqual({});
    });

    it("accepts an array of self-describing traditions keyed by shortcode", () => {
        const { traditions, skipped } = validateTraditions([
            {
                shortcode: "one",
                signs: [
                    {
                        shortcode: "a",
                        start: { month: 1, day: 1 },
                        end: { month: 2, day: 1 },
                    },
                ],
            },
            {
                shortcode: "two",
                signs: [
                    {
                        shortcode: "b",
                        start: { month: 3, day: 1 },
                        end: { month: 4, day: 1 },
                    },
                ],
            },
        ]);
        expect(skipped).toEqual([]);
        expect(Object.keys(traditions).sort()).toEqual(["one", "two"]);
        expect(traditions.two.signs[0].shortcode).toBe("b");
    });

    it("skips a tradition missing a string shortcode", () => {
        const { traditions, skipped } = validateTraditions({
            label: "No shortcode",
            signs: [
                {
                    shortcode: "x",
                    start: { month: 1, day: 1 },
                    end: { month: 2, day: 1 },
                },
            ],
        });
        expect(traditions).toEqual({});
        expect(skipped.some((s) => /shortcode/.test(s.reason))).toBe(true);
    });

    it("skips a tradition with no signs array, keeping the rest of an array", () => {
        const { traditions, skipped } = validateTraditions([
            { shortcode: "bad", label: "Bad" },
            {
                shortcode: "good",
                signs: [
                    {
                        shortcode: "x",
                        start: { month: 1, day: 1 },
                        end: { month: 2, day: 1 },
                    },
                ],
            },
        ]);
        expect(traditions.good).toBeDefined();
        expect(traditions.bad).toBeUndefined();
        expect(skipped.map((s) => s.key)).toContain("bad");
    });

    it("skips individual malformed signs by index, keeping valid ones", () => {
        const { traditions, skipped } = validateTraditions({
            shortcode: "t",
            signs: [
                {
                    shortcode: "ok",
                    start: { month: 1, day: 1 },
                    end: { month: 2, day: 1 },
                },
                { start: { month: 1, day: 1 }, end: { month: 2, day: 1 } }, // no shortcode
                { shortcode: "bad2", start: { month: 1 } }, // bad start
            ],
        });
        expect(traditions.t.signs.map((s) => s.shortcode)).toEqual(["ok"]);
        expect(skipped.map((s) => s.key)).toEqual(
            expect.arrayContaining(["t.signs[1]", "t.signs[2]"]),
        );
    });

    it("drops a tradition whose every sign is invalid", () => {
        const { traditions, skipped } = validateTraditions({
            shortcode: "t",
            signs: [{ shortcode: "x" }], // missing start/end
        });
        expect(traditions.t).toBeUndefined();
        expect(skipped.some((s) => s.key === "t")).toBe(true);
    });

    it("returns empty for non-object input", () => {
        expect(validateTraditions(null).traditions).toEqual({});
        expect(validateTraditions("nope").traditions).toEqual({});
        expect(validateTraditions(42).skipped).toEqual([]);
    });

    it("drops non-numeric skill-modifier values", () => {
        const { traditions } = validateTraditions({
            shortcode: "t",
            signs: [
                {
                    shortcode: "s",
                    start: { month: 1, day: 1 },
                    end: { month: 2, day: 1 },
                    skillModifiers: { good: 5, bad: "x", nested: {} },
                },
            ],
        });
        expect(traditions.t.signs[0].skillModifiers).toEqual({ good: 5 });
    });

    describe("year cycles (#1036)", () => {
        it("accepts a tradition with signs and cycles", () => {
            const { traditions, skipped } = validateTraditions({
                shortcode: "t",
                signs: [
                    {
                        shortcode: "s",
                        start: { month: 1, day: 1 },
                        end: { month: 12, day: 30 },
                    },
                ],
                cycles: [
                    {
                        shortcode: "animal",
                        label: "Animal",
                        cycleLength: 12,
                        epochYear: 0,
                        positions: [
                            {
                                shortcode: "rat",
                                label: "Rat",
                                skillModifiers: { stealth: 5 },
                            },
                            { shortcode: "ox", skillModifiers: { toil: 3 } },
                        ],
                    },
                ],
            });
            expect(skipped).toEqual([]);
            const cycle = traditions.t.cycles?.[0];
            expect(cycle?.shortcode).toBe("animal");
            expect(cycle?.cycleLength).toBe(12);
            expect(cycle?.epochYear).toBe(0);
            expect(cycle?.positions.map((p) => p.shortcode)).toEqual([
                "rat",
                "ox",
            ]);
            // label defaults to the position shortcode; modifiers numeric-coerced.
            expect(cycle?.positions[1].label).toBe("ox");
            expect(cycle?.positions[0].skillModifiers).toEqual({ stealth: 5 });
        });

        it("accepts a cycle-only tradition (no solar signs)", () => {
            const { traditions, skipped } = validateTraditions({
                shortcode: "cyc",
                cycles: [
                    {
                        shortcode: "element",
                        cycleLength: 3,
                        positions: [
                            { shortcode: "fire", skillModifiers: { hot: 5 } },
                        ],
                    },
                ],
            });
            expect(skipped).toEqual([]);
            expect(traditions.cyc.signs).toEqual([]);
            expect(traditions.cyc.cycles?.[0].shortcode).toBe("element");
            expect(traditions.cyc.cycles?.[0].epochYear).toBe(0); // defaulted
        });

        it("drops a tradition with neither valid signs nor valid cycles", () => {
            const { traditions, skipped } = validateTraditions({
                shortcode: "empty",
                label: "Empty",
            });
            expect(traditions.empty).toBeUndefined();
            expect(skipped.some((s) => s.key === "empty")).toBe(true);
        });

        it("skips a cycle with a non-positive cycleLength", () => {
            const { traditions, skipped } = validateTraditions({
                shortcode: "t",
                signs: [
                    {
                        shortcode: "s",
                        start: { month: 1, day: 1 },
                        end: { month: 12, day: 30 },
                    },
                ],
                cycles: [
                    {
                        shortcode: "bad",
                        cycleLength: 0,
                        positions: [{ shortcode: "x" }],
                    },
                ],
            });
            expect(traditions.t.cycles ?? []).toEqual([]);
            expect(skipped.map((s) => s.key)).toContain("t.cycles[0]");
        });

        it("skips a cycle with no valid positions but keeps the tradition's signs", () => {
            const { traditions, skipped } = validateTraditions({
                shortcode: "t",
                signs: [
                    {
                        shortcode: "s",
                        start: { month: 1, day: 1 },
                        end: { month: 12, day: 30 },
                    },
                ],
                cycles: [{ shortcode: "bad", cycleLength: 3, positions: [{}] }],
            });
            expect(traditions.t.signs).toHaveLength(1);
            expect(traditions.t.cycles ?? []).toEqual([]);
            expect(skipped.map((s) => s.key)).toContain("t.cycles[0]");
        });

        it("skips malformed positions by index, keeping valid ones", () => {
            const { traditions, skipped } = validateTraditions({
                shortcode: "cyc",
                cycles: [
                    {
                        shortcode: "element",
                        cycleLength: 3,
                        positions: [
                            { shortcode: "fire" },
                            {}, // no shortcode
                            { shortcode: "air" },
                        ],
                    },
                ],
            });
            expect(
                traditions.cyc.cycles?.[0].positions.map((p) => p.shortcode),
            ).toEqual(["fire", "air"]);
            expect(skipped.map((s) => s.key)).toContain(
                "cyc.cycles[0].positions[1]",
            );
        });
    });
});
