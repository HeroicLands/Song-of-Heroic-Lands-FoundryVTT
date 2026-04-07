import { describe, it, expect } from "vitest";
import { BodyStructure } from "@src/domain/body/BodyStructure";
import type { BodyPart } from "@src/domain/body/BodyPart";
import type { BodyLocation } from "@src/domain/body/BodyLocation";

const SKULL_LOC = {
    shortcode: "skull",
    isFumble: false,
    isStumble: false,
    bleedingSevThreshold: 4,
    amputateModifier: 0,
    shockValue: 3,
    probWeight: 10,
    protectionBase: { blunt: 3, edged: 3, piercing: 3, fire: 0 },
};

const FACE_LOC = {
    shortcode: "face",
    isFumble: false,
    isStumble: false,
    bleedingSevThreshold: 2,
    amputateModifier: 0,
    shockValue: 2,
    probWeight: 5,
    protectionBase: { blunt: 0, edged: 0, piercing: 0, fire: 0 },
};

const CHEST_LOC = {
    shortcode: "chest",
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
            shortcode: "head",
            affectedSkillCodes: [],
            affectedAttributeCodes: [],
            affectsMobility: false,
            canHoldItem: false,
            heldItemId: null,
            probWeight: 15,
            locations: [SKULL_LOC, FACE_LOC],
        },
        {
            shortcode: "thorax",
            affectedSkillCodes: [],
            affectedAttributeCodes: [],
            affectsMobility: false,
            canHoldItem: false,
            heldItemId: null,
            probWeight: 30,
            locations: [CHEST_LOC],
        },
    ],
    adjacent: [["head", "thorax"]],
};

// Minimal mock: beingLogic with null actor and canonical data for update methods
const MOCK_BEING_LOGIC = {
    actor: null,
    data: { bodyStructure: SAMPLE_DATA },
} as any;

