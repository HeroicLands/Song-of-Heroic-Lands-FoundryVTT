import { describe, it, expect, vi, afterEach } from "vitest";
import { MysteryLogic } from "@src/document/item/logic/MysteryLogic";
import { SkillLogic } from "@src/document/item/logic/SkillLogic";
import { AffiliationLogic } from "@src/document/item/logic/AffiliationLogic";
import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { ITEM_KIND, MYSTERY_SUBTYPE } from "@src/utils/constants";
import {
    makeItemLogic,
    makeMockActor,
    makeAttributeStub,
} from "@tests/mocks/logicHarness";

/**
 * Build a mock actor exposing the `itemTypes.skill` / `itemTypes.affiliation`
 * lists that MysteryLogic.evaluate() reads for assocSkill / affiliation
 * resolution.
 */
function makeMysteryActor() {
    const actor = makeMockActor();
    actor.itemTypes = { skill: [] as any[], affiliation: [] as any[] };
    return actor;
}

/** Embed a real AffiliationLogic on the actor and register it in itemTypes. */
function makeAffiliationOnActor(
    actor: any,
    shortcode: string,
    name = "Church of Larani",
    level = 0,
) {
    const logic = makeItemLogic(
        AffiliationLogic,
        ITEM_KIND.AFFILIATION,
        { society: null, office: null, title: null, level },
        { actor, name, shortcode, id: `aff${shortcode}`.padEnd(16, "0") },
    );
    actor.itemTypes.affiliation.push(logic.item);
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
    // Run the skill's lifecycle so masteryLevelSeed / masteryLevel are populated
    // the way a Boon/Boost Mystery reads them during finalize.
    logic.initialize();
    logic.evaluate();
    actor.itemTypes.skill.push(logic.item);
    return logic;
}

/** Default MysteryData fields; override per test. */
function mysteryFields(overrides: Record<string, unknown> = {}) {
    return {
        levelBase: 0,
        charges: { usesCharges: false, value: 0, max: 0 },
        ...overrides,
    };
}

