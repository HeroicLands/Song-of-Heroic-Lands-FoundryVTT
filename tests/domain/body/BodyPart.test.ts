import { describe, it, expect } from "vitest";
import type { BodyPart } from "@src/entity/body/BodyPart";
import type { BodyStructure } from "@src/entity/body/BodyStructure";
import {
    locationData,
    makeBody,
    partData,
    zoneData,
} from "@tests/mocks/bodyFixture";

/**
 * A part is built by its zone, which is built by the structure, so these tests
 * compose a one-part body and read the part back out rather than constructing a
 * `BodyPart` directly.
 */
function armBody(
    partOverrides: Partial<BodyPart.Data> = {},
    extra: { parts?: BodyPart.Data[] } = {},
): BodyStructure {
    return makeBody({
        zones: [zoneData("armszone", 4)],
        parts: [
            partData("larm", "armszone", 20, {
                canHoldItem: true,
                ...partOverrides,
            }),
            ...(extra.parts ?? []),
        ],
        locations: [
            locationData("ularm", "larm", 15, {
                bleedingSusceptibility: "high",
                amputability: "low",
                shockValue: 2,
                protectionBase: { blunt: 1, edged: 0, piercing: 0, fire: 0 },
            }),
            locationData("lhand", "larm", 5, { shockValue: 1 }),
        ],
    });
}

const arm = (overrides: Partial<BodyPart.Data> = {}): BodyPart =>
    armBody(overrides).getPartByCode("larm")!;

describe("BodyPart", () => {
    describe("construction", () => {
        it("creates from data with all properties", () => {
            const part = arm();
            expect(part.shortcode).toBe("larm");
            expect(part.affectsMobility).toBe(false);
            expect(part.canHoldItem).toBe(true);
            // `heldItem` is `SohlItem | undefined` (optional); with no held
            // item it is `undefined`, not `null`.
            expect(part.heldItem).toBeUndefined();
            // #739: probWeight is derived from the persisted `combatArea`
            // field (parts persist `combatArea`, not `probWeight`).
            expect(part.probWeight.effective).toBe(20);
            expect(part.index).toBe(0);
        });

        it("defaults permanentImpairment to 0 (#464)", () => {
            expect(arm().permanentImpairment).toBe(0);
        });

        it("falls back name to shortcode", () => {
            const part = armBody({ name: undefined }).getPartByCode("larm")!;
            expect(part.name).toBe("larm");
        });

        it("defaults permanentlyUnusable to false; isCritical follows VITAL/CORE (#470)", () => {
            expect(arm().permanentlyUnusable).toBe(false);
            expect(arm().isCritical).toBe(false); // roles: []
            expect(arm({ roles: ["core"] }).isCritical).toBe(true);
            expect(arm({ roles: ["locomotor"] }).isCritical).toBe(false);
            expect(arm({ permanentlyUnusable: true }).permanentlyUnusable).toBe(
                true,
            );
        });

        it("reads a negative permanent impairment and clamps a positive one to 0 (#464)", () => {
            const maimed = arm({ name: "Left Arm", permanentImpairment: -10 });
            expect(maimed.name).toBe("Left Arm");
            expect(maimed.permanentImpairment).toBe(-10);
            expect(arm({ permanentImpairment: 5 }).permanentImpairment).toBe(0);
        });

        it("constructs BodyLocation instances for each of its locations", () => {
            const part = arm();
            expect(part.locations).toHaveLength(2);
            expect(part.locations.map((l) => l.shortcode)).toEqual([
                "ularm",
                "lhand",
            ]);
        });

        it("gives locations their flat index, and position within the part", () => {
            const part = arm();
            expect(part.locations.map((l) => l.index)).toEqual([0, 1]);
            expect(part.locations.map((l) => l.position)).toEqual([0, 1]);
        });

        it("links back to its zone and structure", () => {
            const body = armBody();
            const part = body.getPartByCode("larm")!;
            expect(part.zone.shortcode).toBe("armszone");
            expect(part.structure).toBe(body);
        });
    });

    describe("indices", () => {
        it("updatePath addresses the flat parts array", () => {
            const body = armBody(
                {},
                { parts: [partData("rarm", "armszone", 20)] },
            );
            expect(body.getPartByCode("rarm")!.index).toBe(1);
            expect(body.getPartByCode("rarm")!.updatePath).toBe(
                "system.body.structure.parts.1",
            );
        });

        it("position is the slot within the zone, index the flat slot", () => {
            const body = makeBody({
                zones: [zoneData("headzone", 1), zoneData("armszone", 4)],
                parts: [
                    partData("head", "headzone", 1),
                    partData("rarm", "armszone", 2),
                    partData("larm", "armszone", 2),
                ],
                locations: [],
            });
            const larm = body.getPartByCode("larm")!;
            expect(larm.index).toBe(2); // third in the flat array
            expect(larm.position).toBe(1); // second in its zone
        });
    });

    describe("getLocation", () => {
        it("finds a location by code", () => {
            expect(arm().getLocationByCode("lhand")?.shortcode).toBe("lhand");
        });

        it("returns undefined for an unknown code", () => {
            expect(arm().getLocationByCode("nonexistent")).toBeUndefined();
        });

        it("does not find a location belonging to another part", () => {
            const body = makeBody({
                zones: [zoneData("armszone", 4)],
                parts: [
                    partData("larm", "armszone", 20),
                    partData("rarm", "armszone", 20),
                ],
                locations: [
                    locationData("lhand", "larm", 5),
                    locationData("rhand", "rarm", 5),
                ],
            });
            expect(
                body.getPartByCode("larm")!.getLocationByCode("rhand"),
            ).toBeUndefined();
        });
    });

    describe("getRandomLocation", () => {
        it("returns a location from this part", () => {
            const part = arm();
            expect(part.locations).toContain(part.getRandomLocation());
        });

        it("respects probability weights", () => {
            const part = arm();
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
