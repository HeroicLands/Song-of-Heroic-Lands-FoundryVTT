import { describe, it, expect, vi, afterEach } from "vitest";
import { MysticalAbilityLogic } from "@src/document/item/logic/MysticalAbilityLogic";
import { SkillLogic } from "@src/document/item/logic/SkillLogic";
import { ValueModifier } from "@src/domain/modifier/ValueModifier";
import { ITEM_KIND } from "@src/utils/constants";
import { makeItemLogic, makeMockActor } from "@tests/mocks/logicHarness";

/** Default MysticalAbilityData fields; override per test. */
function abilityFields(overrides: Record<string, unknown> = {}) {
    return {
        subType: "arcaneincantation",
        assocSkillCode: "",
        assocMysteryCode: "",
        levelBase: 0,
        masteryLevelBase: 30,
        improveFlag: false,
        charges: { usesCharges: false, value: 0, max: 0 },
        ...overrides,
    };
}

function makeAbility(
    overrides: Record<string, unknown> = {},
    opts: Record<string, unknown> = {},
) {
    return makeItemLogic(
        MysticalAbilityLogic,
        ITEM_KIND.MYSTICALABILITY,
        abilityFields(overrides),
        { name: "Test Ability", ...opts },
    );
}

/**
 * Build a mock actor with the `itemTypes` lists that
 * MysticalAbilityLogic.evaluate() reads.
 */
function makeAbilityActor() {
    const actor = makeMockActor();
    actor.itemTypes = { skill: [] as any[], mystery: [] as any[] };
    return actor;
}

/** Embed a real SkillLogic on the actor and register it in itemTypes. */
function makeSkillOnActor(
    actor: any,
    shortcode: string,
    masteryLevelBase = 40,
) {
    const logic = makeItemLogic(
        SkillLogic,
        ITEM_KIND.SKILL,
        {
            subType: "social",
            skillBaseFormula: "",
            masteryLevelBase,
            improveFlag: false,
            combatCategory: "none",
            parentSkillCode: "",
            initSkillMult: 1,
        },
        { actor, shortcode, id: `skill${shortcode}`.padEnd(16, "0") },
    );
    actor.itemTypes.skill.push(logic.item);
    return logic;
}

