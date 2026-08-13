import { describe, it, expect } from "vitest";
import { MysteryLogic } from "@src/document/item/logic/MysteryLogic";
import { SkillLogic } from "@src/document/item/logic/SkillLogic";
import {
    ITEM_KIND,
    MYSTERY_SUBTYPE,
    SKILL_SUBTYPE,
    VALUE_DELTA_INFO,
} from "@src/utils/constants";
import { makeItemLogic, makeMockActor } from "@tests/mocks/logicHarness";

/**
 * A mock actor standing in for a Being: it exposes `itemTypes.skill` (read
 * during mystery evaluation) and the `skillAptitudes` accumulator that
 * `BeingLogic.initialize()` creates in production.
 */
function makeBeingLikeActor(withAccumulator = true) {
    const actor = makeMockActor();
    actor.itemTypes = { skill: [] as any[], affiliation: [] as any[] };
    if (withAccumulator) {
        (actor.logic as any).skillAptitudes = new Map<string, number>();
    }
    return actor;
}

/** Embed a birthsign-shaped Mystery carrying an aptitude map. */
function makeBirthsign(
    actor: any,
    shortcode: string,
    skillAptitudes: Record<string, number> | undefined,
) {
    const logic = makeItemLogic(
        MysteryLogic,
        ITEM_KIND.MYSTERY,
        {
            subType: MYSTERY_SUBTYPE.OTHER,
            assocSkillCode: null,
            assocAffiliationCode: null,
            levelBase: 0,
            charges: { value: null, max: null },
            skillAptitudes,
        },
        { actor, shortcode, id: `myst${shortcode}`.padEnd(16, "0") },
    );
    logic.initialize();
    return logic;
}

/** Embed a Skill and run it up to (but not through) finalize. */
function makeSkill(
    actor: any,
    shortcode: string,
    subType: string,
    masteryLevelBase = 40,
) {
    const logic = makeItemLogic(
        SkillLogic,
        ITEM_KIND.SKILL,
        {
            subType,
            skillBaseFormula: "",
            masteryLevelBase,
            improveFlag: false,
            combatCategory: "none",
            parentSkillCode: "",
            initSkillMult: 1,
        },
        { actor, shortcode, id: `skill${shortcode}`.padEnd(16, "0") },
    );
    logic.initialize();
    logic.evaluate();
    actor.itemTypes.skill.push(logic.item);
    return logic;
}

describe("a birthsign contributes its aptitudes during evaluate", () => {
    it("merges its map into the actor's accumulator", () => {
        const actor = makeBeingLikeActor();
        const sign = makeBirthsign(actor, "arnos", {
            "subType:nature": 15,
            "subType:physical": -15,
        });
        sign.evaluate();
        const acc = (actor.logic as any).skillAptitudes as Map<string, number>;
        expect(acc.get("subType:nature")).toBe(15);
        expect(acc.get("subType:physical")).toBe(-15);
    });

    it("keeps the greater value when two signs speak to one selector", () => {
        const actor = makeBeingLikeActor();
        // Arnos favours Earth (+15) and hinders Air (−15); Bourax is +10 / −10.
        makeBirthsign(actor, "arnos", {
            "subType:nature": 15,
            "subType:physical": -15,
        }).evaluate();
        makeBirthsign(actor, "bourax", {
            "subType:nature": 10,
            "subType:physical": -10,
        }).evaluate();
        const acc = (actor.logic as any).skillAptitudes as Map<string, number>;
        // The cusp: better of each, never the sum.
        expect(acc.get("subType:nature")).toBe(15);
        expect(acc.get("subType:physical")).toBe(-10);
    });

    it("contributes nothing when it carries no aptitudes", () => {
        const actor = makeBeingLikeActor();
        makeBirthsign(actor, "plain", undefined).evaluate();
        expect((actor.logic as any).skillAptitudes.size).toBe(0);
    });

    it("no-ops on an actor with no accumulator, rather than throwing", () => {
        const actor = makeBeingLikeActor(false);
        const sign = makeBirthsign(actor, "arnos", { "subType:nature": 15 });
        expect(() => sign.evaluate()).not.toThrow();
        expect((actor.logic as any).skillAptitudes).toBeUndefined();
    });
});

describe("a skill applies its aptitude during finalize", () => {
    it("adds a single delta for a subtype match", () => {
        const actor = makeBeingLikeActor();
        makeBirthsign(actor, "arnos", { "subType:nature": 15 }).evaluate();
        const skill = makeSkill(actor, "hunting", SKILL_SUBTYPE.NATURE);
        const before = skill.masteryLevel.effective;
        skill.finalize();
        expect(skill.masteryLevel.has(VALUE_DELTA_INFO.APTITUDE)).toBe(true);
        expect(skill.masteryLevel.effective).toBe(before + 15);
    });

    it("applies a negative aptitude as a penalty", () => {
        const actor = makeBeingLikeActor();
        makeBirthsign(actor, "arnos", { "subType:physical": -15 }).evaluate();
        const skill = makeSkill(actor, "climbing", SKILL_SUBTYPE.PHYSICAL);
        const before = skill.masteryLevel.effective;
        skill.finalize();
        expect(skill.masteryLevel.effective).toBe(before - 15);
    });

    it("takes the greater when the skill matches by shortcode and by subtype", () => {
        const actor = makeBeingLikeActor();
        makeBirthsign(actor, "arnos", {
            "subType:mystical": -5,
            physera: 15,
        }).evaluate();
        const skill = makeSkill(actor, "physera", SKILL_SUBTYPE.MYSTICAL);
        const before = skill.masteryLevel.effective;
        skill.finalize();
        expect(skill.masteryLevel.effective).toBe(before + 15);
    });

    it("adds no delta when no selector matches", () => {
        const actor = makeBeingLikeActor();
        makeBirthsign(actor, "arnos", { "subType:nature": 15 }).evaluate();
        const skill = makeSkill(actor, "tactics", SKILL_SUBTYPE.COMBAT);
        const before = skill.masteryLevel.effective;
        skill.finalize();
        expect(skill.masteryLevel.has(VALUE_DELTA_INFO.APTITUDE)).toBe(false);
        expect(skill.masteryLevel.effective).toBe(before);
    });

    it("adds no delta for a matched zero — an untouched element stays unlabelled", () => {
        const actor = makeBeingLikeActor();
        makeBirthsign(actor, "bourax", { "subType:combat": 0 }).evaluate();
        const skill = makeSkill(actor, "tactics", SKILL_SUBTYPE.COMBAT);
        skill.finalize();
        expect(skill.masteryLevel.has(VALUE_DELTA_INFO.APTITUDE)).toBe(false);
    });

    it("is unaffected on an actor with no birthsign at all", () => {
        const actor = makeBeingLikeActor();
        const skill = makeSkill(actor, "hunting", SKILL_SUBTYPE.NATURE);
        const before = skill.masteryLevel.effective;
        skill.finalize();
        expect(skill.masteryLevel.effective).toBe(before);
    });
});
