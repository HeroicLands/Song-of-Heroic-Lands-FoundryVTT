import { describe, it, expect, vi, afterEach } from "vitest";
import { AffiliationLogic } from "@src/document/item/logic/AffiliationLogic";
import { ValueModifier } from "@src/entity/modifier/ValueModifier";
import {
    AFFILIATION_STANDING,
    AFFILIATION_SUBTYPE,
    AffiliationStandingChoices,
    AffiliationStandings,
    AffiliationSubTypeChoices,
    AffiliationSubTypes,
    ITEM_KIND,
    isAffiliationStanding,
    isAffiliationSubType,
} from "@src/utils/constants";
import { makeItemLogic } from "@tests/mocks/logicHarness";

/** Default AffiliationData fields; override per test. */
function affiliationFields(overrides: Record<string, unknown> = {}) {
    return {
        subType: AFFILIATION_SUBTYPE.SOCIAL,
        society: "Guild of Arcane Lore",
        office: "Archivist",
        title: "Keeper",
        level: 3,
        relation: {},
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

        it("builds the intrinsic action map (edit/delete from the base class)", () => {
            const logic = makeAffiliation();
            expect(logic.actions.has("editDocument")).toBe(true);
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

    describe("level", () => {
        it("seeds the level ValueModifier from data.level (#1000)", () => {
            const logic = makeAffiliation({ level: 4 });
            logic.initialize();
            expect(logic.level).toBeInstanceOf(ValueModifier);
            expect(logic.level.base).toBe(4);
            expect(logic.level.effective).toBe(4);
            // Rank is a non-nullable integer, so the modifier is always enabled
            // (it is an Active Effect target via `mod:logic.level`).
            expect(logic.level.disabled).toBeFalsy();
        });

        it("keeps rank 0 as a real, enabled level", () => {
            const logic = makeAffiliation({ level: 0 });
            logic.initialize();
            expect(logic.level.base).toBe(0);
            expect(logic.level.disabled).toBeFalsy();
        });
    });

    describe("subType (#1405)", () => {
        it("exposes the recorded kind of organization through data", () => {
            const logic = makeAffiliation({
                subType: AFFILIATION_SUBTYPE.DIVINE,
            });
            expect(logic.data.subType).toBe("divine");
        });

        it("accepts every declared subtype", () => {
            for (const subType of AffiliationSubTypes) {
                const logic = makeAffiliation({ subType });
                expect(logic.data.subType).toBe(subType);
            }
        });
    });

    describe("standingWith (#1404)", () => {
        it("returns the recorded standing for a listed shortcode", () => {
            const logic = makeAffiliation({
                relation: { peoni: AFFILIATION_STANDING.NEMESIS },
            });
            expect(logic.standingWith("peoni")).toBe("nemesis");
        });

        it("returns unaligned for a shortcode absent from the table", () => {
            const logic = makeAffiliation({
                relation: { peoni: AFFILIATION_STANDING.NEMESIS },
            });
            expect(logic.standingWith("larani")).toBe(
                AFFILIATION_STANDING.UNALIGNED,
            );
        });

        it("returns unaligned for every shortcode when the table is empty", () => {
            const logic = makeAffiliation({ relation: {} });
            expect(logic.standingWith("peoni")).toBe(
                AFFILIATION_STANDING.UNALIGNED,
            );
            expect(logic.standingWith("")).toBe(AFFILIATION_STANDING.UNALIGNED);
        });

        it("round-trips every standing value", () => {
            const relation = Object.fromEntries(
                AffiliationStandings.map((s, i) => [`aff${i}`, s]),
            );
            const logic = makeAffiliation({ relation });
            AffiliationStandings.forEach((standing, i) => {
                expect(logic.standingWith(`aff${i}`)).toBe(standing);
            });
        });

        it("does not confuse an inherited Object property with a recorded standing", () => {
            const logic = makeAffiliation({ relation: {} });
            // `toString` exists on Object.prototype; a naive lookup would return
            // the function rather than the neutral default.
            expect(logic.standingWith("toString")).toBe(
                AFFILIATION_STANDING.UNALIGNED,
            );
        });
    });

    describe("lifecycle", () => {
        it("initialize / evaluate / finalize run without error", () => {
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

describe("AFFILIATION_SUBTYPE (#1405)", () => {
    it("declares the four organizational kinds", () => {
        expect([...AffiliationSubTypes].sort()).toEqual([
            "arcane",
            "divine",
            "social",
            "spirit",
        ]);
    });

    it("guards its own values and rejects anything else", () => {
        for (const v of AffiliationSubTypes)
            expect(isAffiliationSubType(v)).toBe(true);
        expect(isAffiliationSubType("religious")).toBe(false);
        expect(isAffiliationSubType("")).toBe(false);
        expect(isAffiliationSubType(undefined)).toBe(false);
    });

    it("exposes choices as a value-keyed label map, never the values array", () => {
        // Foundry builds `<option value>` from Object.entries(choices); an array
        // would yield index values and the form update would be rejected.
        expect(Array.isArray(AffiliationSubTypeChoices)).toBe(false);
        expect(Object.keys(AffiliationSubTypeChoices).sort()).toEqual(
            [...AffiliationSubTypes].sort(),
        );
        expect(AffiliationSubTypeChoices.divine).toBe(
            "SOHL.Affiliation.SubType.divine",
        );
    });
});

describe("AFFILIATION_STANDING (#1404)", () => {
    it("declares the four standings, with unaligned as the neutral one", () => {
        expect([...AffiliationStandings].sort()).toEqual([
            "aligned",
            "nemesis",
            "rival",
            "unaligned",
        ]);
        expect(AFFILIATION_STANDING.UNALIGNED).toBe("unaligned");
    });

    it("guards its own values and rejects anything else", () => {
        for (const v of AffiliationStandings)
            expect(isAffiliationStanding(v)).toBe(true);
        expect(isAffiliationStanding("hostile")).toBe(false);
        expect(isAffiliationStanding("")).toBe(false);
    });

    it("exposes choices as a value-keyed label map, never the values array", () => {
        expect(Array.isArray(AffiliationStandingChoices)).toBe(false);
        expect(Object.keys(AffiliationStandingChoices).sort()).toEqual(
            [...AffiliationStandings].sort(),
        );
        expect(AffiliationStandingChoices.nemesis).toBe(
            "SOHL.Affiliation.Standing.nemesis",
        );
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
