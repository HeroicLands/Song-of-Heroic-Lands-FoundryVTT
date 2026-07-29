import { describe, it, expect } from "vitest";
import { brandLogic } from "@tests/mocks/brandLogic";
import { BodyLocation } from "@src/entity/body/BodyLocation";
import { locationData, makeBody } from "@tests/mocks/bodyFixture";

const SAMPLE_DATA: BodyLocation.Data = locationData("skull", "head", 10, {
    bleedingSusceptibility: "medium",
    shockValue: 3,
    protectionBase: { blunt: 3, edged: 3, piercing: 3, fire: 0 },
});

const MOCK_PART = {
    updatePath: "system.body.structure.parts.1",
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
        it("addresses the flat locations array by index (#780)", () => {
            const loc = new BodyLocation(SAMPLE_DATA, {
                parent: MOCK_CORPUS,
                bodyPart: MOCK_PART,
                index: 2,
            });
            expect(loc.updatePath).toBe("system.body.structure.locations.2");
        });
    });

    describe("position", () => {
        it("is the slot within its part, while index is the flat slot", () => {
            // The sample body's third location ("chest") is the first and only
            // location of the "thorax" part.
            const chest = makeBody().getLocationByCode("chest")!;
            expect(chest.index).toBe(2);
            expect(chest.position).toBe(0);

            const face = makeBody().getLocationByCode("face")!;
            expect(face.index).toBe(1);
            expect(face.position).toBe(1);
        });
    });
});
