import { describe, it, expect } from "vitest";
import { BodyLocation } from "@src/domain/body/BodyLocation";

const SAMPLE_DATA: BodyLocation.Data = {
    name: "Skull",
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

describe("BodyLocation", () => {
    describe("construction", () => {
        it("creates from data with all properties", () => {
            const loc = new BodyLocation(SAMPLE_DATA);
            expect(loc.name).toBe("Skull");
            expect(loc.isFumble).toBe(false);
            expect(loc.isStumble).toBe(false);
            expect(loc.bleedingSevThreshold).toBe(4);
            expect(loc.amputateModifier).toBe(0);
            expect(loc.shockValue).toBe(3);
            expect(loc.probWeight).toBe(10);
        });
    });

    describe("getProtection", () => {
        it("returns base protection for each aspect", () => {
            const loc = new BodyLocation(SAMPLE_DATA);
            expect(loc.getProtection("blunt")).toBe(3);
            expect(loc.getProtection("edged")).toBe(3);
            expect(loc.getProtection("piercing")).toBe(3);
            expect(loc.getProtection("fire")).toBe(0);
        });

        it("returns 0 for unknown aspect", () => {
            const loc = new BodyLocation(SAMPLE_DATA);
            expect(loc.getProtection("unknown" as any)).toBe(0);
        });
    });

    describe("toJSON", () => {
        it("round-trips through serialization", () => {
            const loc = new BodyLocation(SAMPLE_DATA);
            const json = loc.toJSON();
            expect(json.name).toBe("Skull");
            expect(json.protectionBase.blunt).toBe(3);
        });
    });
});
