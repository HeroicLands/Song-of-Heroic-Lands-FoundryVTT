import { describe, it, expect } from "vitest";
import { TraitLogic } from "@src/document/item/logic/TraitLogic";
import { ITEM_KIND } from "@src/utils/constants";
import { makeItemLogic } from "@tests/mocks/logicHarness";

/** Default TraitData fields; override per test. */
function traitFields(overrides: Record<string, unknown> = {}) {
    return {
        subType: "measured",
        textValue: "",
        score: { value: 12, max: null },
        intensity: "trait",
        valueDesc: [] as { label: string; maxValue: number }[],
        choices: {},
        ...overrides,
    };
}

function makeTrait(overrides: Record<string, unknown> = {}) {
    return makeItemLogic(TraitLogic, ITEM_KIND.TRAIT, traitFields(overrides));
}

describe("TraitLogic", () => {
    describe("construction", () => {
        it("constructs against a plain-object TraitData (no Foundry)", () => {
            const logic = makeTrait();
            expect(logic).toBeInstanceOf(TraitLogic);
            expect(logic.data.kind).toBe(ITEM_KIND.TRAIT);
        });

        it("builds the intrinsic action map (edit/delete from the base class)", () => {
            const logic = makeTrait();
            expect(logic.actions.has("editDocument")).toBe(true);
        });
    });

    describe("lifecycle", () => {
        it("initialize - seeds score from score.value for a measured trait", () => {
            const logic = makeTrait({ score: { value: 14, max: null } });
            logic.initialize();
            expect(logic.score.base).toBe(14);
            expect(logic.score.effective).toBe(14);
            expect(logic.score.disabled).toBeFalsy();
        });

        it("initialize - defaults score base to 0 when score is absent", () => {
            const logic = makeTrait({ score: undefined });
            logic.initialize();
            expect(logic.score.base).toBe(0);
        });

        it("initialize - disables score for a descriptive trait", () => {
            const logic = makeTrait({
                subType: "physique",
                textValue: "hirin-ahnu",
                score: undefined,
            });
            logic.initialize();
            expect(logic.score.disabled).toBeTruthy();
        });

        it("evaluate / finalize - run without error after initialize", () => {
            const logic = makeTrait();
            logic.initialize();
            expect(() => {
                logic.evaluate();
                logic.finalize();
            }).not.toThrow();
        });
    });

    describe("array update helpers", () => {
        it("addValueDescUpdate - appends an entry to the canonical list", () => {
            const logic = makeTrait({
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
            const logic = makeTrait({
                valueDesc: [
                    { label: "Weak", maxValue: 5 },
                    { label: "Average", maxValue: 10 },
                ],
            });
            const payload = logic.removeValueDescUpdate("Weak");
            expect(payload).toEqual({
                "system.valueDesc": [{ label: "Average", maxValue: 10 }],
            });
        });

        it("removeValueDescUpdate - leaves the list unchanged for an unknown label", () => {
            const logic = makeTrait({
                valueDesc: [{ label: "Weak", maxValue: 5 }],
            });
            const payload = logic.removeValueDescUpdate("Nope");
            expect(payload).toEqual({
                "system.valueDesc": [{ label: "Weak", maxValue: 5 }],
            });
        });
    });
});

describe("TraitDataModel", () => {
    // The DataModel is Foundry-layer (implements TraitData via Foundry's
    // schema system); its schema is exercised in Foundry integration, not
    // in unit tests.
    describe("defineSchema", () => {
        it.todo("includes MasteryLevelDataModel base schema fields");
        it.todo(
            "defines subType with TraitSubTypes choices defaulting to PHYSIQUE",
        );
        it.todo("defines textValue as a StringField");
        it.todo("defines max as a nullable integer NumberField");
        it.todo(
            "defines intensity with TraitIntensities choices defaulting to TRAIT",
        );
        it.todo("defines valueDesc as ArrayField of {label, maxValue} schemas");
        it.todo("defines choices as ObjectField");
        it.todo("defines diceFormula as a StringField");
    });

    it.todo("has kind set to ITEM_KIND.TRAIT");
    it.todo(
        "has correct LOCALIZATION_PREFIXES including Trait, MasteryLevel, and Item",
    );
});
