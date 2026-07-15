import { describe, it, expect } from "vitest";
import { BodyPart } from "@src/entity/body/BodyPart";

const SAMPLE_DATA: BodyPart.Data = {
    shortcode: "larm",
    roles: [],
    canHoldItem: true,
    heldItemId: null,
    probWeight: 20,
    locations: [
        {
            shortcode: "ularm",
            bleedingSusceptibility: "high",
            amputability: "low",
            shockValue: 2,
            probWeight: 15,
            protectionBase: { blunt: 1, edged: 0, piercing: 0, fire: 0 },
        },
        {
            shortcode: "lhand",
            bleedingSusceptibility: "none",
            amputability: "none",
            shockValue: 1,
            probWeight: 5,
            protectionBase: { blunt: 0, edged: 0, piercing: 0, fire: 0 },
        },
    ],
};

// Minimal mock: corpusLogic with a null actor (no item resolution)
const MOCK_BODY_STRUCTURE = {
    corpusLogic: { actor: null },
} as any;

// A Corpus-kinded owning logic (the parent every body entity requires).
const MOCK_CORPUS = { kind: "corpus", actor: null } as any;

describe("BodyPart", () => {
    describe("construction", () => {
        it("creates from data with all properties", () => {
            const part = new BodyPart(SAMPLE_DATA, {
                parent: MOCK_CORPUS,
                structure: MOCK_BODY_STRUCTURE,
                index: 0,
            });
            expect(part.shortcode).toBe("larm");
            expect(part.affectsMobility).toBe(false);
            expect(part.canHoldItem).toBe(true);
            // `heldItem` is `SohlItem | undefined` (optional); with no held
            // item it is `undefined`, not `null`.
            expect(part.heldItem).toBeUndefined();
            expect(part.probWeight.effective).toBe(20);
            expect(part.index).toBe(0);
        });

        it("falls back name to shortcode and defaults permanentImpairment to 0 (#464)", () => {
            const part = new BodyPart(SAMPLE_DATA, {
                parent: MOCK_CORPUS,
                structure: MOCK_BODY_STRUCTURE,
                index: 0,
            });
            expect(part.name).toBe("larm"); // no name in data → shortcode
            expect(part.permanentImpairment).toBe(0);
        });

        it("defaults permanentlyUnusable to false; isCritical follows VITAL/CORE (#470)", () => {
            const opts = {
                parent: MOCK_CORPUS,
                structure: MOCK_BODY_STRUCTURE,
                index: 0,
            };
            const plain = new BodyPart(SAMPLE_DATA, opts);
            expect(plain.permanentlyUnusable).toBe(false);
            expect(plain.isCritical).toBe(false); // roles: []

            expect(
                new BodyPart({ ...SAMPLE_DATA, roles: ["core"] }, opts)
                    .isCritical,
            ).toBe(true);
            expect(
                new BodyPart({ ...SAMPLE_DATA, roles: ["locomotor"] }, opts)
                    .isCritical,
            ).toBe(false);
            expect(
                new BodyPart(
                    { ...SAMPLE_DATA, permanentlyUnusable: true },
                    opts,
                ).permanentlyUnusable,
            ).toBe(true);
        });

        it("reads a negative permanent impairment and clamps a positive one to 0 (#464)", () => {
            const maimed = new BodyPart(
                { ...SAMPLE_DATA, name: "Left Arm", permanentImpairment: -10 },
                {
                    parent: MOCK_CORPUS,
                    structure: MOCK_BODY_STRUCTURE,
                    index: 0,
                },
            );
            expect(maimed.name).toBe("Left Arm");
            expect(maimed.permanentImpairment).toBe(-10);

            const positive = new BodyPart(
                { ...SAMPLE_DATA, permanentImpairment: 5 },
                {
                    parent: MOCK_CORPUS,
                    structure: MOCK_BODY_STRUCTURE,
                    index: 0,
                },
            );
            expect(positive.permanentImpairment).toBe(0);
        });

        it("constructs BodyLocation instances for each location", () => {
            const part = new BodyPart(SAMPLE_DATA, {
                parent: MOCK_CORPUS,
                structure: MOCK_BODY_STRUCTURE,
                index: 0,
            });
            expect(part.locations).toHaveLength(2);
            expect(part.locations[0].shortcode).toBe("ularm");
            expect(part.locations[1].shortcode).toBe("lhand");
        });

        it("assigns sequential indices to locations", () => {
            const part = new BodyPart(SAMPLE_DATA, {
                parent: MOCK_CORPUS,
                structure: MOCK_BODY_STRUCTURE,
                index: 0,
            });
            expect(part.locations[0].index).toBe(0);
            expect(part.locations[1].index).toBe(1);
        });
    });

    describe("updatePath", () => {
        it("builds dot-notation path from index", () => {
            const part = new BodyPart(SAMPLE_DATA, {
                parent: MOCK_CORPUS,
                structure: MOCK_BODY_STRUCTURE,
                index: 3,
            });
            expect(part.updatePath).toBe("system.structure.parts.3");
        });
    });

    describe("getLocation", () => {
        it("finds a location by name", () => {
            const part = new BodyPart(SAMPLE_DATA, {
                parent: MOCK_CORPUS,
                structure: MOCK_BODY_STRUCTURE,
                index: 0,
            });
            const loc = part.getLocationByCode("lhand");
            expect(loc).toBeDefined();
            expect(loc!.shortcode).toBe("lhand");
        });

        it("returns undefined for unknown name", () => {
            const part = new BodyPart(SAMPLE_DATA, {
                parent: MOCK_CORPUS,
                structure: MOCK_BODY_STRUCTURE,
                index: 0,
            });
            expect(part.getLocationByCode("nonexistent")).toBeUndefined();
        });
    });

    describe("getRandomLocation", () => {
        it("returns a location from this part", () => {
            const part = new BodyPart(SAMPLE_DATA, {
                parent: MOCK_CORPUS,
                structure: MOCK_BODY_STRUCTURE,
                index: 0,
            });
            const loc = part.getRandomLocation();
            expect(part.locations).toContain(loc);
        });

        it("respects probability weights", () => {
            const part = new BodyPart(SAMPLE_DATA, {
                parent: MOCK_CORPUS,
                structure: MOCK_BODY_STRUCTURE,
                index: 0,
            });
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
