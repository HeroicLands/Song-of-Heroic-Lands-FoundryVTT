import { describe, it, expect } from "vitest";
import {
    mergeSkillAptitudes,
    skillAptitudeFor,
    subTypeAptitudeKey,
} from "@src/document/item/logic/skill-aptitudes";
import { SKILL_APTITUDE_SUBTYPE_PREFIX, SKILL_SUBTYPE } from "@src/utils/constants";

describe("skill aptitudes — the selector key", () => {
    it("prefixes a subtype selector, and leaves a shortcode bare", () => {
        expect(subTypeAptitudeKey(SKILL_SUBTYPE.NATURE)).toBe("subType:nature");
        expect(SKILL_APTITUDE_SUBTYPE_PREFIX).toBe("subType:");
    });
});

describe("mergeSkillAptitudes", () => {
    it("seeds an empty accumulator with every entry", () => {
        const acc = new Map<string, number>();
        mergeSkillAptitudes(acc, {
            "subType:nature": 15,
            "subType:physical": -15,
        });
        expect(acc.get("subType:nature")).toBe(15);
        expect(acc.get("subType:physical")).toBe(-15);
    });

    it("keeps the greater value on collision, whichever source arrives first", () => {
        const ascending = new Map<string, number>();
        mergeSkillAptitudes(ascending, { "subType:combat": 10 });
        mergeSkillAptitudes(ascending, { "subType:combat": 15 });
        expect(ascending.get("subType:combat")).toBe(15);

        const descending = new Map<string, number>();
        mergeSkillAptitudes(descending, { "subType:combat": 15 });
        mergeSkillAptitudes(descending, { "subType:combat": 10 });
        expect(descending.get("subType:combat")).toBe(15);
    });

    it("takes the less-negative value when both sources hinder", () => {
        const acc = new Map<string, number>();
        mergeSkillAptitudes(acc, { "subType:social": -15 });
        mergeSkillAptitudes(acc, { "subType:social": -5 });
        expect(acc.get("subType:social")).toBe(-5);
    });

    it("lets a zero beat a negative — an untouched element is better than a hindered one", () => {
        const acc = new Map<string, number>();
        mergeSkillAptitudes(acc, { "subType:lore": -10 });
        mergeSkillAptitudes(acc, { "subType:lore": 0 });
        expect(acc.get("subType:lore")).toBe(0);
    });

    it("keeps the greatest across three or more sources", () => {
        const acc = new Map<string, number>();
        mergeSkillAptitudes(acc, { "subType:craft": -5 });
        mergeSkillAptitudes(acc, { "subType:craft": 10 });
        mergeSkillAptitudes(acc, { "subType:craft": 5 });
        expect(acc.get("subType:craft")).toBe(10);
    });

    it("never sums", () => {
        const acc = new Map<string, number>();
        mergeSkillAptitudes(acc, { "subType:nature": 15 });
        mergeSkillAptitudes(acc, { "subType:nature": 15 });
        expect(acc.get("subType:nature")).toBe(15);
    });

    it("ignores an absent or empty map", () => {
        const acc = new Map<string, number>([["subType:nature", 5]]);
        mergeSkillAptitudes(acc, undefined);
        mergeSkillAptitudes(acc, {});
        expect(acc.get("subType:nature")).toBe(5);
        expect(acc.size).toBe(1);
    });

    it("skips non-numeric values rather than poisoning the accumulator", () => {
        const acc = new Map<string, number>();
        mergeSkillAptitudes(acc, {
            "subType:nature": "15" as unknown as number,
            "subType:craft": Number.NaN,
            "subType:lore": 5,
        });
        expect(acc.has("subType:nature")).toBe(false);
        expect(acc.has("subType:craft")).toBe(false);
        expect(acc.get("subType:lore")).toBe(5);
    });

    it("returns the accumulator it was given, so calls can chain", () => {
        const acc = new Map<string, number>();
        expect(mergeSkillAptitudes(acc, { a: 1 })).toBe(acc);
    });
});

describe("skillAptitudeFor", () => {
    const aptitudes = new Map<string, number>([
        ["subType:nature", 15],
        ["subType:mystical", -5],
        ["physera", 10],
        ["pneumenos", -15],
    ]);

    it("matches by skill shortcode", () => {
        expect(skillAptitudeFor(aptitudes, "physera", "combat")).toBe(10);
    });

    it("matches by subtype", () => {
        expect(skillAptitudeFor(aptitudes, "hunting", SKILL_SUBTYPE.NATURE)).toBe(15);
    });

    it("takes the greater when a skill matches both, whichever is greater", () => {
        // shortcode (+10) beats subType (−5)
        expect(skillAptitudeFor(aptitudes, "physera", SKILL_SUBTYPE.MYSTICAL)).toBe(10);
        // subType (+15) beats shortcode (−15)
        expect(skillAptitudeFor(aptitudes, "pneumenos", SKILL_SUBTYPE.NATURE)).toBe(15);
    });

    it("returns undefined when neither selector matches", () => {
        expect(skillAptitudeFor(aptitudes, "tactics", SKILL_SUBTYPE.COMBAT)).toBeUndefined();
    });

    it("returns a matched zero, distinct from no match", () => {
        const withZero = new Map<string, number>([["subType:combat", 0]]);
        expect(skillAptitudeFor(withZero, "tactics", SKILL_SUBTYPE.COMBAT)).toBe(0);
        expect(skillAptitudeFor(withZero, "tactics", SKILL_SUBTYPE.LORE)).toBeUndefined();
    });

    it("tolerates an absent accumulator or absent selectors", () => {
        expect(skillAptitudeFor(undefined, "physera", "nature")).toBeUndefined();
        expect(skillAptitudeFor(aptitudes, undefined, undefined)).toBeUndefined();
        expect(skillAptitudeFor(aptitudes, undefined, SKILL_SUBTYPE.NATURE)).toBe(15);
        expect(skillAptitudeFor(aptitudes, "physera", undefined)).toBe(10);
    });
});
