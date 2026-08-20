/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
// Build-time pack helpers (plain ESM, no Foundry). Imported by relative path
// because the pack-build scripts live outside the `@src` alias tree.
import {
    BANNED_REGION_BEHAVIOR_TYPES,
    DEFAULT_LEVEL_ID,
    MAP_TYPES,
    REGION_BEHAVIOR_TYPES,
    behaviorDocId,
    buildScene,
    buildShape,
    isMapType,
    mapProfile,
    regionColor,
    regionDocId,
    wallRestrictions,
} from "../../../utils/packs/map-notes.mjs";
import {
    DOC_ENTRY_TYPES,
    hasDocEntry,
} from "../../../utils/packs/item-docs.mjs";

const SCENE_ID = "AAAAAAAAAAAAAAAA";

// The pack helpers are plain ESM whose JSDoc types the returns as `object`, so
// these thin wrappers keep the assertions below readable.
const buildSceneDoc = (fm: unknown, ctx: unknown): any =>
    buildScene(fm as any, ctx as any);
const profileOf = (type: string): any => mapProfile(type);

/** A minimal, valid map note: 1900x2600 at 100px/grid. */
function makeNote(sohl: Record<string, unknown> = {}) {
    return {
        name: { full: "Ambush at the Defile" },
        id: SCENE_ID,
        shortcode: "ambushdefile",
        type: "battlemap",
        package: "sohl",
        sohl: {
            image: "systems/sohl/assets/ui/parchment.jpg",
            dimensions: [1900, 2600],
            pxPerGrid: 100,
            ...sohl,
        },
    };
}

/** The context a compiled scene needs from the surrounding passes. */
function makeCtx(over: Record<string, unknown> = {}) {
    return {
        packageId: "sohl",
        journalEntryId: "JJJJJJJJJJJJJJJJ",
        pageIds: new Map([["gatehouse", "PPPPPPPPPPPPPPPP"]]),
        resolveRegionRef: () =>
            "Scene.OTHEROTHEROTHER1.Region.RRRRRRRRRRRRRRRR",
        resolveBehaviorRef: () =>
            "Scene.OTHEROTHEROTHER1.Region.RRRRRRRRRRRRRRRR.RegionBehavior.BBBBBBBBBBBBBBBB",
        resolveEffectRef: () =>
            "Compendium.sohl.items.Item.IIIIIIIIIIIIIIII.ActiveEffect.EEEEEEEEEEEEEEEE",
        knownActions: new Set(["fearTest"]),
        warnings: [] as string[],
        ...over,
    };
}

describe("map note types", () => {
    it("recognises the three map types and nothing else", () => {
        expect([...MAP_TYPES].sort()).toEqual([
            "battlemap",
            "localmap",
            "regionalmap",
        ]);
        expect(isMapType("battlemap")).toBe(true);
        expect(isMapType("skill")).toBe(false);
        expect(isMapType(undefined)).toBe(false);
    });

    it("emits grid, vision, fog and padding explicitly per type", () => {
        // `grid.type` / `distance` / `units` declare `initial: () => game.…`,
        // and there is no `game` at build time — they must be spelled out.
        const battle = profileOf("battlemap");
        expect(battle.grid.type).toBe(1); // SQUARE
        expect(battle.grid.distance).toBe(5);
        expect(battle.grid.units).toBe("ft");
        expect(battle.tokenVision).toBe(true);
        expect(battle.fog.mode).toBe(1); // INDIVIDUAL

        const regional = profileOf("regionalmap");
        expect(regional.grid.type).toBe(0); // GRIDLESS
        expect(regional.tokenVision).toBe(false);
        expect(regional.fog.mode).toBe(0); // DISABLED
        expect(regional.padding).toBe(0);

        expect(profileOf("localmap").grid.units).toBe("m");
    });

    it("fails loudly on an unknown map type", () => {
        expect(() => profileOf("dungeonmap")).toThrow(/unknown map type/i);
    });

    it("is one of the doc-carrying types, so its prose gets a JournalEntry", () => {
        // A map note is the same one-note-two-documents shape as an item or a
        // macro (#1514), so it goes through the shared set rather than a
        // parallel mechanism of its own.
        for (const type of MAP_TYPES) {
            expect(hasDocEntry(type), type).toBe(true);
            expect(DOC_ENTRY_TYPES.has(type), type).toBe(true);
        }
    });
});