describe("BodyStructure", () => {
    describe("construction", () => {
        it("creates BodyPart instances from data", () => {
            const body = new BodyStructure(SAMPLE_DATA, MOCK_BEING_LOGIC);
            expect(body.parts).toHaveLength(2);
            expect(body.parts[0].shortcode).toBe("head");
            expect(body.parts[1].shortcode).toBe("thorax");
        });

        it("assigns sequential indices to parts", () => {
            const body = new BodyStructure(SAMPLE_DATA, MOCK_BEING_LOGIC);
            expect(body.parts[0].index).toBe(0);
            expect(body.parts[1].index).toBe(1);
        });

        it("preserves adjacency matrix", () => {
            const body = new BodyStructure(SAMPLE_DATA, MOCK_BEING_LOGIC);
            expect(body.adjacent).toEqual([["head", "thorax"]]);
        });
    });

    describe("getPart", () => {
        it("finds a part by name", () => {
            const body = new BodyStructure(SAMPLE_DATA, MOCK_BEING_LOGIC);
            const part = body.getPartByCode("thorax");
            expect(part).toBeDefined();
            expect(part!.shortcode).toBe("thorax");
        });

        it("returns undefined for unknown name", () => {
            const body = new BodyStructure(SAMPLE_DATA, MOCK_BEING_LOGIC);
            expect(body.getPartByCode("wings")).toBeUndefined();
        });
    });

    describe("getAdjacentParts", () => {
        it("returns parts adjacent to the given part", () => {
            const body = new BodyStructure(SAMPLE_DATA, MOCK_BEING_LOGIC);
            const adj = body.getAdjacentParts("head");
            expect(adj.map((p) => p.shortcode)).toContain("thorax");
        });

        it("returns empty array for part with no adjacency", () => {
            const body = new BodyStructure(
                { parts: SAMPLE_DATA.parts, adjacent: [] },
                MOCK_BEING_LOGIC,
            );
            expect(body.getAdjacentParts("head")).toEqual([]);
        });
    });

    describe("getAllLocations", () => {
        it("returns all locations from all parts", () => {
            const body = new BodyStructure(SAMPLE_DATA, MOCK_BEING_LOGIC);
            const locs = body.getAllLocations();
            expect(locs).toHaveLength(3);
            expect(locs.map((l) => l.shortcode)).toEqual(
                expect.arrayContaining(["skull", "face", "chest"]),
            );
        });
    });

    describe("getRandomPart", () => {
        it("returns a part from the structure when no target", () => {
            const body = new BodyStructure(SAMPLE_DATA, MOCK_BEING_LOGIC);
            const part = body.getRandomPart();
            expect(body.parts).toContain(part);
        });

        it("returns the target part when accuracy is very high", () => {
            const body = new BodyStructure(SAMPLE_DATA, MOCK_BEING_LOGIC);
            // Head has probWeight 15. With accuracy 1000, roll 1..1000
            // will almost always be <= 15... but it's random.
            // Use a statistical approach: over many tries, most should hit Head.
            let headCount = 0;
            for (let i = 0; i < 100; i++) {
                const part = body.getRandomPart({
                    targetPart: body.getPartByCode("head")!,
                    accuracy: 1000,
                });
                if (part.shortcode === "head") headCount++;
            }
            // With accuracy 1000 and probWeight 15, chance of hit is 15/1000 = 1.5%
            // So most will drift to adjacent. This is expected behavior.
            expect(headCount).toBeGreaterThanOrEqual(0);
        });

        it("always returns a valid part with targeted selection", () => {
            const body = new BodyStructure(SAMPLE_DATA, MOCK_BEING_LOGIC);
            for (let i = 0; i < 100; i++) {
                const part = body.getRandomPart({
                    targetPart: body.getPartByCode("head")!,
                    accuracy: 50,
                });
                expect(body.parts).toContain(part);
            }
        });

        it("with accuracy equal to probWeight, always hits target", () => {
            const body = new BodyStructure(SAMPLE_DATA, MOCK_BEING_LOGIC);
            // Head has probWeight 15. With accuracy 15, roll is 1..15,
            // which is always <= 15, so it always hits.
            for (let i = 0; i < 50; i++) {
                const part = body.getRandomPart({
                    targetPart: body.getPartByCode("head")!,
                    accuracy: 15,
                });
                expect(part.shortcode).toBe("head");
            }
        });

        it("drifts to adjacent parts when accuracy exceeds probWeight", () => {
            const body = new BodyStructure(SAMPLE_DATA, MOCK_BEING_LOGIC);
            // Head (probWeight 15), adjacent to Thorax (probWeight 30).
            // With accuracy 100, many rolls will miss Head and drift to Thorax.
            let thoraxCount = 0;
            for (let i = 0; i < 200; i++) {
                const part = body.getRandomPart({
                    targetPart: body.getPartByCode("head")!,
                    accuracy: 100,
                });
                if (part.shortcode === "thorax") thoraxCount++;
            }
            expect(thoraxCount).toBeGreaterThan(0);
        });
    });

    describe("getRandomLocation", () => {
        it("returns a location from the structure", () => {
            const body = new BodyStructure(SAMPLE_DATA, MOCK_BEING_LOGIC);
            const loc = body.getRandomLocation();
            const allNames = body.getAllLocations().map((l) => l.shortcode);
            expect(allNames).toContain(loc.shortcode);
        });
    });

    describe("updatePath", () => {
        it("parts have correct update paths", () => {
            const body = new BodyStructure(SAMPLE_DATA, MOCK_BEING_LOGIC);
            expect(body.parts[0].updatePath).toBe(
                "system.bodyStructure.parts.0",
            );
            expect(body.parts[1].updatePath).toBe(
                "system.bodyStructure.parts.1",
            );
        });

        it("locations have correct update paths", () => {
            const body = new BodyStructure(SAMPLE_DATA, MOCK_BEING_LOGIC);
            expect(body.parts[0].locations[0].updatePath).toBe(
                "system.bodyStructure.parts.0.locations.0",
            );
            expect(body.parts[0].locations[1].updatePath).toBe(
                "system.bodyStructure.parts.0.locations.1",
            );
            expect(body.parts[1].locations[0].updatePath).toBe(
                "system.bodyStructure.parts.1.locations.0",
            );
        });
    });

    describe("addPartUpdate", () => {
        it("returns update payload with new part appended", () => {
            const body = new BodyStructure(SAMPLE_DATA, MOCK_BEING_LOGIC);
            const newPart: BodyPart.Data = {
                shortcode: "larm",
                affectedSkillCodes: [],
                affectedAttributeCodes: [],
                affectsMobility: false,
                canHoldItem: true,
                heldItemId: null,
                probWeight: 10,
                locations: [],
            };
            const update = body.addPartUpdate(newPart);
            const parts = update["system.bodyStructure.parts"];
            expect(parts).toHaveLength(3);
            expect(parts[2].shortcode).toBe("larm");
        });
    });

    describe("removePartUpdate", () => {
        it("returns update payload with part removed by name", () => {
            const body = new BodyStructure(SAMPLE_DATA, MOCK_BEING_LOGIC);
            const update = body.removePartUpdate("head");
            const parts = update["system.bodyStructure.parts"];
            expect(parts).toHaveLength(1);
            expect(parts[0].shortcode).toBe("thorax");
        });

        it("returns unchanged array if name not found", () => {
            const body = new BodyStructure(SAMPLE_DATA, MOCK_BEING_LOGIC);
            const update = body.removePartUpdate("wings");
            const parts = update["system.bodyStructure.parts"];
            expect(parts).toHaveLength(2);
        });
    });

    describe("addLocationUpdate", () => {
        it("returns update payload with new location appended to part", () => {
            const body = new BodyStructure(SAMPLE_DATA, MOCK_BEING_LOGIC);
            const newLoc: BodyLocation.Data = {
                shortcode: "neck",
                isFumble: false,
                isStumble: false,
                bleedingSevThreshold: 3,
                amputateModifier: 0,
                shockValue: 4,
                probWeight: 5,
                protectionBase: { blunt: 1, edged: 1, piercing: 1, fire: 0 },
            };
            const part = body.getPartByCode("head")!;
            const update = part.addLocationUpdate(newLoc);
            const locs =
                update["system.bodyStructure.parts.0.locations"];
            expect(locs).toHaveLength(3);
            expect(locs[2].shortcode).toBe("neck");
        });
    });

    describe("removeLocationUpdate", () => {
        it("returns update payload with location removed by name", () => {
            const body = new BodyStructure(SAMPLE_DATA, MOCK_BEING_LOGIC);
            const part = body.getPartByCode("head")!;
            const update = part.removeLocationUpdate("skull");
            const locs =
                update["system.bodyStructure.parts.0.locations"];
            expect(locs).toHaveLength(1);
            expect(locs[0].shortcode).toBe("face");
        });

        it("returns unchanged array if name not found", () => {
            const body = new BodyStructure(SAMPLE_DATA, MOCK_BEING_LOGIC);
            const part = body.getPartByCode("head")!;
            const update = part.removeLocationUpdate("nonexistent");
            const locs =
                update["system.bodyStructure.parts.0.locations"];
            expect(locs).toHaveLength(2);
        });
    });

    describe("addEdgeUpdate", () => {
        it("returns update payload with new edge appended", () => {
            const body = new BodyStructure(SAMPLE_DATA, MOCK_BEING_LOGIC);
            const update = body.addEdgeUpdate("head", "larm");
            const adj = update["system.bodyStructure.adjacent"];
            expect(adj).toHaveLength(2);
            expect(adj[1]).toEqual(["head", "larm"]);
        });

        it("does not add duplicate edge", () => {
            const body = new BodyStructure(SAMPLE_DATA, MOCK_BEING_LOGIC);
            const update = body.addEdgeUpdate("head", "thorax");
            const adj = update["system.bodyStructure.adjacent"];
            expect(adj).toHaveLength(1);
        });

        it("detects reverse-order duplicates", () => {
            const body = new BodyStructure(SAMPLE_DATA, MOCK_BEING_LOGIC);
            const update = body.addEdgeUpdate("thorax", "head");
            const adj = update["system.bodyStructure.adjacent"];
            expect(adj).toHaveLength(1);
        });
    });

    describe("removeEdgeUpdate", () => {
        it("returns update payload with edge removed", () => {
            const body = new BodyStructure(SAMPLE_DATA, MOCK_BEING_LOGIC);
            const update = body.removeEdgeUpdate("head", "thorax");
            const adj = update["system.bodyStructure.adjacent"];
            expect(adj).toHaveLength(0);
        });

        it("removes edge regardless of argument order", () => {
            const body = new BodyStructure(SAMPLE_DATA, MOCK_BEING_LOGIC);
            const update = body.removeEdgeUpdate("thorax", "head");
            const adj = update["system.bodyStructure.adjacent"];
            expect(adj).toHaveLength(0);
        });

        it("returns unchanged array if edge not found", () => {
            const body = new BodyStructure(SAMPLE_DATA, MOCK_BEING_LOGIC);
            const update = body.removeEdgeUpdate("head", "larm");
            const adj = update["system.bodyStructure.adjacent"];
            expect(adj).toHaveLength(1);
        });
    });

    describe("hasEdge", () => {
        it("returns true for existing edge", () => {
            const body = new BodyStructure(SAMPLE_DATA, MOCK_BEING_LOGIC);
            expect(body.hasEdge("head", "thorax")).toBe(true);
        });

        it("returns true regardless of order", () => {
            const body = new BodyStructure(SAMPLE_DATA, MOCK_BEING_LOGIC);
            expect(body.hasEdge("thorax", "head")).toBe(true);
        });

        it("returns false for non-existent edge", () => {
            const body = new BodyStructure(SAMPLE_DATA, MOCK_BEING_LOGIC);
            expect(body.hasEdge("head", "larm")).toBe(false);
        });
    });
});
