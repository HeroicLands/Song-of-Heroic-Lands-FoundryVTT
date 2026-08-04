import { describe, it, expect } from "vitest";
import { BodyStructure } from "@src/entity/body/BodyStructure";
import type { BodyPart } from "@src/entity/body/BodyPart";
import { createRng } from "@src/entity/random/createRng";
import { weightedRandom } from "@src/entity/body/weighted-random";
import {
    bodyOptions,
    locationData,
    makeBody,
    partData,
    sampleBodyData,
    zoneData,
} from "@tests/mocks/bodyFixture";

describe("BodyStructure", () => {
    describe("construction", () => {
        it("assembles the zone -> part -> location hierarchy from flat arrays", () => {
            const body = makeBody();
            expect(body.zones.map((z) => z.shortcode)).toEqual([
                "headzone",
                "bodyzone",
            ]);
            expect(body.zones[0].parts.map((p) => p.shortcode)).toEqual([
                "head",
            ]);
            expect(body.zones[1].parts.map((p) => p.shortcode)).toEqual([
                "thorax",
            ]);
            expect(
                body.zones[0].parts[0].locations.map((l) => l.shortcode),
            ).toEqual(["skull", "face"]);
            expect(
                body.zones[1].parts[0].locations.map((l) => l.shortcode),
            ).toEqual(["chest"]);
        });

        it("indexes every entity by its slot in the flat persisted array", () => {
            const body = makeBody();
            expect(body.zones.map((z) => z.index)).toEqual([0, 1]);
            expect(body.parts.map((p) => p.index)).toEqual([0, 1]);
            expect(body.locations.map((l) => l.index)).toEqual([0, 1, 2]);
            // The flat views are ordered by index, so parts[i].index === i.
            body.parts.forEach((p, i) => expect(p.index).toBe(i));
            body.locations.forEach((l, i) => expect(l.index).toBe(i));
        });

        it("wires child back-references up the hierarchy", () => {
            const body = makeBody();
            const part = body.getPartByCode("head")!;
            expect(part.zone.shortcode).toBe("headzone");
            expect(part.structure).toBe(body);
            expect(part.locations[0].bodyPart).toBe(part);
        });

        it("allocates each zone a contiguous run of zone numbers by weight", () => {
            const body = makeBody();
            expect(body.zones[0].zoneNumbers).toEqual([1]);
            expect(body.zones[1].zoneNumbers).toEqual([2, 3]);
            expect(body.maxZoneNumber).toBe(3);
        });

        it("gives an unweighted zone no zone numbers", () => {
            const data = sampleBodyData();
            data.zones = [zoneData("headzone", 0), zoneData("bodyzone", 2)];
            const body = makeBody(data);
            expect(body.zones[0].zoneNumbers).toEqual([]);
            expect(body.zones[1].zoneNumbers).toEqual([1, 2]);
            expect(body.maxZoneNumber).toBe(2);
        });

        it("keeps a part whose zone code matches nothing out of the hierarchy", () => {
            const data = sampleBodyData();
            data.parts.push(partData("stray", "nosuchzone", 5));
            const body = makeBody(data);
            expect(body.getPartByCode("stray")).toBeUndefined();
            expect(body.orphanedParts.map((p) => p.shortcode)).toEqual([
                "stray",
            ]);
        });

        it("keeps a location whose part code matches nothing out of the hierarchy", () => {
            const data = sampleBodyData();
            data.locations.push(locationData("floating", "nosuchpart", 3));
            const body = makeBody(data);
            expect(body.getLocationByCode("floating")).toBeUndefined();
            expect(body.orphanedLocations.map((l) => l.shortcode)).toEqual([
                "floating",
            ]);
        });

        it("throws when any of the three arrays is missing", () => {
            for (const key of ["zones", "parts", "locations"] as const) {
                const data = sampleBodyData();
                delete (data as any)[key];
                expect(
                    () => new BodyStructure(data, bodyOptions(data)),
                ).toThrow(`BodyStructure requires a '${key}' array`);
            }
        });
    });

    describe("lookups", () => {
        it("finds zones, parts, and locations by code and index", () => {
            const body = makeBody();
            expect(body.getZoneByCode("bodyzone")?.index).toBe(1);
            expect(body.getZoneByIndex(0)?.shortcode).toBe("headzone");
            expect(body.getPartByCode("thorax")?.index).toBe(1);
            expect(body.getPartByIndex(0)?.shortcode).toBe("head");
            expect(body.getLocationByCode("chest")?.index).toBe(2);
            expect(body.getLocationByIndex(1)?.shortcode).toBe("face");
        });

        it("returns undefined for unknown codes", () => {
            const body = makeBody();
            expect(body.getZoneByCode("nope")).toBeUndefined();
            expect(body.getPartByCode("nope")).toBeUndefined();
            expect(body.getLocationByCode("nope")).toBeUndefined();
        });

        it("numbers the zones contiguously 1..maxZoneNumber, with no gaps or overlap", () => {
            // Weights 3 / 0 / 5 / 2: the zero-weight zone claims nothing and
            // must not interrupt the run.
            const body = makeBody({
                zones: [
                    zoneData("z1", 3),
                    zoneData("z0", 0),
                    zoneData("z2", 5),
                    zoneData("z3", 2),
                ],
                parts: [],
                locations: [],
            });

            expect(body.zones.map((z) => z.zoneNumbers)).toEqual([
                [1, 2, 3],
                [],
                [4, 5, 6, 7, 8],
                [9, 10],
            ]);

            const all = body.zones.flatMap((z) => z.zoneNumbers);
            // Unique...
            expect(new Set(all).size).toBe(all.length);
            // ...contiguous and monotonically increasing by 1 from 1...
            expect(all).toEqual(
                Array.from({ length: all.length }, (_, i) => i + 1),
            );
            // ...and maxZoneNumber is that run's N.
            expect(body.maxZoneNumber).toBe(10);
            expect(Math.max(...all)).toBe(body.maxZoneNumber);

            // Every number in 1..N resolves to exactly one zone.
            for (let n = 1; n <= body.maxZoneNumber; n++) {
                const owners = body.zones.filter((z) => z.ownsZoneNumber(n));
                expect(owners).toHaveLength(1);
                expect(body.getZoneByNumber(n)).toBe(owners[0]);
            }
        });

        it("maxZoneNumber is 0 for a body with no weighted zones", () => {
            const body = makeBody({
                zones: [zoneData("z0", 0)],
                parts: [],
                locations: [],
            });
            expect(body.maxZoneNumber).toBe(0);
            expect(body.getZoneByNumber(1)).toBeUndefined();
        });

        it("getZoneByNumber returns undefined for any number not on the body", () => {
            const body = makeBody(); // zone numbers 1..3
            expect(body.maxZoneNumber).toBe(3);
            for (const n of [
                0,
                -1,
                4,
                99,
                1.5,
                Number.NaN,
                Number.POSITIVE_INFINITY,
            ]) {
                expect(body.getZoneByNumber(n)).toBeUndefined();
            }
        });

        it("resolves a zone from a rolled zone number", () => {
            const body = makeBody();
            expect(body.getZoneByNumber(1)?.shortcode).toBe("headzone");
            expect(body.getZoneByNumber(2)?.shortcode).toBe("bodyzone");
            expect(body.getZoneByNumber(3)?.shortcode).toBe("bodyzone");
            expect(body.getZoneByNumber(4)).toBeUndefined();
            expect(body.getZoneByNumber(0)).toBeUndefined();
        });

        it("getAllLocations returns every location in persisted order", () => {
            const body = makeBody();
            expect(body.getAllLocations().map((l) => l.shortcode)).toEqual([
                "skull",
                "face",
                "chest",
            ]);
        });

        it("getAllZones returns every zone in persisted order (#982)", () => {
            const body = makeBody();
            expect(body.getAllZones().map((z) => z.shortcode)).toEqual([
                "headzone",
                "bodyzone",
            ]);
            // Carries the display name for {value: shortcode, label: name} mapping.
            expect(body.getAllZones().map((z) => z.name)).toEqual([
                "headzone",
                "bodyzone",
            ]);
        });

        it("getAllParts returns every part in persisted order (#982)", () => {
            const body = makeBody();
            expect(body.getAllParts().map((p) => p.shortcode)).toEqual([
                "head",
                "thorax",
            ]);
        });

        it("exposes a zone's locations across all of its parts", () => {
            const data = sampleBodyData();
            data.parts.push(partData("gut", "bodyzone", 10));
            data.locations.push(locationData("belly", "gut", 8));
            const body = makeBody(data);
            expect(
                body
                    .getZoneByCode("bodyzone")!
                    .locations.map((l) => l.shortcode),
            ).toEqual(["chest", "belly"]);
        });
    });

    describe("limbsHolding", () => {
        // Two hands grip "sword1"; the mouth references it too but cannot hold
        // items; the head holds nothing.
        const holdingData = () => ({
            zones: [zoneData("armszone", 2), zoneData("headzone", 1)],
            parts: [
                partData("rightHand", "armszone", 5, {
                    canHoldItem: true,
                    heldItemId: "sword1",
                }),
                partData("leftHand", "armszone", 5, {
                    canHoldItem: true,
                    heldItemId: "sword1",
                }),
                partData("mouth", "headzone", 1, { heldItemId: "sword1" }),
                partData("head", "headzone", 15),
            ],
            locations: [],
        });

        const actorResolving = (ids: string[]) => ({
            items: { get: (id: string) => (ids.includes(id) ? { id } : null) },
        });

        it("counts item-holding limbs whose held item matches", () => {
            const body = makeBody(holdingData(), actorResolving(["sword1"]));
            expect(body.limbsHolding("sword1")).toBe(2);
        });

        it("returns 0 when no holdable limb grips the item", () => {
            const body = makeBody(holdingData(), actorResolving(["sword1"]));
            expect(body.limbsHolding("axe9")).toBe(0);
        });

        it("returns 0 when nothing is held at all", () => {
            const body = makeBody(holdingData(), actorResolving([]));
            expect(body.limbsHolding("sword1")).toBe(0);
        });
    });

    describe("getNeighborParts", () => {
        // arms zone holds two arms; legs zone holds two legs; head zone one head.
        const wideBody = () =>
            makeBody({
                zones: [
                    zoneData("headzone", 1),
                    zoneData("armszone", 4),
                    zoneData("legszone", 4),
                ],
                parts: [
                    partData("head", "headzone", 1),
                    partData("rarm", "armszone", 2),
                    partData("larm", "armszone", 2),
                    partData("rleg", "legszone", 2),
                    partData("lleg", "legszone", 2),
                ],
                locations: [],
            });

        it("drifts to zone siblings first", () => {
            expect(
                wideBody()
                    .getNeighborParts("rarm")
                    .map((p) => p.shortcode),
            ).toEqual(["larm"]);
        });

        it("widens to the nearest zones when the zone has no other part", () => {
            // head is alone in zone 0; the nearest ring is zone 1 (the arms).
            expect(
                wideBody()
                    .getNeighborParts("head")
                    .map((p) => p.shortcode),
            ).toEqual(["rarm", "larm"]);
        });

        it("skips excluded parts and widens past an exhausted ring", () => {
            const body = wideBody();
            expect(
                body
                    .getNeighborParts("rarm", new Set(["larm"]))
                    .map((p) => p.shortcode)
                    .sort(),
            ).toEqual(["head", "lleg", "rleg"]);
        });

        it("returns empty when every other part is excluded", () => {
            const body = wideBody();
            const all = new Set(["head", "larm", "rleg", "lleg"]);
            expect(body.getNeighborParts("rarm", all)).toEqual([]);
        });

        it("returns empty for an unknown part", () => {
            expect(wideBody().getNeighborParts("nope")).toEqual([]);
        });
    });

    describe("random selection", () => {
        it("getRandomZone honours the zone-number allocation", () => {
            const body = makeBody();
            const seen = new Set<string>();
            for (let i = 0; i < 200; i++) {
                seen.add(body.getRandomZone(createRng(`z-${i}`))!.shortcode);
            }
            expect([...seen].sort()).toEqual(["bodyzone", "headzone"]);
        });

        it("getRandomZone returns undefined when no zone has weight", () => {
            const data = sampleBodyData();
            data.zones = data.zones.map((z) => ({ ...z, probWeight: 0 }));
            expect(makeBody(data).getRandomZone()).toBeUndefined();
        });

        it("getRandomPart returns a part of the structure when no target", () => {
            const body = makeBody();
            for (let i = 0; i < 50; i++) {
                const part = body.getRandomPart(undefined, createRng(`p-${i}`));
                expect(["head", "thorax"]).toContain(part.shortcode);
            }
        });

        it("getRandomOccupiedZone skips zones that hold no parts", () => {
            // "emptyzone" owns numbers 1-8 but holds no parts, so it must never
            // be drawn — its share would otherwise leak into a body-wide
            // fallback and skew every other zone's true frequency.
            const body = makeBody({
                zones: [zoneData("emptyzone", 8), zoneData("bodyzone", 1)],
                parts: [partData("thorax", "bodyzone", 30)],
                locations: [locationData("chest", "thorax", 20)],
            });
            for (let i = 0; i < 50; i++) {
                expect(
                    body.getRandomOccupiedZone(createRng(`e-${i}`))?.shortcode,
                ).toBe("bodyzone");
                expect(
                    body.getRandomPart(undefined, createRng(`e-${i}`))
                        .shortcode,
                ).toBe("thorax");
            }
            // The plain zone roll still reports the empty zone — it owns real
            // zone numbers and the displayed table must say so.
            expect(body.getZoneByNumber(1)?.shortcode).toBe("emptyzone");
        });

        it("getRandomOccupiedZone renormalises over the occupied zones", () => {
            // Occupied weights are 1 and 3, so the split must be 1:3 — the
            // empty zone's 2 weight is excluded, not redistributed body-wide.
            const body = makeBody({
                zones: [
                    zoneData("headzone", 1),
                    zoneData("ghostzone", 2), // weighted but empty
                    zoneData("legszone", 3),
                ],
                parts: [
                    partData("head", "headzone", 1),
                    partData("leg", "legszone", 1),
                ],
                locations: [],
            });
            const counts: Record<string, number> = {};
            const N = 20_000;
            for (let i = 0; i < N; i++) {
                const z = body.getRandomOccupiedZone(createRng(`n-${i}`))!;
                counts[z.shortcode] = (counts[z.shortcode] ?? 0) + 1;
            }
            expect(counts["ghostzone"]).toBeUndefined();
            expect(counts["headzone"] / N).toBeCloseTo(1 / 4, 1);
            expect(counts["legszone"] / N).toBeCloseTo(3 / 4, 1);
        });

        it("getRandomOccupiedZone is undefined when no weighted zone holds a part", () => {
            const body = makeBody({
                zones: [zoneData("emptyzone", 8)],
                parts: [],
                locations: [],
            });
            expect(body.getRandomOccupiedZone()).toBeUndefined();
        });

        it("weights every tier by probWeight over its siblings' sum", () => {
            // Lopsided weights at all three tiers, so a mis-wired tier shows up.
            const body = makeBody({
                zones: [zoneData("z1", 1), zoneData("z2", 4)],
                parts: [
                    partData("p1", "z1", 7), // sole part of z1
                    partData("p2", "z2", 3),
                    partData("p3", "z2", 1), // z2 splits 3:1
                ],
                locations: [
                    locationData("l1a", "p1", 9),
                    locationData("l1b", "p1", 1), // p1 splits 9:1
                    locationData("l2a", "p2", 1),
                    locationData("l3a", "p3", 1),
                ],
            });
            const expected: Record<string, number> = {
                l1a: (1 / 5) * (7 / 7) * (9 / 10),
                l1b: (1 / 5) * (7 / 7) * (1 / 10),
                l2a: (4 / 5) * (3 / 4) * (1 / 1),
                l3a: (4 / 5) * (1 / 4) * (1 / 1),
            };
            const N = 40_000;
            const counts: Record<string, number> = {};
            for (let i = 0; i < N; i++) {
                const loc = body.getRandomLocation(
                    undefined,
                    createRng(`w-${i}`),
                );
                counts[loc.shortcode] = (counts[loc.shortcode] ?? 0) + 1;
            }
            for (const [code, p] of Object.entries(expected)) {
                expect(Math.abs((counts[code] ?? 0) / N - p)).toBeLessThan(
                    0.02,
                );
            }
        });

        it("returns the target part when spread is at or below its weight", () => {
            const body = makeBody();
            const targetPart = body.getPartByCode("head")!;
            for (let i = 0; i < 20; i++) {
                expect(
                    body.getRandomPart(
                        { targetPart, spread: 15 },
                        createRng(`t-${i}`),
                    ).shortcode,
                ).toBe("head");
            }
        });

        it("always returns a valid part with targeted selection", () => {
            const body = makeBody();
            const targetPart = body.getPartByCode("head")!;
            for (let i = 0; i < 100; i++) {
                const part = body.getRandomPart(
                    { targetPart, spread: 100 },
                    createRng(`v-${i}`),
                );
                expect(["head", "thorax"]).toContain(part.shortcode);
            }
        });

        it("drifts to a neighbouring part when spread far exceeds the weight", () => {
            const body = makeBody();
            const targetPart = body.getPartByCode("head")!;
            const hits = new Set<string>();
            for (let i = 0; i < 200; i++) {
                hits.add(
                    body.getRandomPart(
                        { targetPart, spread: 1000 },
                        createRng(`d-${i}`),
                    ).shortcode,
                );
            }
            expect(hits.has("thorax")).toBe(true);
        });

        it("getRandomLocation returns a location of the structure", () => {
            const body = makeBody();
            for (let i = 0; i < 50; i++) {
                const loc = body.getRandomLocation(
                    undefined,
                    createRng(`l-${i}`),
                );
                expect(["skull", "face", "chest"]).toContain(loc.shortcode);
            }
        });
    });

    describe("seeded determinism (#601)", () => {
        it("getRandomPart(target) is reproducible under the same seed", () => {
            const body = makeBody();
            const target = {
                targetPart: body.getPartByCode("head")!,
                spread: 60,
            };
            const first = Array.from(
                { length: 20 },
                (_, i) =>
                    body.getRandomPart(target, createRng(`hit-${i}`)).shortcode,
            );
            const again = Array.from(
                { length: 20 },
                (_, i) =>
                    body.getRandomPart(target, createRng(`hit-${i}`)).shortcode,
            );
            expect(again).toEqual(first);
        });

        it("getRandomLocation is reproducible end to end", () => {
            const body = makeBody();
            const first = body.getRandomLocation(
                undefined,
                createRng("seed-1"),
            );
            const again = body.getRandomLocation(
                undefined,
                createRng("seed-1"),
            );
            expect(again.shortcode).toBe(first.shortcode);
        });

        it("weightedRandom is reproducible under the same seed", () => {
            const body = makeBody();
            const pick = () =>
                weightedRandom(body.parts, createRng("w-seed")).shortcode;
            expect(pick()).toBe(pick());
        });
    });

    describe("updatePath", () => {
        it("addresses each tier by its flat index", () => {
            const body = makeBody();
            expect(body.zones[1].updatePath).toBe(
                "system.body.structure.zones.1",
            );
            expect(body.parts[1].updatePath).toBe(
                "system.body.structure.parts.1",
            );
            expect(body.locations[2].updatePath).toBe(
                "system.body.structure.locations.2",
            );
        });
    });

    describe("zone update payloads", () => {
        it("addZoneUpdate appends to the whole zones array", () => {
            const body = makeBody();
            const payload = body.addZoneUpdate(zoneData("tailzone", 2));
            expect(payload["system.body.structure.zones"]).toHaveLength(3);
            expect(payload["system.body.structure.zones"][2].shortcode).toBe(
                "tailzone",
            );
        });

        it("removeZoneUpdate cascades to its parts and their locations", () => {
            const body = makeBody();
            const payload = body.removeZoneUpdate("headzone");
            expect(
                payload["system.body.structure.zones"].map(
                    (z: any) => z.shortcode,
                ),
            ).toEqual(["bodyzone"]);
            expect(
                payload["system.body.structure.parts"].map(
                    (p: any) => p.shortcode,
                ),
            ).toEqual(["thorax"]);
            // skull + face belonged to the head part and go with it.
            expect(
                payload["system.body.structure.locations"].map(
                    (l: any) => l.shortcode,
                ),
            ).toEqual(["chest"]);
        });

        it("moveZoneUpdate rewrites the whole zones array", () => {
            const body = makeBody();
            const payload = body.moveZoneUpdate(0, 1);
            expect(
                payload["system.body.structure.zones"].map(
                    (z: any) => z.shortcode,
                ),
            ).toEqual(["bodyzone", "headzone"]);
        });

        it("setZoneFieldsUpdate changes only the addressed zone", () => {
            const body = makeBody();
            const payload = body.setZoneFieldsUpdate([
                { index: 1, changes: { probWeight: 7 } },
            ]);
            const zones = payload["system.body.structure.zones"];
            expect(zones).toHaveLength(2);
            expect(zones[0].probWeight).toBe(1);
            expect(zones[1].probWeight).toBe(7);
            expect(zones[1].shortcode).toBe("bodyzone");
        });

        it("setZoneFieldsUpdate ignores out-of-range indices", () => {
            const body = makeBody();
            expect(
                body.setZoneFieldsUpdate([
                    { index: 9, changes: { probWeight: 1 } },
                ]),
            ).toEqual({});
        });
    });

    describe("part update payloads", () => {
        it("addPartUpdate appends to the whole parts array", () => {
            const body = makeBody();
            const payload = body.addPartUpdate(partData("tail", "bodyzone", 4));
            const parts = payload["system.body.structure.parts"];
            expect(parts).toHaveLength(3);
            expect(parts[2].shortcode).toBe("tail");
        });

        it("BodyZone.addPartUpdate stamps the owning zone code", () => {
            const body = makeBody();
            const payload = body
                .getZoneByCode("bodyzone")!
                .addPartUpdate(partData("tail", "wrongzone", 4));
            expect(payload["system.body.structure.parts"][2].bodyZoneCode).toBe(
                "bodyzone",
            );
        });

        it("removePartUpdate cascades to that part's locations", () => {
            const body = makeBody();
            const payload = body.removePartUpdate("head");
            expect(
                payload["system.body.structure.parts"].map(
                    (p: any) => p.shortcode,
                ),
            ).toEqual(["thorax"]);
            expect(
                payload["system.body.structure.locations"].map(
                    (l: any) => l.shortcode,
                ),
            ).toEqual(["chest"]);
        });

        it("removePartUpdate leaves everything alone for an unknown code", () => {
            const body = makeBody();
            const payload = body.removePartUpdate("nope");
            expect(payload["system.body.structure.parts"]).toHaveLength(2);
            expect(payload["system.body.structure.locations"]).toHaveLength(3);
        });

        it("setPartFieldsUpdate changes only the addressed part", () => {
            const body = makeBody();
            const payload = body.setPartFieldsUpdate([
                { index: 0, changes: { permanentImpairment: -5 } },
            ]);
            const parts = payload["system.body.structure.parts"];
            expect(parts).toHaveLength(2);
            expect(parts[0].permanentImpairment).toBe(-5);
            expect(parts[0].shortcode).toBe("head");
            expect(parts[1].permanentImpairment).toBeUndefined();
        });

        it("setPartFieldsUpdate applies changes to several parts at once", () => {
            const body = makeBody();
            const parts = body.setPartFieldsUpdate([
                { index: 0, changes: { canHoldItem: true } },
                { index: 1, changes: { probWeight: 99 } },
            ])["system.body.structure.parts"];
            expect(parts[0].canHoldItem).toBe(true);
            expect(parts[1].probWeight).toBe(99);
        });

        it("movePartUpdate reorders within a zone", () => {
            const data = sampleBodyData();
            data.parts.push(partData("gut", "bodyzone", 10));
            const body = makeBody(data);
            // Move "gut" (flat index 2) to the front of its zone.
            const parts = body.movePartUpdate(2, "bodyzone", 0)[
                "system.body.structure.parts"
            ];
            expect(parts.map((p: any) => p.shortcode)).toEqual([
                "head",
                "gut",
                "thorax",
            ]);
        });

        it("movePartUpdate re-parents a part to another zone", () => {
            const body = makeBody();
            const parts = body.movePartUpdate(1, "headzone", 0)[
                "system.body.structure.parts"
            ];
            expect(parts.map((p: any) => p.shortcode)).toEqual([
                "thorax",
                "head",
            ]);
            expect(parts[0].bodyZoneCode).toBe("headzone");
        });

        it("movePartUpdate appends when the destination zone is empty", () => {
            const data = sampleBodyData();
            data.zones.push(zoneData("tailzone", 1));
            const body = makeBody(data);
            const parts = body.movePartUpdate(0, "tailzone", 0)[
                "system.body.structure.parts"
            ];
            expect(parts.map((p: any) => p.shortcode)).toEqual([
                "thorax",
                "head",
            ]);
            expect(parts[1].bodyZoneCode).toBe("tailzone");
        });

        it("movePartUpdate is a no-op on an out-of-range index", () => {
            const body = makeBody();
            const parts = body.movePartUpdate(9, "headzone", 0)[
                "system.body.structure.parts"
            ];
            expect(parts.map((p: any) => p.shortcode)).toEqual([
                "head",
                "thorax",
            ]);
        });
    });

    describe("location update payloads", () => {
        it("addLocationUpdate appends to the whole locations array", () => {
            const body = makeBody();
            const locs = body.addLocationUpdate(locationData("jaw", "head", 4))[
                "system.body.structure.locations"
            ];
            expect(locs).toHaveLength(4);
            expect(locs[3].shortcode).toBe("jaw");
        });

        it("BodyPart.addLocationUpdate stamps the owning part code", () => {
            const body = makeBody();
            const locs = body
                .getPartByCode("thorax")!
                .addLocationUpdate(locationData("jaw", "wrongpart", 4))[
                "system.body.structure.locations"
            ];
            expect(locs[3].bodyPartCode).toBe("thorax");
        });

        it("removeLocationUpdate removes by body-wide shortcode", () => {
            const body = makeBody();
            const locs =
                body.removeLocationUpdate("face")[
                    "system.body.structure.locations"
                ];
            expect(locs.map((l: any) => l.shortcode)).toEqual([
                "skull",
                "chest",
            ]);
        });

        it("BodyPart.removeLocationUpdate refuses a location of another part", () => {
            const body = makeBody();
            expect(
                body.getPartByCode("thorax")!.removeLocationUpdate("skull"),
            ).toEqual({});
        });

        it("setLocationFieldsUpdate changes only the addressed location", () => {
            const body = makeBody();
            const locs = body.setLocationFieldsUpdate([
                { index: 1, changes: { shockValue: 9 } },
            ])["system.body.structure.locations"];
            expect(locs).toHaveLength(3);
            expect(locs[1].shockValue).toBe(9);
            expect(locs[0].shockValue).toBe(3);
        });

        it("moveLocationUpdate reorders within its part", () => {
            const body = makeBody();
            const locs = body.moveLocationUpdate(1, "head", 0)[
                "system.body.structure.locations"
            ];
            expect(locs.map((l: any) => l.shortcode)).toEqual([
                "face",
                "skull",
                "chest",
            ]);
        });

        it("moveLocationUpdate relocates a location to another part", () => {
            const body = makeBody();
            const locs = body.moveLocationUpdate(0, "thorax", 0)[
                "system.body.structure.locations"
            ];
            expect(locs.map((l: any) => l.shortcode)).toEqual([
                "face",
                "skull",
                "chest",
            ]);
            expect(
                locs.find((l: any) => l.shortcode === "skull").bodyPartCode,
            ).toBe("thorax");
        });
    });

    describe("re-parenting after a rename", () => {
        it("repointPartsUpdate re-points a renamed zone's parts", () => {
            const body = makeBody();
            const parts = body.repointPartsUpdate("headzone", "cranium")[
                "system.body.structure.parts"
            ];
            expect(parts[0].bodyZoneCode).toBe("cranium");
            expect(parts[1].bodyZoneCode).toBe("bodyzone");
        });

        it("repointLocationsUpdate re-points a renamed part's locations", () => {
            const body = makeBody();
            const locs = body.repointLocationsUpdate("head", "noggin")[
                "system.body.structure.locations"
            ];
            expect(locs.map((l: any) => l.bodyPartCode)).toEqual([
                "noggin",
                "noggin",
                "thorax",
            ]);
        });

        it("returns {} when the code is unchanged or unreferenced", () => {
            const body = makeBody();
            expect(body.repointPartsUpdate("headzone", "headzone")).toEqual({});
            expect(body.repointLocationsUpdate("nosuch", "other")).toEqual({});
        });
    });

    describe("roles", () => {
        const roleBody = () =>
            makeBody({
                zones: [zoneData("headzone", 1), zoneData("armszone", 4)],
                parts: [
                    partData("head", "headzone", 1, { roles: ["vital"] }),
                    partData("rarm", "armszone", 2, {
                        roles: ["manipulator"],
                    }),
                    partData("larm", "armszone", 2, {
                        roles: ["manipulator", "vital"],
                    }),
                ],
                locations: [],
            });

        it("getPartsByRole returns every part carrying the role", () => {
            expect(
                roleBody()
                    .getPartsByRole("vital")
                    .map((p: BodyPart) => p.shortcode),
            ).toEqual(["head", "larm"]);
        });

        it("getRandomPartByRole only ever returns a part with that role", () => {
            const body = roleBody();
            for (let i = 0; i < 50; i++) {
                const part = body.getRandomPartByRole(
                    "manipulator",
                    createRng(`r-${i}`),
                )!;
                expect(part.roles).toContain("manipulator");
            }
        });

        it("getRandomPartByRole returns undefined when no part has the role", () => {
            expect(roleBody().getRandomPartByRole("locomotor")).toBeUndefined();
        });
    });
});

