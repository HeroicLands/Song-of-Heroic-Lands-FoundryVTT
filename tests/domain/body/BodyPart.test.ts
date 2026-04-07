import { describe, it, expect } from "vitest";
import { BodyPart } from "@src/domain/body/BodyPart";

const SAMPLE_DATA: BodyPart.Data = {
    shortcode: "larm",
    affectedSkillCodes: [],
    affectedAttributeCodes: [],
    affectsMobility: false,
    canHoldItem: true,
    heldItemId: null,
    probWeight: 20,
    locations: [
        {
            shortcode: "ularm",
            isFumble: true,
            isStumble: false,
            bleedingSevThreshold: 3,
            amputateModifier: -10,
            shockValue: 2,
            probWeight: 15,
            protectionBase: { blunt: 1, edged: 0, piercing: 0, fire: 0 },
        },
        {
            shortcode: "lhand",
            isFumble: true,
            isStumble: false,
            bleedingSevThreshold: 2,
            amputateModifier: -5,
            shockValue: 1,
            probWeight: 5,
            protectionBase: { blunt: 0, edged: 0, piercing: 0, fire: 0 },
        },
    ],
};

// Minimal mock: beingLogic with a null actor (no item resolution)
const MOCK_BODY_STRUCTURE = {
    beingLogic: { actor: null },
} as any;

describe("BodyPart", () => {
    describe("construction", () => {
        it("creates from data with all properties", () => {
            const part = new BodyPart(SAMPLE_DATA, MOCK_BODY_STRUCTURE, 0);
            expect(part.shortcode).toBe("larm");
            expect(part.affectsMobility).toBe(false);
            expect(part.canHoldItem).toBe(true);
            expect(part.heldItem).toBeNull();
            expect(part.probWeight.effective).toBe(20);
            expect(part.index).toBe(0);
        });

        it("constructs BodyLocation instances for each location", () => {
            const part = new BodyPart(SAMPLE_DATA, MOCK_BODY_STRUCTURE, 0);
            expect(part.locations).toHaveLength(2);
            expect(part.locations[0].shortcode).toBe("ularm");
            expect(part.locations[1].shortcode).toBe("lhand");
        });

        it("assigns sequential indices to locations", () => {
            const part = new BodyPart(SAMPLE_DATA, MOCK_BODY_STRUCTURE, 0);
            expect(part.locations[0].index).toBe(0);
            expect(part.locations[1].index).toBe(1);
        });
    });

    describe("updatePath", () => {
        it("builds dot-notation path from index", () => {
            const part = new BodyPart(SAMPLE_DATA, MOCK_BODY_STRUCTURE, 3);
            expect(part.updatePath).toBe("system.bodyStructure.parts.3");
        });
    });

    describe("getLocation", () => {
        it("finds a location by name", () => {
            const part = new BodyPart(SAMPLE_DATA, MOCK_BODY_STRUCTURE, 0);
            const loc = part.getLocationByCode("lhand");
            expect(loc).toBeDefined();
            expect(loc!.shortcode).toBe("lhand");
        });

        it("returns undefined for unknown name", () => {
            const part = new BodyPart(SAMPLE_DATA, MOCK_BODY_STRUCTURE, 0);
            expect(part.getLocationByCode("nonexistent")).toBeUndefined();
        });
    });

    describe("getRandomLocation", () => {
        it("returns a location from this part", () => {
            const part = new BodyPart(SAMPLE_DATA, MOCK_BODY_STRUCTURE, 0);
            const loc = part.getRandomLocation();
            expect(part.locations).toContain(loc);
        });

        it("respects probability weights", () => {
            const part = new BodyPart(SAMPLE_DATA, MOCK_BODY_STRUCTURE, 0);
            // Upper Left Arm has weight 15, Left Hand has weight 5
            const counts: Record<string, number> = {};
            for (let i = 0; i < 1000; i++) {
                const loc = part.getRandomLocation();
                counts[loc.shortcode] = (counts[loc.shortcode] ?? 0) + 1;
            }
            expect(counts["ularm"]).toBeGreaterThan(counts["lhand"]);
        });
    });
});