describe("wall restrictions (blocks / limits, never Foundry's raw vocabulary)", () => {
    it("blocks maps to NORMAL and everything unnamed to NONE", () => {
        expect(
            wallRestrictions({ blocks: ["movement", "sight"] }, "walls.outer"),
        ).toEqual({ move: 20, sight: 20, light: 0, sound: 0 });
    });

    it("limits maps to LIMITED", () => {
        expect(
            wallRestrictions(
                { blocks: ["movement"], limits: ["sight", "light"] },
                "walls.hedge",
            ),
        ).toEqual({ move: 20, sight: 10, light: 10, sound: 0 });
    });

    it("rejects a limited movement restriction — movement is binary", () => {
        expect(() =>
            wallRestrictions({ limits: ["movement"] }, "walls.x"),
        ).toThrow(/movement/i);
    });

    it("rejects an unknown sense name", () => {
        expect(() =>
            wallRestrictions({ blocks: ["vision"] }, "walls.x"),
        ).toThrow(/vision/);
    });

    it("rejects a sense named in both blocks and limits", () => {
        expect(() =>
            wallRestrictions(
                { blocks: ["sight"], limits: ["sight"] },
                "walls.x",
            ),
        ).toThrow(/both/i);
    });
});

describe("region shapes", () => {
    const geom = {
        label: "regions.crypt",
        pxPerGrid: 100,
        dimensions: [1900, 2600],
    };

    it("compiles a rectangle from [x, y, w, h]", () => {
        expect(buildShape({ rectangle: [1400, 1800, 300, 200] }, geom)).toEqual(
            {
                type: "rectangle",
                x: 1400,
                y: 1800,
                width: 300,
                height: 200,
                hole: false,
            },
        );
    });

    it("compiles a circle and an ellipse", () => {
        expect(buildShape({ circle: [1500, 600, 250] }, geom)).toEqual({
            type: "circle",
            x: 1500,
            y: 600,
            radius: 250,
            hole: false,
        });
        expect(
            buildShape({ ellipse: [1500, 1400, 300, 200, 30] }, geom),
        ).toEqual({
            type: "ellipse",
            x: 1500,
            y: 1400,
            radiusX: 300,
            radiusY: 200,
            rotation: 30,
            hole: false,
        });
    });

    it("compiles a polygon and honours `hole`", () => {
        const shape = buildShape(
            { polygon: [400, 400, 1200, 400, 1200, 1100], hole: true },
            geom,
        );
        expect(shape).toEqual({
            type: "polygon",
            points: [400, 400, 1200, 400, 1200, 1100],
            hole: true,
        });
    });

    it("rejects a degenerate two-point polygon the schema would accept", () => {
        // The schema's floor is 4 numbers, which admits a line segment.
        expect(() =>
            buildShape({ polygon: [400, 400, 1200, 400] }, geom),
        ).toThrow(/at least 3 points/i);
    });

    it("rejects a shape type outside the authored four", () => {
        expect(() => buildShape({ cone: [1, 2, 3] }, geom)).toThrow(/cone/);
    });

    it("rejects geometry authored in grid units", () => {
        // 12x11 grid squares reads as a 12x11-pixel region in the top-left.
        expect(() => buildShape({ rectangle: [4, 4, 12, 11] }, geom)).toThrow(
            /grid units/i,
        );
    });
});