// Zone-Number + Zone-Die aiming (#828). The sample body has zone numbers
// 1 (headzone) and 2-3 (bodyzone), so maxZoneNumber === 3. With zoneDie === 1
// the die result is always 1, so hitZoneNumber === targetZoneNumber — which
// makes the zone/part/location resolution deterministic to assert.
describe("BodyStructure.aimZone", () => {
    it("computes Hit ZN = (targetZoneNumber - 1) + zoneDieResult", () => {
        const body = makeBody();
        const aim = body.aimZone(
            { targetZoneNumber: 2, zoneDie: 1 },
            createRng("aim-hitzn"),
        );
        expect(aim.zoneDieResult).toBe(1);
        expect(aim.hitZoneNumber).toBe(2);
        expect(aim.targetZoneNumber).toBe(2);
        expect(aim.zoneDie).toBe(1);
        expect(aim.isMiss).toBe(false);
    });

    it("resolves the zone owning the hit zone number, then a part and location within it", () => {
        const body = makeBody();
        // Hit ZN 1 -> headzone -> head -> skull|face.
        const head = body.aimZone(
            { targetZoneNumber: 1, zoneDie: 1 },
            createRng("aim-head"),
        );
        expect(head.zone?.shortcode).toBe("headzone");
        expect(head.location?.bodyPart.shortcode).toBe("head");
        expect(["skull", "face"]).toContain(head.location?.shortcode);

        // Hit ZN 2 -> bodyzone -> thorax -> chest.
        const body2 = body.aimZone(
            { targetZoneNumber: 2, zoneDie: 1 },
            createRng("aim-body"),
        );
        expect(body2.zone?.shortcode).toBe("bodyzone");
        expect(body2.location?.shortcode).toBe("chest");
    });

    it("is a miss when the hit zone number exceeds the body's max zone number", () => {
        const body = makeBody();
        // maxZoneNumber is 3; targetZoneNumber 4 with zoneDie 1 -> Hit ZN 4.
        const aim = body.aimZone(
            { targetZoneNumber: 4, zoneDie: 1 },
            createRng("aim-miss"),
        );
        expect(aim.hitZoneNumber).toBe(4);
        expect(aim.isMiss).toBe(true);
        expect(aim.zone).toBeUndefined();
        expect(aim.location).toBeUndefined();
    });

    it("draws the zone die uniformly in 1..zoneDie", () => {
        const body = makeBody();
        const seen = new Set<number>();
        for (let i = 0; i < 200; i++) {
            const aim = body.aimZone(
                { targetZoneNumber: 1, zoneDie: 6 },
                createRng(`aim-die-${i}`),
            );
            expect(aim.zoneDieResult).toBeGreaterThanOrEqual(1);
            expect(aim.zoneDieResult).toBeLessThanOrEqual(6);
            expect(aim.hitZoneNumber).toBe(aim.zoneDieResult); // targetZN 1
            seen.add(aim.zoneDieResult);
        }
        // Over 200 draws every face of a d6 should appear.
        expect(seen.size).toBe(6);
    });

    it("weights the location draw within the chosen part (skull > face)", () => {
        const body = makeBody();
        const counts: Record<string, number> = { skull: 0, face: 0 };
        for (let i = 0; i < 400; i++) {
            const aim = body.aimZone(
                { targetZoneNumber: 1, zoneDie: 1 },
                createRng(`aim-loc-${i}`),
            );
            counts[aim.location!.shortcode]++;
        }
        // skull probWeight 10 vs face 5 -> skull is drawn about twice as often.
        expect(counts.skull).toBeGreaterThan(counts.face);
    });

    it("clamps a target zone number below 1 up to 1 and a zone die below 1 up to 1", () => {
        const body = makeBody();
        const aim = body.aimZone(
            { targetZoneNumber: 0, zoneDie: 0 },
            createRng("aim-clamp"),
        );
        expect(aim.targetZoneNumber).toBe(1);
        expect(aim.zoneDie).toBe(1);
        expect(aim.hitZoneNumber).toBe(1);
        expect(aim.zone?.shortcode).toBe("headzone");
    });
});
