import { describe, it, expect, vi, afterEach } from "vitest";
import { MysticalAbilityLogic } from "@src/document/item/logic/MysticalAbilityLogic";
import { SkillLogic } from "@src/document/item/logic/SkillLogic";
import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { MasteryLevelModifier } from "@src/entity/modifier/MasteryLevelModifier";
import { ITEM_KIND, VALUE_DELTA_INFO } from "@src/utils/constants";
import { makeItemLogic, makeMockActor } from "@tests/mocks/logicHarness";

/** Default MysticalAbilityData fields; override per test. */
function abilityFields(overrides: Record<string, unknown> = {}) {
    return {
        subType: "arcaneincantation",
        assocSkillCode: "",
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
    actor.itemTypes = {
        skill: [] as any[],
        mystery: [] as any[],
        mysticalability: [] as any[],
    };
    return actor;
}

/**
 * Embed a real MysticalAbilityLogic on the actor (default subType SPIRITPOWER)
 * and register it in itemTypes, so a spirit-power subtype can resolve it by
 * shortcode. Returns the initialized logic.
 */
function makeAbilityOnActor(
    actor: any,
    shortcode: string,
    masteryLevelBase = 40,
    subType = "spiritpower",
) {
    const logic = makeItemLogic(
        MysticalAbilityLogic,
        ITEM_KIND.MYSTICALABILITY,
        abilityFields({ subType, assocSkillCode: "", masteryLevelBase }),
        { actor, shortcode, id: `sp${shortcode}`.padEnd(16, "0") },
    );
    logic.initialize();
    actor.itemTypes.mysticalability.push(logic.item);
    return logic;
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

afterEach(() => {
    vi.restoreAllMocks();
});

describe("MysticalAbilityLogic", () => {
    describe("construction", () => {
        it("constructs with its real intrinsic actions (successTest is wired, not the retired perform stub)", () => {
            const logic = makeAbility();
            expect(logic.actions.has("successTest")).toBe(true);
            expect(logic.actions.has("perform")).toBe(false);
        });

        it("successTest — delegates to masteryLevel.successTest (same seam as a skill)", async () => {
            const logic = makeAbility();
            logic.initialize();
            const result = { isSuccess: true } as any;
            const spy = vi
                .spyOn(logic.masteryLevel, "successTest")
                .mockResolvedValue(result);
            const ctx = { scope: {} } as any;
            await expect(logic.successTest(ctx)).resolves.toBe(result);
            expect(spy).toHaveBeenCalledWith(ctx);
        });

        it("constructs against a plain-object MysticalAbilityData (no Foundry)", () => {
            const logic = makeAbility();
            expect(logic).toBeInstanceOf(MysticalAbilityLogic);
            expect(logic.data.kind).toBe(ITEM_KIND.MYSTICALABILITY);
        });

        it("builds the intrinsic action map (edit/delete from the base class)", () => {
            const logic = makeAbility();
            expect(logic.actions.has("editDocument")).toBe(true);
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
            expect(logic.charges.value.disabled).toBeFalsy();
            expect(logic.charges.max.disabled).toBeFalsy();
        });

        it("disables charges when charges.max is null", () => {
            const logic = makeAbility({
                charges: { usesCharges: false, value: 0, max: null },
            });
            logic.initialize();
            expect(logic.charges.value.disabled).toBe(
                "SOHL.MysticalAbility.DoesNotUseCharges",
            );
            expect(logic.charges.max.disabled).toBe(
                "SOHL.MysticalAbility.DoesNotUseCharges",
            );
        });

        it("disables charges.value (infinite remaining) when value is null but max is set", () => {
            const logic = makeAbility({
                charges: { usesCharges: true, value: null, max: 5 },
            });
            logic.initialize();
            expect(logic.charges.max.disabled).toBeFalsy();
            expect(logic.charges.max.effective).toBe(5);
            expect(logic.charges.value.disabled).toBe(
                "SOHL.MysticalAbility.InfiniteCharges",
            );
        });

        it("keeps charges.max enabled at 0 (infinite available)", () => {
            const logic = makeAbility({
                charges: { usesCharges: true, value: 3, max: 0 },
            });
            logic.initialize();
            expect(logic.charges.max.disabled).toBeFalsy();
            expect(logic.charges.max.effective).toBe(0);
            expect(logic.charges.value.effective).toBe(3);
        });

        it("seeds level from levelBase", () => {
            const logic = makeAbility({ levelBase: 4 });
            logic.initialize();
            expect(logic.level).toBeInstanceOf(ValueModifier);
            expect(logic.level.base).toBe(4);
            expect(logic.level.effective).toBe(4);
            expect(logic.level.disabled).toBeFalsy();
        });

        it("seeds level even when levelBase is 0 (only null disables)", () => {
            const logic = makeAbility({ levelBase: 0 });
            logic.initialize();
            expect(logic.level.disabled).toBeFalsy();
            expect(logic.level.base).toBe(0);
        });

        it("disables level when levelBase is null", () => {
            const logic = makeAbility({ levelBase: null });
            logic.initialize();
            expect(logic.level.disabled).toBe("SOHL.MysticalAbility.NoLevel");
            expect(logic.level.effective).toBe(0);
        });

        it("seeds masteryLevel (a MasteryLevelModifier) from masteryLevelBase when there is no associated skill", () => {
            const logic = makeAbility({
                assocSkillCode: "",
                masteryLevelBase: 35,
            });
            logic.initialize();
            expect(logic.masteryLevel).toBeInstanceOf(MasteryLevelModifier);
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

        it("leaves assocSkill undefined when no shortcode matches", () => {
            const actor = makeAbilityActor();
            makeSkillOnActor(actor, "spellcraft");
            const logic = makeAbility({ assocSkillCode: "missing" }, { actor });
            logic.initialize();
            logic.evaluate();
            expect(logic.assocSkill).toBeUndefined();
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

        it("stacks the ability's own modifiers on top of the merged skill mastery level (addVM, not replace)", () => {
            const actor = makeAbilityActor();
            const skill = makeSkillOnActor(actor, "spellcraft", 45);
            skill.initialize();
            const logic = makeAbility(
                { assocSkillCode: "spellcraft", masteryLevelBase: 0 },
                { actor },
            );
            logic.initialize();
            logic.evaluate();
            // A custom modifier added before the skill merge must survive it.
            logic.masteryLevel.add(VALUE_DELTA_INFO.PLAYER, 10);
            logic.finalize();
            // 45 (skill ML base, copied via addVM) + 10 (ability's own delta).
            expect(logic.masteryLevel.effective).toBe(55);
        });
    });

    describe("level-based casting penalty (incantations)", () => {
        it("arcane incantation subtracts Level x 2 from its EML", () => {
            const logic = makeAbility({
                subType: "arcaneincantation",
                assocSkillCode: "",
                masteryLevelBase: 30,
                levelBase: 3,
            });
            logic.initialize();
            logic.evaluate();
            // 30 - (3 x 2) = 24
            expect(logic.masteryLevel.effective).toBe(24);
            expect(logic.masteryLevel.has("LvlPen")).toBe(true);
        });

        it("divine incantation subtracts Level x 2 from its EML", () => {
            const logic = makeAbility({
                subType: "divineincantation",
                assocSkillCode: "",
                masteryLevelBase: 40,
                levelBase: 2,
            });
            logic.initialize();
            logic.evaluate();
            // 40 - (2 x 2) = 36
            expect(logic.masteryLevel.effective).toBe(36);
        });

        it("stacks the penalty on top of the merged skill EML", () => {
            const actor = makeAbilityActor();
            const skill = makeSkillOnActor(actor, "pyrethos", 45);
            skill.initialize();
            const logic = makeAbility(
                {
                    subType: "arcaneincantation",
                    assocSkillCode: "pyrethos",
                    masteryLevelBase: 0,
                    levelBase: 2,
                },
                { actor },
            );
            logic.initialize();
            logic.evaluate();
            logic.finalize();
            // 45 (merged skill ML) - (2 x 2) = 41; penalty survives addVM.
            expect(logic.masteryLevel.effective).toBe(41);
            expect(logic.masteryLevel.has("LvlPen")).toBe(true);
        });

        it("reads the level's effective value at evaluate (after an AE on level)", () => {
            const logic = makeAbility({
                subType: "arcaneincantation",
                assocSkillCode: "",
                masteryLevelBase: 30,
                levelBase: 2,
            });
            logic.initialize();
            // Simulate an Active Effect raising the level from 2 to 3 (applied
            // between initialize and evaluate).
            logic.level.add("SOHL.INFO.ActiveEffect", "AE", 1);
            logic.evaluate();
            // Penalty uses the effective level (3), not the base (2): 30 - 6.
            expect(logic.masteryLevel.effective).toBe(24);
        });

        it("adds no penalty for a non-incantation subtype", () => {
            const logic = makeAbility({
                subType: "arcanetalent",
                assocSkillCode: "",
                masteryLevelBase: 30,
                levelBase: 3,
            });
            logic.initialize();
            logic.evaluate();
            expect(logic.masteryLevel.effective).toBe(30);
            expect(logic.masteryLevel.has("LvlPen")).toBe(false);
        });

        it("adds no penalty at level 0", () => {
            const logic = makeAbility({
                subType: "arcaneincantation",
                assocSkillCode: "",
                masteryLevelBase: 30,
                levelBase: 0,
            });
            logic.initialize();
            logic.evaluate();
            expect(logic.masteryLevel.effective).toBe(30);
            expect(logic.masteryLevel.has("LvlPen")).toBe(false);
        });

        it("adds no penalty when the ability has no level (levelBase null)", () => {
            const logic = makeAbility({
                subType: "arcaneincantation",
                assocSkillCode: "",
                masteryLevelBase: 30,
                levelBase: null,
            });
            logic.initialize();
            logic.evaluate();
            expect(logic.masteryLevel.effective).toBe(30);
            expect(logic.masteryLevel.has("LvlPen")).toBe(false);
        });
    });

    describe("isExhausted (#990)", () => {
        it("is true when the ability uses finite charges and none remain", () => {
            const logic = makeAbility({
                charges: { usesCharges: true, value: 0, max: 5 },
            });
            logic.initialize();
            expect(logic.isExhausted).toBe(true);
        });

        it("is false while finite charges remain", () => {
            const logic = makeAbility({
                charges: { usesCharges: true, value: 2, max: 5 },
            });
            logic.initialize();
            expect(logic.isExhausted).toBe(false);
        });

        it("is false when remaining charges are infinite (value null)", () => {
            const logic = makeAbility({
                charges: { usesCharges: true, value: null, max: 5 },
            });
            logic.initialize();
            expect(logic.isExhausted).toBe(false);
        });

        it("is false when the ability does not use charges (max null)", () => {
            const logic = makeAbility({
                charges: { usesCharges: false, value: 0, max: null },
            });
            logic.initialize();
            expect(logic.isExhausted).toBe(false);
        });
    });

    describe("successTest — charge consumption (#990)", () => {
        const realResult = { isSuccess: true } as any;

        // resultValue is passed explicitly (never via a defaulted parameter —
        // passing `undefined` to a default would substitute the default value).
        function armedAbility(
            charges: Record<string, unknown>,
            resultValue: unknown,
        ) {
            const logic = makeAbility({ charges });
            logic.initialize();
            const spy = vi
                .spyOn(logic.masteryLevel, "successTest")
                .mockResolvedValue(resultValue as any);
            return { logic, spy };
        }

        it("decrements the persisted charge count by 1 after a completed roll", async () => {
            const { logic } = armedAbility(
                { usesCharges: true, value: 3, max: 5 },
                realResult,
            );
            await logic.successTest({ scope: {} } as any);
            expect(logic.item.update).toHaveBeenCalledWith({
                "system.charges.value": 2,
            });
        });

        it("does not decrement when the roll is cancelled (undefined result)", async () => {
            const { logic } = armedAbility(
                { usesCharges: true, value: 3, max: 5 },
                undefined,
            );
            await logic.successTest({ scope: {} } as any);
            expect(logic.item.update).not.toHaveBeenCalled();
        });

        it("does not decrement when the roll errors (false result)", async () => {
            const { logic } = armedAbility(
                { usesCharges: true, value: 3, max: 5 },
                false,
            );
            await logic.successTest({ scope: {} } as any);
            expect(logic.item.update).not.toHaveBeenCalled();
        });

        it("does not decrement when charges are infinite (value null)", async () => {
            const { logic } = armedAbility(
                { usesCharges: true, value: null, max: 5 },
                realResult,
            );
            await logic.successTest({ scope: {} } as any);
            expect(logic.item.update).not.toHaveBeenCalled();
        });

        it("does not decrement when the ability has no maximum cap (max 0, shown as infinity)", async () => {
            const { logic } = armedAbility(
                { usesCharges: true, value: 0, max: 0 },
                realResult,
            );
            await logic.successTest({ scope: {} } as any);
            expect(logic.item.update).not.toHaveBeenCalled();
        });

        it("does not decrement when the ability does not use charges (max null)", async () => {
            const { logic } = armedAbility(
                { usesCharges: false, value: 0, max: null },
                realResult,
            );
            await logic.successTest({ scope: {} } as any);
            expect(logic.item.update).not.toHaveBeenCalled();
        });

        it("blocks the roll entirely when the ability is exhausted (0 charges)", async () => {
            const { logic, spy } = armedAbility(
                { usesCharges: true, value: 0, max: 5 },
                realResult,
            );
            const result = await logic.successTest({ scope: {} } as any);
            expect(result).toBeUndefined();
            expect(spy).not.toHaveBeenCalled();
            expect(logic.item.update).not.toHaveBeenCalled();
        });
    });

    describe("spirit-power association (#990)", () => {
        it("usesSpiritPower is true only for shamanicrite/spiritaction", () => {
            expect(
                makeAbility({ subType: "shamanicrite" }).usesSpiritPower,
            ).toBe(true);
            expect(
                makeAbility({ subType: "spiritaction" }).usesSpiritPower,
            ).toBe(true);
            expect(
                makeAbility({ subType: "spiritpower" }).usesSpiritPower,
            ).toBe(false);
            expect(
                makeAbility({ subType: "ritualaction" }).usesSpiritPower,
            ).toBe(false);
        });

        it("resolves the Spirit Power, is enabled, and merges its mastery level", () => {
            const actor = makeAbilityActor();
            const sp = makeAbilityOnActor(actor, "totem", 40);
            const logic = makeAbility(
                {
                    subType: "shamanicrite",
                    assocSkillCode: "totem",
                    masteryLevelBase: 0,
                },
                { actor },
            );
            logic.initialize();
            logic.evaluate();
            expect(logic.assocSpiritPower).toBe(sp);
            expect(logic.hasValidSpiritPower).toBe(true);
            expect(logic.isDisabled).toBe(false);
            expect(logic.assocRef).toBe(sp);
            logic.finalize();
            expect(logic.masteryLevel.effective).toBe(40);
        });

        it("is disabled when no Spirit Power resolves", () => {
            const actor = makeAbilityActor();
            const logic = makeAbility(
                { subType: "shamanicrite", assocSkillCode: "missing" },
                { actor },
            );
            logic.initialize();
            logic.evaluate();
            expect(logic.assocSpiritPower).toBeUndefined();
            expect(logic.hasValidSpiritPower).toBe(false);
            expect(logic.isDisabled).toBe(true);
        });

        it("is disabled when the reference is not a SPIRITPOWER ability", () => {
            const actor = makeAbilityActor();
            makeAbilityOnActor(actor, "wrongtype", 40, "alchemy");
            const logic = makeAbility(
                { subType: "shamanicrite", assocSkillCode: "wrongtype" },
                { actor },
            );
            logic.initialize();
            logic.evaluate();
            expect(logic.assocSpiritPower).toBeDefined();
            expect(logic.hasValidSpiritPower).toBe(false);
            expect(logic.isDisabled).toBe(true);
        });

        it("does not merge a mastery level when the Spirit Power is invalid", () => {
            const actor = makeAbilityActor();
            makeAbilityOnActor(actor, "wrongtype", 40, "alchemy");
            const logic = makeAbility(
                {
                    subType: "shamanicrite",
                    assocSkillCode: "wrongtype",
                    masteryLevelBase: 0,
                },
                { actor },
            );
            logic.initialize();
            logic.evaluate();
            logic.finalize();
            expect(logic.masteryLevel.hasBase).toBe(false);
        });

        it("successTest refuses (no roll) when the Spirit Power is invalid", async () => {
            const actor = makeAbilityActor();
            const logic = makeAbility(
                { subType: "shamanicrite", assocSkillCode: "missing" },
                { actor },
            );
            logic.initialize();
            logic.evaluate();
            const spy = vi
                .spyOn(logic.masteryLevel, "successTest")
                .mockResolvedValue({ isSuccess: true } as any);
            const result = await logic.successTest({ scope: {} } as any);
            expect(result).toBeUndefined();
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe("ritual action skill merge (#990)", () => {
        it("merges its ritual skill's mastery level when the skill has one", () => {
            const actor = makeAbilityActor();
            const skill = makeSkillOnActor(actor, "ritefire", 40);
            skill.initialize();
            const logic = makeAbility(
                {
                    subType: "ritualaction",
                    assocSkillCode: "ritefire",
                    masteryLevelBase: 0,
                },
                { actor },
            );
            logic.initialize();
            logic.evaluate();
            logic.finalize();
            expect(logic.masteryLevel.effective).toBe(40);
        });

        it("does not merge a disabled ritual-skill mastery level", () => {
            const actor = makeAbilityActor();
            const skill = makeSkillOnActor(actor, "ritefire", 40);
            skill.initialize();
            skill.masteryLevel.setDisabled("SOHL.Test.Disabled");
            const logic = makeAbility(
                {
                    subType: "ritualaction",
                    assocSkillCode: "ritefire",
                    masteryLevelBase: 0,
                },
                { actor },
            );
            logic.initialize();
            logic.evaluate();
            logic.finalize();
            expect(logic.masteryLevel.hasBase).toBe(false);
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
