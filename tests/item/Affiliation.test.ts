import { describe, it, expect, vi, afterEach } from "vitest";
import { AffiliationLogic } from "@src/document/item/logic/AffiliationLogic";
import { ITEM_KIND } from "@src/utils/constants";
import { makeItemLogic } from "@tests/mocks/logicHarness";

/** Default AffiliationData fields; override per test. */
function affiliationFields(overrides: Record<string, unknown> = {}) {
    return {
        society: "Guild of Arcane Lore",
        office: "Archivist",
        title: "Keeper",
        level: 3,
        ...overrides,
    };
}

function makeAffiliation(
    overrides: Record<string, unknown> = {},
    opts: Record<string, unknown> = {},
) {
    return makeItemLogic(
        AffiliationLogic,
        ITEM_KIND.AFFILIATION,
        affiliationFields(overrides),
        { name: "Test Affiliation", ...opts },
    );
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe("AffiliationLogic", () => {
    describe("construction", () => {
        it("constructs against a plain-object AffiliationData (no Foundry)", () => {
            const logic = makeAffiliation();
            expect(logic).toBeInstanceOf(AffiliationLogic);
            expect(logic.data.kind).toBe(ITEM_KIND.AFFILIATION);
        });

        it("builds the intrinsic action map (postfinalize from the base class)", () => {
            const logic = makeAffiliation();
            expect(logic.actions.has("postfinalize")).toBe(true);
        });

        it("exposes the identity record fields through data", () => {
            const logic = makeAffiliation({
                society: "House Corvath",
                office: "Captain",
                title: "Sir",
                level: 5,
            });
            expect(logic.data.society).toBe("House Corvath");
            expect(logic.data.office).toBe("Captain");
            expect(logic.data.title).toBe("Sir");
            expect(logic.data.level).toBe(5);
        });
    });

    describe("lifecycle", () => {
        it("initialize / evaluate / finalize run without error (no derived state)", () => {
            const logic = makeAffiliation();
            expect(() => {
                logic.initialize();
                logic.evaluate();
                logic.finalize();
            }).not.toThrow();
        });

        it("lifecycle leaves the persisted data untouched", () => {
            const logic = makeAffiliation();
            logic.initialize();
            logic.evaluate();
            logic.finalize();
            expect(logic.data.society).toBe("Guild of Arcane Lore");
            expect(logic.data.office).toBe("Archivist");
            expect(logic.data.title).toBe("Keeper");
            expect(logic.data.level).toBe(3);
            expect(logic.item.update).not.toHaveBeenCalled();
        });
    });
});

describe("AffiliationDataModel", () => {
    describe("defineSchema", () => {
        it.todo("includes SohlItemDataModel base schema fields");
        it.todo("defines society as a StringField");
        it.todo("defines office as a StringField");
        it.todo("defines title as a StringField");
        it.todo(
            "defines level as a NumberField with integer constraint and min 0",
        );
    });

    it.todo("has kind set to ITEM_KIND.AFFILIATION");
    it.todo("has correct LOCALIZATION_PREFIXES");
});
