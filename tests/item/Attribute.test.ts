import { describe, it, expect, vi, afterEach } from "vitest";
import { AttributeLogic } from "@src/document/item/logic/AttributeLogic";
import { ValueModifier } from "@src/domain/modifier/ValueModifier";
import { MasteryLevelModifier } from "@src/domain/modifier/MasteryLevelModifier";
import { ITEM_KIND } from "@src/utils/constants";
import { makeItemLogic } from "@tests/mocks/logicHarness";

/** Default AttributeData fields; override per test. */
function attributeFields(overrides: Record<string, unknown> = {}) {
    return {
        scoreBase: 10,
        valueDesc: [] as { label: string; maxValue: number }[],
        initDiceFormula: "3d6",
        impairedByRoles: [] as string[],
        ...overrides,
    };
}

function makeAttribute(
    overrides: Record<string, unknown> = {},
    opts: Record<string, unknown> = {},
) {
    return makeItemLogic(
        AttributeLogic,
        ITEM_KIND.ATTRIBUTE,
        attributeFields(overrides),
        { name: "Strength", ...opts },
    );
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe("AttributeLogic", () => {
    describe("construction", () => {
        it("constructs against a plain-object AttributeData (no Foundry)", () => {
            const logic = makeAttribute();
            expect(logic).toBeInstanceOf(AttributeLogic);
            expect(logic.data.kind).toBe(ITEM_KIND.ATTRIBUTE);
        });

        it("builds the intrinsic action map (postfinalize from the base class)", () => {
            const logic = makeAttribute();
            expect(logic.actions.has("postfinalize")).toBe(true);
        });
    });

    describe("initialize", () => {
        it("seeds score from scoreBase as a ValueModifier", () => {
            const logic = makeAttribute({ scoreBase: 14 });
            logic.initialize();
            expect(logic.score).toBeInstanceOf(ValueModifier);
            expect(logic.score.base).toBe(14);
            expect(logic.score.effective).toBe(14);
            expect(logic.score.disabled).toBeFalsy();
        });

        it("creates masteryLevel as a MasteryLevelModifier with no base yet", () => {
            const logic = makeAttribute();
            logic.initialize();
            expect(logic.masteryLevel).toBeInstanceOf(MasteryLevelModifier);
            // Base is only seeded in finalize (score.effective * 5)
            expect(logic.masteryLevel.hasBase).toBe(false);
            expect(logic.masteryLevel.base).toBe(0);
        });
    });

    describe("evaluate", () => {
        it("runs without error after initialize", () => {
            const logic = makeAttribute();
            logic.initialize();
            expect(() => logic.evaluate()).not.toThrow();
        });
    });

    describe("finalize", () => {
        it("seeds masteryLevel at five times the effective score", () => {
            const logic = makeAttribute({ scoreBase: 12 });
            logic.initialize();
            logic.evaluate();
            logic.finalize();
            expect(logic.masteryLevel.base).toBe(60);
            expect(logic.masteryLevel.effective).toBe(60);
        });

        it("uses the EFFECTIVE score (including deltas), not the base", () => {
            const logic = makeAttribute({ scoreBase: 10 });
            logic.initialize();
            // An effect layered onto the score during evaluate
            logic.score.add("Magic Boost", "Boost", 2);
            logic.evaluate();
            logic.finalize();
            expect(logic.score.effective).toBe(12);
            expect(logic.masteryLevel.base).toBe(60);
        });

        it("seeds masteryLevel at 0 when the score is disabled", () => {
            const logic = makeAttribute({ scoreBase: 10 });
            logic.initialize();
            logic.score.setDisabled("not usable");
            logic.evaluate();
            logic.finalize();
            expect(logic.masteryLevel.base).toBe(0);
        });
    });

    describe("array update helpers", () => {
        it("addValueDescUpdate - appends an entry to the canonical list", () => {
            const logic = makeAttribute({
                valueDesc: [{ label: "Weak", maxValue: 5 }],
            });
            const payload = logic.addValueDescUpdate({
                label: "Average",
                maxValue: 10,
            });
            expect(payload).toEqual({
                "system.valueDesc": [
                    { label: "Weak", maxValue: 5 },
                    { label: "Average", maxValue: 10 },
                ],
            });
            // canonical data is not mutated — payload is for item.update()
            expect(logic.data.valueDesc).toHaveLength(1);
        });

        it("removeValueDescUpdate - filters the entry by label", () => {
            const logic = makeAttribute({
                valueDesc: [
                    { label: "Weak", maxValue: 5 },
                    { label: "Average", maxValue: 10 },
                ],
            });
            expect(logic.removeValueDescUpdate("Weak")).toEqual({
                "system.valueDesc": [{ label: "Average", maxValue: 10 }],
            });
        });

        it("removeValueDescUpdate - leaves the list unchanged for an unknown label", () => {
            const logic = makeAttribute({
                valueDesc: [{ label: "Weak", maxValue: 5 }],
            });
            expect(logic.removeValueDescUpdate("Nope")).toEqual({
                "system.valueDesc": [{ label: "Weak", maxValue: 5 }],
            });
        });
    });
});

describe("AttributeDataModel", () => {
    // The DataModel is Foundry-layer (implements AttributeData via Foundry's
    // schema system); its schema is exercised in Foundry integration, not
    // in unit tests.
    describe("defineSchema", () => {
        it.todo("includes SohlItemDataModel base schema fields");
        it.todo("defines scoreBase as integer NumberField with min 0");
        it.todo("defines valueDesc as ArrayField of {label, maxValue} schemas");
        it.todo("defines initDiceFormula as a StringField");
        it.todo("defines impairedByRoles as ArrayField of StringField");
    });

    it.todo("has kind set to ITEM_KIND.ATTRIBUTE");
    it.todo("has correct LOCALIZATION_PREFIXES including Attribute and Item");
});