describe("region colour", () => {
    it("derives deterministically from the region key", () => {
        expect(regionColor("crypt-interior")).toMatch(/^#[0-9a-f]{6}$/);
        expect(regionColor("crypt-interior")).toBe(
            regionColor("crypt-interior"),
        );
        expect(regionColor("crypt-interior")).not.toBe(
            regionColor("courtyard"),
        );
    });
});

describe("embedded document ids", () => {
    it("derives a region id from the scene and key, and honours a pin", () => {
        const derived = regionDocId(SCENE_ID, "crypt");
        expect(derived).toMatch(/^[0-9a-f]{16}$/);
        expect(regionDocId(SCENE_ID, "crypt")).toBe(derived);
        expect(regionDocId(SCENE_ID, "courtyard")).not.toBe(derived);
        expect(regionDocId(SCENE_ID, "crypt", "24H57h9Us6Fyg8wp")).toBe(
            "24H57h9Us6Fyg8wp",
        );
    });

    it("derives a behaviour id from its region and key", () => {
        const rid = regionDocId(SCENE_ID, "crypt");
        expect(behaviorDocId(rid, "dread")).not.toBe(
            behaviorDocId(rid, "gloom"),
        );
        expect(behaviorDocId(rid, "dread", "pAmeKn8CPUaDdPQe")).toBe(
            "pAmeKn8CPUaDdPQe",
        );
    });
});

describe("buildScene — the whole document", () => {
    it("synthesises exactly one inline Level from image/overlay and names it initial", () => {
        const scene = buildSceneDoc(
            makeNote({ overlay: "systems/sohl/assets/ui/parchment.jpg" }),
            makeCtx(),
        );
        expect(scene.levels).toHaveLength(1);
        const [level] = scene.levels;
        expect(level._id).toBe(DEFAULT_LEVEL_ID);
        expect(level.background.src).toBe(
            "systems/sohl/assets/ui/parchment.jpg",
        );
        expect(level.foreground.src).toBe(
            "systems/sohl/assets/ui/parchment.jpg",
        );
        expect(scene.initialLevel).toBe(DEFAULT_LEVEL_ID);
        // Every embedded document carries its own `_key`, or the compile fails
        // with "Key cannot be null or undefined".
        expect(level._key).toBe(
            `!scenes.levels!${SCENE_ID}.${DEFAULT_LEVEL_ID}`,
        );
        expect(scene._key).toBe(`!scenes!${SCENE_ID}`);
    });

    it("carries the stats it is given, with no scene-only special case", () => {
        // The core-version stamp is the packs' business, not a map note's: it
        // is derived once from the manifest's supported floor (#1533), so a
        // scene has nothing to correct here.
        const stats = { systemId: "sohl", coreVersion: "14.359" };
        const scene = buildSceneDoc(makeNote(), makeCtx({ stats }));
        expect(scene._stats).toEqual(stats);
    });

    it("emits the per-type canvas defaults explicitly", () => {
        const scene = buildSceneDoc(makeNote(), makeCtx());
        expect(scene.width).toBe(1900);
        expect(scene.height).toBe(2600);
        expect(scene.grid).toMatchObject({
            type: 1,
            size: 100,
            distance: 5,
            units: "ft",
        });
        expect(scene.tokenVision).toBe(true);
        expect(scene.fog.mode).toBe(1);
        expect(scene.padding).toBe(0.25);
    });

    it("points at its journal through a flag, since Scene.journal nulls in a pack", () => {
        const scene = buildSceneDoc(makeNote(), makeCtx());
        expect(scene.journal).toBe("JJJJJJJJJJJJJJJJ");
        expect(scene.flags.sohl.docUuid).toContain("JJJJJJJJJJJJJJJJ");
    });

    it("compiles walls and doors, each with its own key", () => {
        const scene = buildSceneDoc(
            makeNote({
                walls: {
                    outer: {
                        blocks: ["movement", "sight", "light", "sound"],
                        segments: [
                            [100, 100, 900, 100],
                            [900, 100, 900, 800],
                        ],
                    },
                },
                doors: {
                    postern: {
                        kind: "door",
                        blocks: ["movement", "sight"],
                        segment: [900, 400, 900, 500],
                    },
                },
            }),
            makeCtx(),
        );
        expect(scene.walls).toHaveLength(3);
        expect(scene.walls[0]).toMatchObject({
            c: [100, 100, 900, 100],
            move: 20,
            sight: 20,
            door: 0,
        });
        const door = scene.walls.find((w: any) => w.door === 1);
        expect(door).toMatchObject({
            c: [900, 400, 900, 500],
            ds: 0,
            sound: 0,
        });
        for (const wall of scene.walls) {
            expect(wall._key).toBe(`!scenes.walls!${SCENE_ID}.${wall._id}`);
        }
    });

    it("rejects wall geometry authored in grid units", () => {
        expect(() =>
            buildSceneDoc(
                makeNote({
                    walls: {
                        outer: {
                            blocks: ["movement"],
                            segments: [[1, 1, 9, 1]],
                        },
                    },
                }),
                makeCtx(),
            ),
        ).toThrow(/grid units/i);
    });

    it("compiles lights, tiles and ambient sounds losslessly", () => {
        const scene = buildSceneDoc(
            makeNote({
                lights: {
                    fireplace: {
                        position: [1675, 1459],
                        dim: 30,
                        bright: 15,
                        color: "#ff9329",
                    },
                },
                tiles: {
                    oak: {
                        position: [400, 500],
                        size: [200, 200],
                        image: "systems/sohl/assets/ui/parchment.jpg",
                    },
                },
                sounds: {
                    river: {
                        position: [800, 1200],
                        radius: 40,
                        path: "systems/sohl/assets/audio/swoosh1.ogg",
                        volume: 0.4,
                    },
                },
            }),
            makeCtx(),
        );
        expect(scene.lights[0]).toMatchObject({
            x: 1675,
            y: 1459,
            config: { dim: 30, bright: 15, color: "#ff9329" },
        });
        expect(scene.tiles[0]).toMatchObject({
            x: 400,
            y: 500,
            width: 200,
            height: 200,
        });
        expect(scene.tiles[0].texture.src).toBe(
            "systems/sohl/assets/ui/parchment.jpg",
        );
        expect(scene.sounds[0]).toMatchObject({
            x: 800,
            y: 1200,
            radius: 40,
            path: "systems/sohl/assets/audio/swoosh1.ogg",
            volume: 0.4,
        });
        expect(scene.lights[0]._key).toBe(
            `!scenes.lights!${SCENE_ID}.${scene.lights[0]._id}`,
        );
        expect(scene.sounds[0]._key).toBe(
            `!scenes.sounds!${SCENE_ID}.${scene.sounds[0]._id}`,
        );
    });

    it("compiles locations to Notes on the matching heading's journal page", () => {
        const scene = buildSceneDoc(
            makeNote({ locations: { gatehouse: { at: [12.5, 7.5] } } }),
            makeCtx(),
        );
        expect(scene.notes).toHaveLength(1);
        expect(scene.notes[0]).toMatchObject({
            x: 1250,
            y: 750,
            entryId: "JJJJJJJJJJJJJJJJ",
            pageId: "PPPPPPPPPPPPPPPP",
        });
        expect(scene.notes[0]._key).toBe(
            `!scenes.notes!${SCENE_ID}.${scene.notes[0]._id}`,
        );
    });

    it("fails when a location names no body heading", () => {
        expect(() =>
            buildSceneDoc(
                makeNote({ locations: { nowhere: { at: [3, 3] } } }),
                makeCtx(),
            ),
        ).toThrow(/heading/i);
    });

    it("rejects a location authored in pixels", () => {
        expect(() =>
            buildSceneDoc(
                makeNote({ locations: { gatehouse: { at: [1250, 750] } } }),
                makeCtx(),
            ),
        ).toThrow(/pixels/i);
    });
});

describe("buildScene — regions", () => {
    const withRegion = (region: Record<string, unknown>) =>
        makeNote({ regions: { crypt: region } });

    const simple = {
        name: "The Crypt",
        shapes: [{ polygon: [400, 400, 1200, 400, 1200, 1100] }],
    };

    it("compiles a region with derived colour, visibility and elevation", () => {
        const scene = buildSceneDoc(withRegion(simple), makeCtx());
        expect(scene.regions).toHaveLength(1);
        const [region] = scene.regions;
        expect(region.name).toBe("The Crypt");
        expect(region.color).toBe(regionColor("crypt"));
        expect(region.visibility).toBe(4); // LAYER_UNLOCKED
        expect(region.elevation).toEqual({ bottom: null, top: null });
        // `levels: []` means "all levels" — never authored, never emitted.
        expect(region.levels).toBeUndefined();
        expect(region._key).toBe(`!scenes.regions!${SCENE_ID}.${region._id}`);
    });

    it("compiles visibility by name and elevation as [bottom, top]", () => {
        const scene = buildSceneDoc(
            withRegion({
                ...simple,
                visibility: "gamemaster",
                elevation: [0, null],
            }),
            makeCtx(),
        );
        expect(scene.regions[0].visibility).toBe(1); // GAMEMASTER
        expect(scene.regions[0].elevation).toEqual({ bottom: 0, top: null });
    });

    it("rejects an unknown visibility name", () => {
        expect(() =>
            buildSceneDoc(
                withRegion({ ...simple, visibility: "secret" }),
                makeCtx(),
            ),
        ).toThrow(/visibility/i);
    });

    it("emits exactly one level when `restrict:` is authored", () => {
        const scene = buildSceneDoc(
            withRegion({ ...simple, restrict: "move" }),
            makeCtx(),
        );
        expect(scene.regions[0].restriction).toEqual({
            enabled: true,
            type: "move",
            priority: 0,
        });
        expect(scene.regions[0].levels).toEqual([DEFAULT_LEVEL_ID]);
    });

    it("rejects an unknown restriction type", () => {
        expect(() =>
            buildSceneDoc(
                withRegion({ ...simple, restrict: "thought" }),
                makeCtx(),
            ),
        ).toThrow(/restrict/i);
    });

    it("rejects a region with no shapes", () => {
        expect(() =>
            buildSceneDoc(withRegion({ name: "Empty", shapes: [] }), makeCtx()),
        ).toThrow(/at least one shape/i);
    });
});

describe("buildScene — region behaviours", () => {
    const region = (behaviors: Record<string, unknown>) =>
        makeNote({
            regions: {
                crypt: {
                    name: "The Crypt",
                    shapes: [{ polygon: [400, 400, 1200, 400, 1200, 1100] }],
                    behaviors,
                },
            },
        });

    it("compiles the SoHL trigger bridge, mapping `action` to actionName", () => {
        const scene = buildSceneDoc(
            region({
                dread: {
                    trigger: {
                        events: ["tokenEnter", "tokenExit"],
                        action: "fearTest",
                    },
                },
            }),
            makeCtx(),
        );
        const [behavior] = scene.regions[0].behaviors;
        expect(behavior.type).toBe("trigger");
        expect(behavior.system).toEqual({
            events: ["tokenEnter", "tokenExit"],
            actionName: "fearTest",
        });
        expect(behavior._key).toBe(
            `!scenes.regions.behaviors!${SCENE_ID}.${scene.regions[0]._id}.${behavior._id}`,
        );
    });

    it("omitting `action` is forward-only, not a blank name", () => {
        const scene = buildSceneDoc(
            region({ dread: { trigger: { events: ["tokenEnter"] } } }),
            makeCtx(),
        );
        expect(scene.regions[0].behaviors[0].system.actionName).toBeNull();
    });

    it("rejects an event outside the curated set, naming the excluded ones", () => {
        let message = "";
        try {
            buildSceneDoc(
                region({ dread: { trigger: { events: ["tokenMoveWithin"] } } }),
                makeCtx(),
            );
        } catch (err) {
            message = (err as Error).message;
        }
        expect(message).toMatch(/tokenMoveWithin/);
        expect(message).toMatch(/excluded/i);
        expect(message).toMatch(/tokenEnter/);
    });

    it("warns on an action naming no known SoHL action", () => {
        const ctx = makeCtx();
        buildSceneDoc(
            region({
                dread: {
                    trigger: { events: ["tokenEnter"], action: "wibble" },
                },
            }),
            ctx,
        );
        expect(ctx.warnings.join("\n")).toMatch(/wibble/);
    });

    it("compiles a core behaviour off the allowlist, its mode authored by name", () => {
        const scene = buildSceneDoc(
            region({
                gloom: {
                    adjustDarknessLevel: { mode: "darken", modifier: 0.5 },
                },
            }),
            makeCtx(),
        );
        expect(scene.regions[0].behaviors[0]).toMatchObject({
            type: "adjustDarknessLevel",
            system: { mode: 2, modifier: 0.5 },
        });
    });

    it("rejects an unknown darkness mode", () => {
        expect(() =>
            buildSceneDoc(
                region({ gloom: { adjustDarknessLevel: { mode: "dim" } } }),
                makeCtx(),
            ),
        ).toThrow(/darkness mode/i);
    });

    it("resolves a teleport destination from an address, never a UUID", () => {
        const scene = buildSceneDoc(
            region({
                up: {
                    teleportToken: {
                        to: { map: "manorsolar", region: "stair-landing" },
                    },
                },
            }),
            makeCtx(),
        );
        expect(scene.regions[0].behaviors[0].system.destinations).toEqual([
            "Scene.OTHEROTHEROTHER1.Region.RRRRRRRRRRRRRRRR",
        ]);
    });

    it("resolves toggleBehavior enable/disable from addresses", () => {
        const scene = buildSceneDoc(
            region({
                latch: {
                    toggleBehavior: {
                        events: ["tokenEnter"],
                        enable: [
                            {
                                map: "manorsolar",
                                region: "hall",
                                behavior: "gloom",
                            },
                        ],
                    },
                },
            }),
            makeCtx(),
        );
        expect(scene.regions[0].behaviors[0].system.enable).toEqual([
            "Scene.OTHEROTHEROTHER1.Region.RRRRRRRRRRRRRRRR.RegionBehavior.BBBBBBBBBBBBBBBB",
        ]);
    });

    it("refuses executeScript outright — data may not carry code", () => {
        expect(BANNED_REGION_BEHAVIOR_TYPES.has("executeScript")).toBe(true);
        expect(() =>
            buildSceneDoc(
                region({ evil: { executeScript: { source: "1+1" } } }),
                makeCtx(),
            ),
        ).toThrow(/executeScript/);
    });

    it("rejects a behaviour type off the allowlist", () => {
        expect(REGION_BEHAVIOR_TYPES.has("modifyMovementCost")).toBe(true);
        expect(REGION_BEHAVIOR_TYPES.has("increaseMovementCost")).toBe(false);
        expect(() =>
            buildSceneDoc(
                region({ slow: { increaseMovementCost: {} } }),
                makeCtx(),
            ),
        ).toThrow(/increaseMovementCost/);
    });

    it("rejects a behaviour entry naming no behaviour type", () => {
        expect(() => buildSceneDoc(region({ empty: {} }), makeCtx())).toThrow(
            /exactly one behaviour type/i,
        );
    });
});
