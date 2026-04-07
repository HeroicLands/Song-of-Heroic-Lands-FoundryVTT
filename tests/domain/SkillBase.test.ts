import { describe, it, expect } from "vitest";
import { SkillBase } from "@src/domain/SkillBase";
import { ITEM_KIND, TRAIT_INTENSITY } from "@src/utils/constants";

// Helper to create a mock trait item
function mockTrait(
    shortcode: string,
    textValue: string,
    opts: { isNumeric?: boolean; intensity?: string } = {},
) {
    return {
        type: ITEM_KIND.TRAIT,
        system: {
            shortcode,
            textValue,
            isNumeric: opts.isNumeric ?? true,
            intensity: opts.intensity ?? TRAIT_INTENSITY.ATTRIBUTE,
            parent: { name: shortcode },
            logic: { id: shortcode },
        },
    } as any;
}

function mockBirthsign(textValue: string) {
    return {
        type: ITEM_KIND.TRAIT,
        system: { textValue },
    } as any;
}

function createSkillBase(
    formula: string,
    items: any[] = [],
    birthsign?: any,
): SkillBase {
    const opts: any = { items };
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
            expect(sb._parseFormula).toEqual(["attr:str", "attr:int"]);
        });

        it("rejects lone @ sign as invalid", () => {
            const sb = createSkillBase("@");
            expect(sb._parseFormula).toBeNull();
        });

        it("parses numeric modifiers and accumulates them", () => {
            const sb = createSkillBase("@str, @int, 5");
            expect(sb._parseFormula).toEqual(["attr:str", "attr:int", "5"]);
        });

        it("accumulates multiple numeric modifiers", () => {
            const sb = createSkillBase("@str, @int, 3, 2");
            // First modifier: 3, second: 3+2=5
            expect(sb._parseFormula).toEqual([
                "attr:str",
                "attr:int",
                "3",
                "5",
            ]);
        });

        it("rejects non-numeric non-attribute non-birthsign tokens", () => {
            const sb = createSkillBase("@str, abc, @int");
            expect(sb._parseFormula).toBeNull();
        });

        it("returns null for completely empty formula", () => {
            const sb = createSkillBase("");
            expect(sb._parseFormula).toBeNull();
        });

        it("handles mixed formula with attributes and modifiers", () => {
            const sb = createSkillBase("@str, @int, @sta, 5");
            expect(sb._parseFormula).toEqual([
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
            sb._parsedFormula = sb._parseFormula;
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
            expect(sb._calcValue()).toBe(0);
        });

        it("averages two attribute scores", () => {
            const sb = createSkillBase("@str, @dex", [
                mockTrait("str", "60"),
                mockTrait("dex", "40"),
            ]);
            // (60 + 40) / 2 = 50, primary (60) > secondary (40), round up
            expect(sb.value).toBe(50);
        });

        it("rounds up when primary > secondary for two attributes", () => {
            const sb = createSkillBase("@str, @dex", [
                mockTrait("str", "61"),
                mockTrait("dex", "40"),
            ]);
            // (61 + 40) / 2 = 50.5, primary > secondary → ceil = 51
            expect(sb.value).toBe(51);
        });

        it("rounds down when primary <= secondary for two attributes", () => {
            const sb = createSkillBase("@str, @dex", [
                mockTrait("str", "40"),
                mockTrait("dex", "61"),
            ]);
            // (40 + 61) / 2 = 50.5, primary <= secondary → floor = 50
            expect(sb.value).toBe(50);
        });

        it("uses normal rounding for three or more attributes", () => {
            const sb = createSkillBase("@str, @int, @dex", [
                mockTrait("str", "60"),
                mockTrait("int", "50"),
                mockTrait("dex", "41"),
            ]);
            // (60 + 50 + 41) / 3 = 50.333 → round = 50
            expect(sb.value).toBe(50);
        });

        it("adds numeric modifiers", () => {
            const sb = createSkillBase("@str, @dex, 5", [
                mockTrait("str", "60"),
                mockTrait("dex", "40"),
            ]);
            // average = 50, + 5 = 55
            expect(sb.value).toBe(55);
        });

        it.todo(
            "ensures result is at least 0 — needs negative modifier support investigation",
        );

        it("handles missing attributes gracefully (value 0)", () => {
            const sb = createSkillBase("@str, @dex", [
                mockTrait("str", "60"),
                // dex not provided
            ]);
            // str=60, dex=0 (missing), average=(60+0)/2=30, primary>secondary → ceil=30
            expect(sb.value).toBe(30);
        });
    });

    describe("setAttributes", () => {
        it("only picks traits with intensity=attribute and isNumeric=true", () => {
            const sb = createSkillBase("@str, @per", [
                mockTrait("str", "60", {
                    intensity: TRAIT_INTENSITY.ATTRIBUTE,
                    isNumeric: true,
                }),
                mockTrait("per", "50", {
                    intensity: TRAIT_INTENSITY.TRAIT,
                    isNumeric: true,
                }), // not an attribute
                mockTrait("chr", "70", {
                    intensity: TRAIT_INTENSITY.ATTRIBUTE,
                    isNumeric: false,
                }), // not numeric
            ]);
            // Only str resolves, per has wrong intensity, chr not numeric
            // str=60, per=0 → average=(60+0)/2=30
            expect(sb.value).toBe(30);
        });
    });

    describe("getters", () => {
        it("formula returns stored formula", () => {
            const sb = createSkillBase("@str, @int");
            expect(sb.formula).toBe("@str, @int");
        });

        it("birthsigns returns the parsed birthsign array", () => {
            const sb = createSkillBase("@str, @int", [], mockBirthsign("hirin"));
            expect(sb.birthsigns).toEqual(["hirin"]);
        });

        it("value returns 0 for null formula", () => {
            const sb = createSkillBase("");
            expect(sb.value).toBe(0);
        });
    });
});
