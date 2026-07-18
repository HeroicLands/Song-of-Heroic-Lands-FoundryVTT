import { describe, it, expect } from "vitest";
import { brandLogic } from "@tests/mocks/brandLogic";
import { BodyLocation } from "@src/entity/body/BodyLocation";

const SAMPLE_DATA: BodyLocation.Data = {
    shortcode: "skull",
    bleedingSusceptibility: "medium",
    amputability: "none",
    shockValue: 3,
    probWeight: 10,
    protectionBase: {
        blunt: 3,
        edged: 3,
        piercing: 3,
        fire: 0,
    },
};

const MOCK_PART = {
    updatePath: "system.structure.parts.1",
    structure: { corpusLogic: { actor: null } },
} as any;

// A Corpus-kinded owning logic (the parent every body entity requires).
const MOCK_CORPUS = brandLogic({ kind: "corpus", actor: null }) as any;

describe("BodyLocation", () => {
    describe("construction", () => {
        it("creates from data with all properties", () => {
            const loc = new BodyLocation(SAMPLE_DATA, {
                parent: MOCK_CORPUS,
                bodyPart: MOCK_PART,
                index: 0,
            });
            expect(loc.shortcode).toBe("skull");
            expect(loc.bleedingSusceptibility).toBe("medium");
            expect(loc.amputability).toBe("none");
            expect(loc.shockValue.effective).toBe(3);
            expect(loc.probWeight.effective).toBe(10);
            expect(loc.index).toBe(0);
        });
    });

    describe("updatePath", () => {
        it("builds dot-notation path from parent part and index", () => {
            const loc = new BodyLocation(SAMPLE_DATA, {
                parent: MOCK_CORPUS,
                bodyPart: MOCK_PART,
                index: 2,
            });
            expect(loc.updatePath).toBe("system.structure.parts.1.locations.2");
        });
    });
});
