import { describe, it, expect } from "vitest";
import { BodyPart } from "@src/domain/body/BodyPart";

const SAMPLE_DATA: BodyPart.Data = {
    name: "Left Arm",
    affectedSkillCodes: ["cmb"],
    affectedAttributeCodes: ["str", "dex"],
    affectsMobility: false,
    canHoldItem: true,
    heldItemId: null,
    probWeight: 20,
    locations: [
        {
            name: "Upper Left Arm",
            isFumble: true,
            isStumble: false,
            bleedingSevThreshold: 3,
            amputateModifier: -10,
            shockValue: 2,
            probWeight: 15,
            protectionBase: { blunt: 1, edged: 0, piercing: 0, fire: 0 },
        },
        {
            name: "Left Hand",
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

describe("BodyPart", () => {
    describe("construction", () => {
        it("creates from data with all properties", () => {
            const part = new BodyPart(SAMPLE_DATA);
            expect(part.name).toBe("Left Arm");
            expect(part.affectedSkillCodes).toEqual(["cmb"]);
            expect(part.affectedAttributeCodes).toEqual(["str", "dex"]);
            expect(part.affectsMobility).toBe(false);
            expect(part.canHoldItem).toBe(true);
            expect(part.heldItemId).toBeNull();
            expect(part.probWeight).toBe(20);
        });

        it("constructs BodyLocation instances for each location", () => {
            const part = new BodyPart(SAMPLE_DATA);
            expect(part.locations).toHaveLength(2);
            expect(part.locations[0].name).toBe("Upper Left Arm");
            expect(part.locations[1].name).toBe("Left Hand");
        });
    });

    describe("getLocation", () => {
        it("finds a location by name", () => {
            const part = new BodyPart(SAMPLE_DATA);
            const loc = part.getLocation("Left Hand");
            expect(loc).toBeDefined();
            expect(loc!.name).toBe("Left Hand");
        });

        it("returns undefined for unknown name", () => {
            const part = new BodyPart(SAMPLE_DATA);
            expect(part.getLocation("Nonexistent")).toBeUndefined();
        });
    });

    describe("getRandomLocation", () => {
        it("returns a location from this part", () => {
            const part = new BodyPart(SAMPLE_DATA);
            const loc = part.getRandomLocation();
            expect(part.locations).toContain(loc);
        });

        it("respects probability weights", () => {
            const part = new BodyPart(SAMPLE_DATA);
            // Upper Left Arm has weight 15, Left Hand has weight 5
            // Over many rolls, Upper Left Arm should appear ~75% of the time
            const counts: Record<string, number> = {};
            for (let i = 0; i < 1000; i++) {
                const loc = part.getRandomLocation();
                counts[loc.name] = (counts[loc.name] ?? 0) + 1;
            }
            // Rough check: Upper Left Arm should be significantly more common
            expect(counts["Upper Left Arm"]).toBeGreaterThan(counts["Left Hand"]);
        });
    });

    describe("toJSON", () => {
        it("round-trips through serialization", () => {
            const part = new BodyPart(SAMPLE_DATA);
            const json = part.toJSON();
            expect(json.name).toBe("Left Arm");
            expect(json.locations).toHaveLength(2);
            expect(json.locations[0].name).toBe("Upper Left Arm");
        });
    });
});
