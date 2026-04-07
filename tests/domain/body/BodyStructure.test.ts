import { describe, it, expect } from "vitest";
import { BodyStructure } from "@src/domain/body/BodyStructure";

const SKULL_LOC = {
    name: "Skull",
    isFumble: false,
    isStumble: false,
    bleedingSevThreshold: 4,
    amputateModifier: 0,
    shockValue: 3,
    probWeight: 10,
    protectionBase: { blunt: 3, edged: 3, piercing: 3, fire: 0 },
};

const FACE_LOC = {
    name: "Face",
    isFumble: false,
    isStumble: false,
    bleedingSevThreshold: 2,
    amputateModifier: 0,
    shockValue: 2,
    probWeight: 5,
    protectionBase: { blunt: 0, edged: 0, piercing: 0, fire: 0 },
};

const CHEST_LOC = {
    name: "Chest",
    isFumble: false,
    isStumble: false,
    bleedingSevThreshold: 5,
    amputateModifier: 0,
    shockValue: 4,
    probWeight: 20,
    protectionBase: { blunt: 2, edged: 1, piercing: 1, fire: 0 },
};

const SAMPLE_DATA: BodyStructure.Data = {
    parts: [
        {
            name: "Head",
            affectedSkillCodes: [],
            affectedAttributeCodes: ["int", "aur"],
            affectsMobility: false,
            canHoldItem: false,
            heldItemId: null,
            probWeight: 15,
            locations: [SKULL_LOC, FACE_LOC],
        },
        {
            name: "Thorax",
            affectedSkillCodes: [],
            affectedAttributeCodes: ["sta"],
            affectsMobility: false,
            canHoldItem: false,
            heldItemId: null,
            probWeight: 30,
            locations: [CHEST_LOC],
        },
    ],
    adjacent: [
        ["Head", "Thorax"],
    ],
};

describe("BodyStructure", () => {
    describe("construction", () => {
        it("creates BodyPart instances from data", () => {
            const body = new BodyStructure(SAMPLE_DATA);
            expect(body.parts).toHaveLength(2);
            expect(body.parts[0].name).toBe("Head");
            expect(body.parts[1].name).toBe("Thorax");
        });

        it("preserves adjacency matrix", () => {
            const body = new BodyStructure(SAMPLE_DATA);
            expect(body.adjacent).toEqual([["Head", "Thorax"]]);
        });
    });

    describe("getPart", () => {
        it("finds a part by name", () => {
            const body = new BodyStructure(SAMPLE_DATA);
            const part = body.getPart("Thorax");
            expect(part).toBeDefined();
            expect(part!.name).toBe("Thorax");
        });

        it("returns undefined for unknown name", () => {
            const body = new BodyStructure(SAMPLE_DATA);
            expect(body.getPart("Wings")).toBeUndefined();
        });
    });

    describe("getAdjacentParts", () => {
        it("returns parts adjacent to the given part", () => {
            const body = new BodyStructure(SAMPLE_DATA);
            const adj = body.getAdjacentParts("Head");
            expect(adj.map((p) => p.name)).toContain("Thorax");
        });

        it("returns empty array for part with no adjacency", () => {
            const body = new BodyStructure({
                parts: SAMPLE_DATA.parts,
                adjacent: [],
            });
            expect(body.getAdjacentParts("Head")).toEqual([]);
        });
    });

    describe("getAllLocations", () => {
        it("returns all locations from all parts", () => {
            const body = new BodyStructure(SAMPLE_DATA);
            const locs = body.getAllLocations();
            expect(locs).toHaveLength(3);
            expect(locs.map((l) => l.name)).toEqual(
                expect.arrayContaining(["Skull", "Face", "Chest"]),
            );
        });
    });

    describe("getRandomPart", () => {
        it("returns a part from the structure", () => {
            const body = new BodyStructure(SAMPLE_DATA);
            const part = body.getRandomPart();
            expect(body.parts).toContain(part);
        });
    });

    describe("getRandomLocation", () => {
        it("returns a location from the structure", () => {
            const body = new BodyStructure(SAMPLE_DATA);
            const loc = body.getRandomLocation();
            const allNames = body.getAllLocations().map((l) => l.name);
            expect(allNames).toContain(loc.name);
        });
    });

    describe("toJSON", () => {
        it("round-trips through serialization", () => {
            const body = new BodyStructure(SAMPLE_DATA);
            const json = body.toJSON();
            expect(json.parts).toHaveLength(2);
            expect(json.adjacent).toEqual([["Head", "Thorax"]]);
        });
    });
});
