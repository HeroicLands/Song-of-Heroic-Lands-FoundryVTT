import { describe, it, expect } from "vitest";
import { BodyLocation } from "@src/domain/body/BodyLocation";

const SAMPLE_DATA: BodyLocation.Data = {
    shortcode: "skull",
    isFumble: false,
    isStumble: false,
    bleedingSevThreshold: 4,
    amputateModifier: 0,
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
    updatePath: "system.bodyStructure.parts.1",
    bodyStructure: { beingLogic: { actor: null } },
} as any;

describe("BodyLocation", () => {
    describe("construction", () => {
        it("creates from data with all properties", () => {
            const loc = new BodyLocation(SAMPLE_DATA, MOCK_PART, 0);
            expect(loc.shortcode).toBe("skull");
            expect(loc.isFumble).toBe(false);
            expect(loc.isStumble).toBe(false);
            expect(loc.bleedingSevThreshold.effective).toBe(4);
            expect(loc.amputateModifier.effective).toBe(0);
            expect(loc.shockValue.effective).toBe(3);
            expect(loc.probWeight.effective).toBe(10);
            expect(loc.index).toBe(0);
        });
    });

    describe("updatePath", () => {
        it("builds dot-notation path from parent part and index", () => {
            const loc = new BodyLocation(SAMPLE_DATA, MOCK_PART, 2);
            expect(loc.updatePath).toBe(
                "system.bodyStructure.parts.1.locations.2",
            );
        });
    });
});