/** Register a stub mystery item (evaluate only reads shortcode and .logic). */
function makeMysteryStubOnActor(actor: any, shortcode: string) {
    const logic = { stub: "mystery", data: { shortcode } };
    actor.itemTypes.mystery.push({ system: { shortcode }, logic });
    return logic;
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe("MysticalAbilityLogic", () => {
    describe("construction", () => {
        it("constructs with its real intrinsic actions (perform is wired)", () => {
            const logic = makeAbility();
            expect(logic.actions.has("perform")).toBe(true);
        });

        it("perform — warns and resolves null (not yet implemented)", async () => {
            const logic = makeAbility();
            const warn = vi.spyOn(sohl.log, "uiWarn");
            await expect(logic.perform({} as any)).resolves.toBeNull();
            expect(warn).toHaveBeenCalled();
        });

        it("constructs against a plain-object MysticalAbilityData (no Foundry)", () => {
            const logic = makeAbility();
            expect(logic).toBeInstanceOf(MysticalAbilityLogic);
            expect(logic.data.kind).toBe(ITEM_KIND.MYSTICALABILITY);
        });

        it("builds the intrinsic action map (postfinalize from the base class)", () => {
            const logic = makeAbility();
            expect(logic.actions.has("postfinalize")).toBe(true);
        });
    });

    describe("initialize", () => {
        it("seeds charges.value and charges.max from data.charges", () => {
            const logic = makeAbility({
                charges: { usesCharges: true, value: 3, max: 7 },
            });
            logic.initialize();
            expect(logic.charges.value).toBeInstanceOf(ValueModifier);
            expect(logic.charges.max).toBeInstanceOf(ValueModifier);
            expect(logic.charges.value.base).toBe(3);
            expect(logic.charges.value.effective).toBe(3);
            expect(logic.charges.max.base).toBe(7);
            expect(logic.charges.max.effective).toBe(7);
        });

        it("seeds level from levelBase", () => {
            const logic = makeAbility({ levelBase: 4 });
            logic.initialize();
            expect(logic.level).toBeInstanceOf(ValueModifier);
            expect(logic.level.base).toBe(4);
            expect(logic.level.effective).toBe(4);
            expect(logic.level.disabled).toBeFalsy();
        });

        it("does not disable level when levelBase is 0", () => {
            // The "levelBase > 0" disabled branch is dead code: initialize()
            // unconditionally re-assigns this.level from levelBase at the end,
            // overwriting the disabled modifier. This documents the behavior
            // as implemented.
            const logic = makeAbility({ levelBase: 0 });
            logic.initialize();
            expect(logic.level.disabled).toBeFalsy();
            expect(logic.level.base).toBe(0);
        });

        it("seeds masteryLevel from masteryLevelBase when there is no associated skill", () => {
            const logic = makeAbility({
                assocSkillCode: "",
                masteryLevelBase: 35,
            });
            logic.initialize();
            expect(logic.masteryLevel).toBeInstanceOf(ValueModifier);
            expect(logic.masteryLevel.base).toBe(35);
            expect(logic.masteryLevel.effective).toBe(35);
        });

        it("leaves masteryLevel empty when an associated skill is configured", () => {
            const logic = makeAbility({
                assocSkillCode: "spellcraft",
                masteryLevelBase: 35,
            });
            logic.initialize();
            // base is deferred until finalize() merges the skill's mastery level
            expect(logic.masteryLevel.hasBase).toBe(false);
            expect(logic.masteryLevel.base).toBe(0);
        });
    });

    describe("evaluate", () => {
        it("returns early when the item has no actor", () => {
            const logic = makeAbility({ assocSkillCode: "spellcraft" });
            logic.initialize();
            expect(() => logic.evaluate()).not.toThrow();
            expect(logic.assocSkill).toBeUndefined();
            expect(logic.assocMystery).toBeUndefined();
        });

        it("resolves assocSkill from the actor's skills by assocSkillCode", () => {
            const actor = makeAbilityActor();
            const skill = makeSkillOnActor(actor, "spellcraft");
            const logic = makeAbility(
                { assocSkillCode: "spellcraft" },
                { actor },
            );
            logic.initialize();
            logic.evaluate();
            expect(logic.assocSkill).toBe(skill);
        });

        it("resolves assocMystery from the actor's mysteries by assocMysteryCode", () => {
            const actor = makeAbilityActor();
            const mystery = makeMysteryStubOnActor(actor, "totem");
            const logic = makeAbility({ assocMysteryCode: "totem" }, { actor });
            logic.initialize();
            logic.evaluate();
            expect(logic.assocMystery).toBe(mystery);
        });

        it("leaves assocSkill/assocMystery undefined when no shortcode matches", () => {
            const actor = makeAbilityActor();
            makeSkillOnActor(actor, "spellcraft");
            makeMysteryStubOnActor(actor, "totem");
            const logic = makeAbility(
                { assocSkillCode: "missing", assocMysteryCode: "missing" },
                { actor },
            );
            logic.initialize();
            logic.evaluate();
            expect(logic.assocSkill).toBeUndefined();
            expect(logic.assocMystery).toBeUndefined();
        });
    });

    describe("finalize", () => {
        it("merges the associated skill's mastery level base into masteryLevel", () => {
            const actor = makeAbilityActor();
            const skill = makeSkillOnActor(actor, "spellcraft", 45);
            skill.initialize();
            const logic = makeAbility(
                { assocSkillCode: "spellcraft", masteryLevelBase: 0 },
                { actor },
            );
            logic.initialize();
            logic.evaluate();
            expect(logic.masteryLevel.hasBase).toBe(false);
            logic.finalize();
            expect(logic.masteryLevel.base).toBe(45);
            expect(logic.masteryLevel.effective).toBe(45);
        });

        it("keeps its own mastery level when there is no associated skill", () => {
            const logic = makeAbility({
                assocSkillCode: "",
                masteryLevelBase: 25,
            });
            logic.initialize();
            logic.evaluate();
            logic.finalize();
            expect(logic.masteryLevel.base).toBe(25);
        });
    });
});

describe("MysticalAbilityDataModel", () => {
    // The DataModel is Foundry-layer (implements MysticalAbilityData via
    // Foundry's schema system); its schema is exercised in Foundry
    // integration, not in unit tests.
    describe("defineSchema", () => {
        it.todo("includes SohlItemDataModel base schema fields");
        it.todo(
            "defines subType with MysticalAbilitySubTypes choices, required",
        );
        it.todo("defines assocSkillCode as StringField with empty initial");
        it.todo("defines assocMysteryCode as StringField with empty initial");
        it.todo("defines masteryLevelBase as integer NumberField with min 0");
        it.todo("defines improveFlag as BooleanField defaulting to false");
        it.todo("defines levelBase as integer NumberField with min 0");
        it.todo(
            "defines charges as SchemaField with usesCharges/value/max fields",
        );
    });

    it.todo("has kind set to ITEM_KIND.MYSTICALABILITY");
    it.todo("has correct LOCALIZATION_PREFIXES");
});
