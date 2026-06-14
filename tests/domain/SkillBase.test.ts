import { describe, it, expect } from "vitest";
import { SkillBase } from "@src/domain/SkillBase";

// Helper to create a mock AttributeLogic — SkillBase reads only
// `data.shortcode`, `data.name`, and `score.effective`.
function mockAttribute(shortcode: string, score: number): any {
    return {
        data: { shortcode, name: shortcode },
        score: { effective: score },
    } as any;
}

// Helper to create a mock TraitLogic birthsign — SkillBase reads only
// `data.textValue`.
function mockBirthsign(textValue: string): any {
    return {
        data: { textValue },
    } as any;
}

function createSkillBase(
    formula: string,
    attributes: any[] = [],
    birthsign?: any,
): SkillBase {
    const opts: any = { attributes };
    if (birthsign) opts.birthsign = birthsign;
    return new SkillBase(formula, opts);
}

describe("SkillBase", () => {
    describe("constructor", () => {
        it("sets _formula to null when formula is empty", () => {
            const sb = createSkillBase("");
            expect(sb.formula).toBeNull();
        });

        it("stores the formula string", () => {
            const sb = createSkillBase("@str, @int");
            expect(sb.formula).toBe("@str, @int");
        });

        it("works without a birthsign", () => {
            const sb = createSkillBase("@str, @int");
            expect(sb.birthsigns).toEqual([]);
        });

        it("parses birthsign textValue split by dash", () => {
            const sb = createSkillBase(
                "@str, @int",
                [],
                mockBirthsign("hirin-ahnu"),
            );
            expect(sb.birthsigns).toEqual(["hirin", "ahnu"]);
        });
    });

    describe("_parseFormula", () => {
        it("parses @attr references as attr:name entries", () => {
            const sb = createSkillBase("@str, @int");
            expect((sb as any)._parseFormula).toEqual(["attr:str", "attr:int"]);
        });

        it("rejects lone @ sign as invalid", () => {
            const sb = createSkillBase("@");
            expect((sb as any)._parseFormula).toBeNull();
        });

        it("parses numeric modifiers and accumulates them", () => {
            const sb = createSkillBase("@str, @int, 5");
            expect((sb as any)._parseFormula).toEqual([
                "attr:str",
                "attr:int",
                "5",
            ]);
        });

        it("accumulates multiple numeric modifiers", () => {
            const sb = createSkillBase("@str, @int, 3, 2");
            // First modifier: 3, second: 3+2=5
            expect((sb as any)._parseFormula).toEqual([
                "attr:str",
                "attr:int",
                "3",
                "5",
            ]);
        });

        it("rejects non-numeric non-attribute non-birthsign tokens", () => {
            const sb = createSkillBase("@str, abc, @int");
            expect((sb as any)._parseFormula).toBeNull();
        });

        it("returns null for completely empty formula", () => {
            const sb = createSkillBase("");
            expect((sb as any)._parseFormula).toBeNull();
        });

        it("handles mixed formula with attributes and modifiers", () => {
            const sb = createSkillBase("@str, @int, @sta, 5");
            expect((sb as any)._parseFormula).toEqual([
                "attr:str",
                "attr:int",
                "attr:sta",
                "5",
            ]);
        });
    });

    describe("valid", () => {
        it("returns true when parsedFormula has entries", () => {
            const sb = createSkillBase("@str, @int");
            // Force parse
            (sb as any)._parsedFormula = (sb as any)._parseFormula;
            expect(sb.valid).toBe(true);
        });

        it("returns false when parsedFormula is null", () => {
            const sb = createSkillBase("");
            expect(sb.valid).toBe(false);
        });
    });

    describe("_calcValue", () => {
        it("returns 0 when formula is invalid", () => {
            const sb = createSkillBase("");
            expect((sb as any)._calcValue()).toBe(0);
        });

        it("averages two attribute scores", () => {
            const sb = createSkillBase("@str, @dex", [
                mockAttribute("str", 60),
                mockAttribute("dex", 40),
            ]);
            // (60 + 40) / 2 = 50, primary (60) > secondary (40), round up
            expect(sb.value).toBe(50);
        });

        it("rounds up when primary > secondary for two attributes", () => {
            const sb = createSkillBase("@str, @dex", [
                mockAttribute("str", 61),
                mockAttribute("dex", 40),
            ]);
            // (61 + 40) / 2 = 50.5, primary > secondary → ceil = 51
            expect(sb.value).toBe(51);
        });

        it("rounds down when primary <= secondary for two attributes", () => {
            const sb = createSkillBase("@str, @dex", [
                mockAttribute("str", 40),
                mockAttribute("dex", 61),
            ]);
            // (40 + 61) / 2 = 50.5, primary <= secondary → floor = 50
            expect(sb.value).toBe(50);
        });

        it("uses normal rounding for three or more attributes", () => {
            const sb = createSkillBase("@str, @int, @dex", [
                mockAttribute("str", 60),
                mockAttribute("int", 50),
                mockAttribute("dex", 41),
            ]);
            // (60 + 50 + 41) / 3 = 50.333 → round = 50
            expect(sb.value).toBe(50);
        });

        it("adds numeric modifiers", () => {
            const sb = createSkillBase("@str, @dex, 5", [
                mockAttribute("str", 60),
                mockAttribute("dex", 40),
            ]);
            // average = 50, + 5 = 55
            expect(sb.value).toBe(55);
        });

        it.todo(
            "ensures result is at least 0 — needs negative modifier support investigation",
        );

        it("handles missing attributes gracefully (value 0)", () => {
            const sb = createSkillBase("@str, @dex", [
                mockAttribute("str", 60),
                // dex not provided
            ]);
            // str=60, dex=0 (missing), average=(60+0)/2=30, primary>secondary → ceil=30
            expect(sb.value).toBe(30);
        });
    });

    describe("setAttributes", () => {
        it("ignores attributes not referenced by the formula", () => {
            // The caller passes only attribute logics (already filtered by
            // kind via `logicTypes[ATTRIBUTE]`), so SkillBase matches purely by
            // formula shortcode and ignores any extra attributes.
            const sb = createSkillBase("@str, @dex", [
                mockAttribute("str", 60),
                mockAttribute("dex", 40),
                mockAttribute("wis", 100), // not referenced by the formula
            ]);
            // average of str & dex = 50; wis is ignored
            expect(sb.value).toBe(50);
        });
    });

    describe("getters", () => {
        it("formula returns stored formula", () => {
            const sb = createSkillBase("@str, @int");
            expect(sb.formula).toBe("@str, @int");
        });

        it("birthsigns returns the parsed birthsign array", () => {
            const sb = createSkillBase(
                "@str, @int",
                [],
                mockBirthsign("hirin"),
            );
            expect(sb.birthsigns).toEqual(["hirin"]);
        });

        it("value returns 0 for null formula", () => {
            const sb = createSkillBase("");
            expect(sb.value).toBe(0);
        });
    });
});
