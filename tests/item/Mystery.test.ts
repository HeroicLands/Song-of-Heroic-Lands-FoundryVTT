import { describe, it, expect, vi, afterEach } from "vitest";
import { MysteryLogic } from "@src/document/item/logic/MysteryLogic";
import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import { ITEM_KIND } from "@src/utils/constants";
import { makeItemLogic } from "@tests/mocks/logicHarness";

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

        it("builds the intrinsic action map (postfinalize from the base class)", () => {
            const logic = makeMystery();
            expect(logic.actions.has("postfinalize")).toBe(true);
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
            expect(logic.level.disabled).toBe(
                "This mystery doesn't have a level",
            );
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
                "This mystery doesn't use charges",
            );
            expect(logic.charges.max.disabled).toBe(
                "This mystery doesn't use charges",
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

    /*
     * The behaviors below are not present in the current MysteryLogic —
     * MysteryData no longer carries domain/skills/subType machinery, and no
     * fieldData/getApplicableFate/fateBonusItems helpers exist on the class.
     * The todos are retained until that functionality is (re)implemented.
     */
    describe("properties", () => {
        it.todo("domain - is undefined initially, resolved during evaluate");
        it.todo(
            "skills - is empty array after initialize, resolved during evaluate",
        );
    });

    describe("fieldData", () => {
        it.todo("returns domain name for DIVINE category");
        it.todo("returns formatted skill list for SKILL category");
        it.todo("returns 'SOHL.AllSkills' when no specific skills are listed");
        it.todo("returns domain name for CREATURE category");
        it.todo("returns unknown domain string for unknown category");
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

    describe("evaluate (domain/skill resolution)", () => {
        it.todo(
            "resolves domain from SohlDomains registry by domainCode shortcode",
        );
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
        it.todo("defines domainCode as optional StringField");
        it.todo("defines skills as ArrayField of StringFields");
        it.todo("defines levelBase as integer NumberField with min 0");
        it.todo(
            "defines charges.value as integer NumberField with min -1, initial -1",
        );
        it.todo(
            "defines charges.max as integer NumberField with min -1, initial -1",
        );
    });

    it.todo("has kind set to ITEM_KIND.MYSTERY");
    it.todo("has correct LOCALIZATION_PREFIXES");
});