function makeMystery(
    overrides: Record<string, unknown> = {},
    opts: Record<string, unknown> = {},
) {
    return makeItemLogic(
        MysteryLogic,
        ITEM_KIND.MYSTERY,
        mysteryFields(overrides),
        opts,
    );
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe("MysteryLogic", () => {
    describe("construction", () => {
        it("constructs with its real intrinsic actions (useMystery is wired)", () => {
            const logic = makeMystery();
            expect(logic.actions.has("useMystery")).toBe(true);
        });

        it("useMystery — warns (not yet implemented)", async () => {
            const logic = makeMystery();
            const warn = vi.spyOn(sohl.log, "uiWarn");
            await expect(logic.useMystery({} as any)).resolves.toBeUndefined();
            expect(warn).toHaveBeenCalled();
        });

        it("constructs against a plain-object MysteryData (no Foundry)", () => {
            const logic = makeMystery();
            expect(logic).toBeInstanceOf(MysteryLogic);
            expect(logic.data.kind).toBe(ITEM_KIND.MYSTERY);
        });

        it("builds the intrinsic action map (edit/delete from the base class)", () => {
            const logic = makeMystery();
            expect(logic.actions.has("editDocument")).toBe(true);
        });
    });

    describe("initialize", () => {
        it("seeds level from levelBase", () => {
            const logic = makeMystery({ levelBase: 3 });
            logic.initialize();
            expect(logic.level).toBeInstanceOf(ValueModifier);
            expect(logic.level.base).toBe(3);
            expect(logic.level.effective).toBe(3);
            expect(logic.level.disabled).toBeFalsy();
        });

        it("seeds level even when levelBase is 0 (only null disables)", () => {
            const logic = makeMystery({ levelBase: 0 });
            logic.initialize();
            expect(logic.level.disabled).toBeFalsy();
            expect(logic.level.base).toBe(0);
        });

        it("disables level when levelBase is null", () => {
            const logic = makeMystery({ levelBase: null });
            logic.initialize();
            expect(logic.level.disabled).toBe("SOHL.Mystery.NoLevel");
            // a disabled modifier always reports an effective value of 0
            expect(logic.level.effective).toBe(0);
        });

        it("seeds charges.value and charges.max when charges.max is not null", () => {
            const logic = makeMystery({
                charges: { usesCharges: true, value: 2, max: 5 },
            });
            logic.initialize();
            expect(logic.charges.value).toBeInstanceOf(ValueModifier);
            expect(logic.charges.max).toBeInstanceOf(ValueModifier);
            expect(logic.charges.value.base).toBe(2);
            expect(logic.charges.value.effective).toBe(2);
            expect(logic.charges.max.base).toBe(5);
            expect(logic.charges.max.effective).toBe(5);
            expect(logic.charges.value.disabled).toBeFalsy();
            expect(logic.charges.max.disabled).toBeFalsy();
        });

        it("disables charges when charges.max is null", () => {
            const logic = makeMystery({
                charges: { usesCharges: false, value: 0, max: null },
            });
            logic.initialize();
            expect(logic.charges.value.disabled).toBe(
                "SOHL.Mystery.DoesNotUseCharges",
            );
            expect(logic.charges.max.disabled).toBe(
                "SOHL.Mystery.DoesNotUseCharges",
            );
        });

        it("gates charges on max !== null — the usesCharges flag is not consulted", () => {
            // Documents current behavior: data.charges.usesCharges is ignored
            // by initialize(); only a null max disables charge tracking.
            const logic = makeMystery({
                charges: { usesCharges: false, value: 1, max: 3 },
            });
            logic.initialize();
            expect(logic.charges.value.disabled).toBeFalsy();
            expect(logic.charges.value.base).toBe(1);
        });

        it("disables charges.value (infinite remaining) when value is null but max is set", () => {
            const logic = makeMystery({
                charges: { usesCharges: true, value: null, max: 5 },
            });
            logic.initialize();
            // max stays enabled; only value is disabled → sheet shows "∞".
            expect(logic.charges.max.disabled).toBeFalsy();
            expect(logic.charges.max.effective).toBe(5);
            expect(logic.charges.value.disabled).toBe(
                "SOHL.Mystery.InfiniteCharges",
            );
        });

        it("keeps charges.max enabled at 0 (infinite available)", () => {
            const logic = makeMystery({
                charges: { usesCharges: true, value: 3, max: 0 },
            });
            logic.initialize();
            // max effective 0 (not disabled) → sheet shows "<value>/∞".
            expect(logic.charges.max.disabled).toBeFalsy();
            expect(logic.charges.max.effective).toBe(0);
            expect(logic.charges.value.effective).toBe(3);
        });
    });

    describe("lifecycle", () => {
        it("evaluate / finalize - run without error after initialize", () => {
            const logic = makeMystery({ levelBase: 2 });
            logic.initialize();
            expect(() => {
                logic.evaluate();
                logic.finalize();
            }).not.toThrow();
        });
    });

    describe("evaluate (assocSkill resolution)", () => {
        it("resolves assocSkill from the actor's skills by assocSkillCode", () => {
            const actor = makeMysteryActor();
            const skill = makeSkillOnActor(actor, "blessing-skill");
            const logic = makeMystery(
                { assocSkillCode: "blessing-skill" },
                { actor },
            );
            logic.initialize();
            logic.evaluate();
            expect(logic.assocSkill).toBe(skill);
        });

        it("leaves assocSkill undefined when assocSkillCode is blank", () => {
            const actor = makeMysteryActor();
            makeSkillOnActor(actor, "blessing-skill");
            const logic = makeMystery({ assocSkillCode: "" }, { actor });
            logic.initialize();
            logic.evaluate();
            expect(logic.assocSkill).toBeUndefined();
        });

        it("returns early (assocSkill undefined) when the item has no actor", () => {
            const logic = makeMystery({ assocSkillCode: "blessing-skill" });
            logic.initialize();
            expect(() => logic.evaluate()).not.toThrow();
            expect(logic.assocSkill).toBeUndefined();
        });
    });

    // A Mystery can also name the faction/Affiliation whose standing it draws on
    // (a Piety or Grace pool conferred by a religion, an ancestor/totem/spirit),
    // stored independently of the associated skill as assocAffiliationCode and
    // resolved to an AffiliationLogic on the same actor (#1076).
    describe("affiliation", () => {
        it("resolves affiliation from the actor's affiliations by shortcode", () => {
            const actor = makeMysteryActor();
            const aff = makeAffiliationOnActor(actor, "larani");
            const logic = makeMystery(
                {
                    subType: MYSTERY_SUBTYPE.PIETY,
                    assocAffiliationCode: "larani",
                },
                { actor },
            );
            logic.initialize();
            logic.evaluate();
            expect(logic.affiliation).toBe(aff);
        });

        it("leaves affiliation undefined when no shortcode matches", () => {
            const actor = makeMysteryActor();
            makeAffiliationOnActor(actor, "larani");
            const logic = makeMystery(
                { assocAffiliationCode: "missing" },
                { actor },
            );
            logic.initialize();
            logic.evaluate();
            expect(logic.affiliation).toBeUndefined();
        });

        it("leaves affiliation undefined when the mystery has no actor", () => {
            const logic = makeMystery({ assocAffiliationCode: "larani" });
            logic.initialize();
            logic.evaluate();
            expect(logic.affiliation).toBeUndefined();
        });

        it("leaves affiliation undefined when the code is blank", () => {
            const actor = makeMysteryActor();
            makeAffiliationOnActor(actor, "larani");
            const logic = makeMystery(
                { assocAffiliationCode: null },
                { actor },
            );
            logic.initialize();
            logic.evaluate();
            expect(logic.affiliation).toBeUndefined();
        });
    });

    describe("finalize (Boon / Boost skill contribution)", () => {
        /** Run the mystery's full lifecycle. */
        function prepare(logic: MysteryLogic) {
            logic.initialize();
            logic.evaluate();
            logic.finalize();
        }

        it("Boon adds a flat +N delta to the associated skill's EML", () => {
            const actor = makeMysteryActor();
            const skill = makeSkillOnActor(actor, "sword", 50);
            const before = skill.masteryLevel.effective;
            const logic = makeMystery(
                {
                    subType: MYSTERY_SUBTYPE.BOON,
                    assocSkillCode: "sword",
                    levelBase: 5,
                },
                { actor },
            );
            prepare(logic);
            expect(skill.masteryLevel.effective).toBe(before + 5);
        });

        it("Boost adds the Mastery-Boost-table delta to the associated skill's EML", () => {
            // seed 52, N=3 → 52(+7)59(+7)66(+6)72 ⇒ +20 EML.
            const actor = makeMysteryActor();
            const skill = makeSkillOnActor(actor, "sword", 52);
            const before = skill.masteryLevel.effective;
            const logic = makeMystery(
                {
                    subType: MYSTERY_SUBTYPE.BOOST,
                    assocSkillCode: "sword",
                    levelBase: 3,
                },
                { actor },
            );
            prepare(logic);
            expect(skill.masteryLevel.effective).toBe(before + 20);
        });

        /**
         * Embed an unlearned skill (masteryLevelBase 0) whose SB derives from a
         * `str` attribute, so a Boost must open it at Skill Base rather than
         * boost off a zero seed. #981.
         */
        function makeUnlearnedSkillOnActor(actor: any, sb: number) {
            actor.items.set("str1", makeAttributeStub("str", sb));
            const skill = makeItemLogic(
                SkillLogic,
                ITEM_KIND.SKILL,
                {
                    subType: "social",
                    skillBaseFormula: "sb(attr.str)",
                    masteryLevelBase: 0,
                    improveFlag: false,
                    combatCategory: "none",
                    parentSkillCode: "",
                    initSkillMult: 1,
                },
                { actor, shortcode: "stealth", id: "skillstealth0000" },
            );
            skill.initialize();
            skill.evaluate();
            actor.itemTypes.skill.push(skill.item);
            return skill;
        }

        it("Boost on an unlearned (ML-0) skill opens it at Skill Base and compounds (#981)", () => {
            // SB 40, N=3 → open 40, then 40(+9)49(+8)57 ⇒ conferred EML 57.
            // (Contrast the present-skill path, which would boost off seed 0.)
            const actor = makeMysteryActor();
            const skill = makeUnlearnedSkillOnActor(actor, 40);
            expect(skill.masteryLevelSeed).toBe(0);
            expect(skill.skillBase).toBe(40);
            const logic = makeMystery(
                {
                    subType: MYSTERY_SUBTYPE.BOOST,
                    assocSkillCode: "stealth",
                    levelBase: 3,
                },
                { actor },
            );
            prepare(logic);
            expect(skill.masteryLevel.effective).toBe(57);
        });

        it("Boost N=1 on an unlearned skill confers it at exactly Skill Base (#981)", () => {
            // N=1 spends its only boost opening the skill: EML = SB, no compounding.
            const actor = makeMysteryActor();
            const skill = makeUnlearnedSkillOnActor(actor, 40);
            const logic = makeMystery(
                {
                    subType: MYSTERY_SUBTYPE.BOOST,
                    assocSkillCode: "stealth",
                    levelBase: 1,
                },
                { actor },
            );
            prepare(logic);
            expect(skill.masteryLevel.effective).toBe(40);
        });

        it("contributes nothing when the mystery has no level (disabled)", () => {
            const actor = makeMysteryActor();
            const skill = makeSkillOnActor(actor, "sword", 50);
            const before = skill.masteryLevel.effective;
            const logic = makeMystery(
                {
                    subType: MYSTERY_SUBTYPE.BOON,
                    assocSkillCode: "sword",
                    levelBase: null,
                },
                { actor },
            );
            prepare(logic);
            expect(skill.masteryLevel.effective).toBe(before);
        });

        it("contributes nothing when the level is 0", () => {
            const actor = makeMysteryActor();
            const skill = makeSkillOnActor(actor, "sword", 50);
            const before = skill.masteryLevel.effective;
            const logic = makeMystery(
                {
                    subType: MYSTERY_SUBTYPE.BOOST,
                    assocSkillCode: "sword",
                    levelBase: 0,
                },
                { actor },
            );
            prepare(logic);
            expect(skill.masteryLevel.effective).toBe(before);
        });

        it("contributes nothing when no associated skill resolves", () => {
            const actor = makeMysteryActor();
            makeSkillOnActor(actor, "sword", 50);
            const logic = makeMystery(
                {
                    subType: MYSTERY_SUBTYPE.BOON,
                    assocSkillCode: "missing",
                    levelBase: 5,
                },
                { actor },
            );
            expect(() => prepare(logic)).not.toThrow();
            expect(logic.assocSkill).toBeUndefined();
        });

        it("a non-skill-affecting subtype (grace) contributes no delta", () => {
            const actor = makeMysteryActor();
            const skill = makeSkillOnActor(actor, "sword", 50);
            const before = skill.masteryLevel.effective;
            const logic = makeMystery(
                {
                    subType: MYSTERY_SUBTYPE.GRACE,
                    assocSkillCode: "sword",
                    levelBase: 5,
                },
                { actor },
            );
            prepare(logic);
            expect(skill.masteryLevel.effective).toBe(before);
        });
    });

    /*
     * The behaviors below are not present in the current MysteryLogic —
     * MysteryData no longer carries skills machinery, and no
     * fieldData/getApplicableFate/fateBonusItems helpers exist on the class.
     * The todos are retained until that functionality is (re)implemented.
     */
    describe("fieldData", () => {
        it.todo("returns formatted skill list for SKILL category");
        it.todo("returns 'SOHL.AllSkills' when no specific skills are listed");
    });

    describe("getApplicableFate", () => {
        it.todo("returns empty array when subType is not FATE");
        it.todo("returns item when target name is in skills list");
        it.todo("returns item when skills list is empty (applies to all)");
        it.todo("returns empty array when level.effective is 0 or less");
    });

    describe("_usesCharges", () => {
        it.todo(
            "returns true for FATE, FATEBONUS, FATEPOINTBONUS, GRACE, PIETY subtypes",
        );
        it.todo("returns false for other subtypes");
    });

    describe("_usesLevels", () => {
        it.todo(
            "returns true for ANCESTORSPIRITPOWER and TOTEMSPIRITPOWER subtypes",
        );
        it.todo("returns false for other subtypes");
    });

    describe("fateBonusItems", () => {
        it.todo("returns empty array when item has no name");
        it.todo("returns empty array when actor has no items");
        it.todo("returns matching FATEBONUS mystery items from actor");
    });

    describe("evaluate (skill resolution)", () => {
        it.todo(
            "resolves skills from actor items matching data.skills shortcodes",
        );
        it.todo("returns early when actor is null");
    });
});

describe("MysteryDataModel", () => {
    // The DataModel is Foundry-layer (implements MysteryData via Foundry's
    // schema system); its schema is exercised in Foundry integration, not
    // in unit tests.
    describe("defineSchema", () => {
        it.todo("includes SohlItemDataModel base schema fields");
        it.todo("defines subType with MysterySubTypes choices");
        it.todo("defines skills as ArrayField of StringFields");
        it.todo(
            "defines levelBase as nullable integer NumberField, initial null, min 0",
        );
        it.todo(
            "defines charges.value as nullable integer NumberField, initial null, min 0",
        );
        it.todo(
            "defines charges.max as nullable integer NumberField, initial null, min 0",
        );
    });

    it.todo("has kind set to ITEM_KIND.MYSTERY");
    it.todo("has correct LOCALIZATION_PREFIXES");
});
