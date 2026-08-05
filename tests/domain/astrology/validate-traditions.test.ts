import { describe, it, expect } from "vitest";
import { validateTraditions } from "@src/entity/astrology";

describe("validateTraditions", () => {
    it("accepts a well-formed tradition and tags it source=world", () => {
        const { traditions, skipped } = validateTraditions({
            arc: {
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
            },
        });
        expect(skipped).toEqual([]);
        expect(traditions.arc.key).toBe("arc");
        expect(traditions.arc.source).toBe("world");
        expect(traditions.arc.signs[0].shortcode).toBe("alpha");
    });

    it("defaults label, cuspDays, and empty skillModifiers", () => {
        const { traditions } = validateTraditions({
            t: {
                signs: [
                    {
                        shortcode: "s1",
                        start: { month: 1, day: 1 },
                        end: { month: 12, day: 30 },
                    },
                ],
            },
        });
        expect(traditions.t.label).toBe("t");
        expect(traditions.t.signs[0].label).toBe("s1");
        expect(traditions.t.signs[0].cuspDays).toBe(0);
        expect(traditions.t.signs[0].skillModifiers).toEqual({});
    });

    it("skips a tradition with no signs array, keeping the rest", () => {
        const { traditions, skipped } = validateTraditions({
            bad: { label: "Bad" },
            good: {
                signs: [
                    { shortcode: "x", start: { month: 1, day: 1 }, end: { month: 2, day: 1 } },
                ],
            },
        });
        expect(traditions.good).toBeDefined();
        expect(traditions.bad).toBeUndefined();
        expect(skipped.map((s) => s.key)).toContain("bad");
    });

    it("skips individual malformed signs by index, keeping valid ones", () => {
        const { traditions, skipped } = validateTraditions({
            t: {
                signs: [
                    { shortcode: "ok", start: { month: 1, day: 1 }, end: { month: 2, day: 1 } },
                    { start: { month: 1, day: 1 }, end: { month: 2, day: 1 } }, // no shortcode
                    { shortcode: "bad2", start: { month: 1 } }, // bad start
                ],
            },
        });
        expect(traditions.t.signs.map((s) => s.shortcode)).toEqual(["ok"]);
        expect(skipped.map((s) => s.key)).toEqual(
            expect.arrayContaining(["t.signs[1]", "t.signs[2]"]),
        );
    });

    it("drops a tradition whose every sign is invalid", () => {
        const { traditions, skipped } = validateTraditions({
            t: { signs: [{ shortcode: "x" }] }, // missing start/end
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
            t: {
                signs: [
                    {
                        shortcode: "s",
                        start: { month: 1, day: 1 },
                        end: { month: 2, day: 1 },
                        skillModifiers: { good: 5, bad: "x", nested: {} },
                    },
                ],
            },
        });
        expect(traditions.t.signs[0].skillModifiers).toEqual({ good: 5 });
    });
});
