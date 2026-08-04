import { describe, it, expect } from "vitest";
import {
    stripBirthsignBonus,
    BIRTHSIGN_RETIREMENT_MIGRATION,
} from "@src/entity/migration/birthsign-migration";
import { migrateDocumentSource } from "@src/entity/migration/MigrationRegistry";

const PLAN = [BIRTHSIGN_RETIREMENT_MIGRATION];

describe("stripBirthsignBonus", () => {
    it("leaves a formula with no bonus untouched", () => {
        expect(stripBirthsignBonus("sb(attr.str, attr.dex)")).toBe(
            "sb(attr.str, attr.dex)",
        );
    });

    it("strips a trailing `+ birthsignBonus(...)` term", () => {
        expect(
            stripBirthsignBonus(
                "sb(attr.str, attr.dex) + birthsignBonus(birthsigns, 'hirin', 2)",
            ),
        ).toBe("sb(attr.str, attr.dex)");
    });

    it("strips a leading `birthsignBonus(...) +` term", () => {
        expect(
            stripBirthsignBonus("birthsignBonus(birthsigns, 'hirin', 2) + sb(attr.str)"),
        ).toBe("sb(attr.str)");
    });

    it("strips multiple stacked bonus terms", () => {
        expect(
            stripBirthsignBonus(
                "sb(attr.str, attr.dex) + birthsignBonus(birthsigns, 'hirin', 2) + birthsignBonus(birthsigns, 'ahnu', 3)",
            ),
        ).toBe("sb(attr.str, attr.dex)");
    });

    it("strips a bonus nested as a max() argument, keeping the call valid", () => {
        expect(
            stripBirthsignBonus(
                "max(sb(attr.str), birthsignBonus(birthsigns, 'hirin', 2))",
            ),
        ).toBe("max(sb(attr.str))");
        expect(
            stripBirthsignBonus(
                "max(birthsignBonus(birthsigns, 'hirin', 2), sb(attr.str))",
            ),
        ).toBe("max(sb(attr.str))");
    });

    it("yields '0' when the whole formula was a bonus", () => {
        expect(stripBirthsignBonus("birthsignBonus(birthsigns, 'hirin', 2)")).toBe(
            "0",
        );
    });
});

describe("BIRTHSIGN_RETIREMENT_MIGRATION", () => {
    it("reclassifies a birthsign Mystery to the 'other' subtype", () => {
        const update = migrateDocumentSource(
            { type: "mystery", system: { subType: "birthsign", shortcode: "hirin" } },
            "Item",
            PLAN,
        );
        expect(update).toEqual({ "system.subType": "other" });
    });

    it("leaves a non-birthsign Mystery untouched", () => {
        const update = migrateDocumentSource(
            { type: "mystery", system: { subType: "fate" } },
            "Item",
            PLAN,
        );
        expect(update).toEqual({});
    });

    it("strips birthsignBonus from a skill's skillBaseFormula", () => {
        const update = migrateDocumentSource(
            {
                type: "skill",
                system: {
                    skillBaseFormula:
                        "sb(attr.str, attr.dex) + birthsignBonus(birthsigns, 'hirin', 2)",
                },
            },
            "Item",
            PLAN,
        );
        expect(update).toEqual({
            "system.skillBaseFormula": "sb(attr.str, attr.dex)",
        });
    });

    it("no-ops a skill whose formula has no birthsignBonus", () => {
        const update = migrateDocumentSource(
            { type: "skill", system: { skillBaseFormula: "sb(attr.str)" } },
            "Item",
            PLAN,
        );
        expect(update).toEqual({});
    });

    it("does not touch other document kinds", () => {
        expect(
            migrateDocumentSource(
                { type: "being", system: {} },
                "Actor",
                PLAN,
            ),
        ).toEqual({});
    });
});
