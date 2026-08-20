/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Build-time pack compiler (plain ESM, no Foundry). Imported by relative path
// because the pack-build scripts live outside the `@src` alias tree.
import { Scenes } from "../engine/scenes.mjs";

/**
 * Two map notes of one place, so the pass has something to cross-reference: a
 * stair on the ground floor teleports to a stair on the loft.
 */
const GROUND = `---
name:
  full: Test Ground Floor
id: AAAAAAAAAAAAAAAA
shortcode: testground
type: battlemap
package: sohl
sohl:
  place: testplace
  placeName: Test Place
  image: systems/sohl/assets/ui/parchment.jpg
  dimensions: [512, 512]
  pxPerGrid: 64
  locations:
    common-room: { at: [4, 4] }
  walls:
    shell:
      blocks: [movement, sight]
      segments:
        - [64, 64, 448, 64]
  regions:
    stair-foot:
      name: Stair Foot
      shapes:
        - rect: [352, 352, 96, 96]
      behaviors:
        up:
          teleportToken:
            to: { map: testloft, region: stair-head }
---

Prose before the first heading becomes the map's own page.

# Common Room

A room.
`;

const LOFT = `---
name:
  full: Test Loft
id: BBBBBBBBBBBBBBBB
shortcode: testloft
type: battlemap
package: sohl
sohl:
  place: testplace
  image: systems/sohl/assets/ui/parchment.jpg
  dimensions: [512, 512]
  pxPerGrid: 64
  regions:
    stair-head:
      name: Stair Head
      shapes:
        - rect: [352, 352, 96, 96]
      behaviors:
        down:
          trigger:
            events: [tokenEnter]
---

The loft.
`;

let tmp: string;
let sceneDir: string;
let adventureDir: string;

/** Every emitted document in a directory, by name. */
function read(dir: string): Record<string, any> {
    const out: Record<string, any> = {};
    for (const file of fs.readdirSync(dir)) {
        const doc = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
        out[doc.name] = doc;
    }
    return out;
}

beforeAll(async () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sohl-scenes-"));
    const content = path.join(tmp, "content");
    fs.mkdirSync(content, { recursive: true });
    fs.writeFileSync(path.join(content, "Ground.md"), GROUND);
    fs.writeFileSync(path.join(content, "Loft.md"), LOFT);

    sceneDir = path.join(tmp, "scenes");
    adventureDir = path.join(tmp, "adventures");
    fs.mkdirSync(sceneDir);
    fs.mkdirSync(adventureDir);

    const pack = new Scenes({
        contentBase: content,
        dest: sceneDir,
        companionDests: { adventures: adventureDir },
    });
    await pack.compile();
    expect(pack.errorCount).toBe(0);
});

afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));

describe("the scenes pass", () => {
    it("writes one Scene per map note, each embedded document keyed", () => {
        const scenes = read(sceneDir);
        const ground = scenes["Test Ground Floor"];
        expect(ground._key).toBe("!scenes!AAAAAAAAAAAAAAAA");
        expect(ground.levels[0]._key).toBe(
            "!scenes.levels!AAAAAAAAAAAAAAAA.defaultLevel0000",
        );
        // A missing `_key` fails the compendium compile with "Key cannot be
        // null or undefined", so every embedded document carries one.
        for (const collection of ["walls", "notes", "regions"]) {
            for (const doc of ground[collection]) {
                expect(doc._key, `${collection} key`).toMatch(
                    new RegExp(`^!scenes\\.${collection}!AAAAAAAAAAAAAAAA\\.`),
                );
            }
        }
        for (const region of ground.regions) {
            for (const behavior of region.behaviors) {
                expect(behavior._key).toBe(
                    `!scenes.regions.behaviors!AAAAAAAAAAAAAAAA.${region._id}.${behavior._id}`,
                );
            }
        }
    });

    it("stamps a core version the Level survives being read back at", () => {
        // Foundry's `migrateLevels` rewrites any Scene stamped older than
        // 14.353, discarding an authored Level and its map image without a
        // word (#1533). The stamp comes from the manifest's supported floor.
        const ground = read(sceneDir)["Test Ground Floor"];
        const [major, build = 0] = ground._stats.coreVersion
            .split(".")
            .map(Number);
        expect(major).toBe(14);
        expect(build).toBeGreaterThanOrEqual(353);
    });

    it("resolves a cross-map teleport address to the other scene's region", () => {
        const scenes = read(sceneDir);
        const loft = scenes["Test Loft"];
        const stairHead = loft.regions.find(
            (r: any) => r.name === "Stair Head",
        );
        const teleport = scenes["Test Ground Floor"].regions
            .find((r: any) => r.name === "Stair Foot")
            .behaviors.find((b: any) => b.type === "teleportToken");
        expect(teleport.system.destinations).toEqual([
            `Scene.BBBBBBBBBBBBBBBB.Region.${stairHead._id}`,
        ]);
    });

    it("bundles the place's scenes and journals into one Adventure", () => {
        const adventures = read(adventureDir);
        const adventure = adventures["Test Place"];
        expect(adventure._key).toMatch(/^!adventures!/);
        expect(adventure.scenes.map((s: any) => s._id).sort()).toEqual([
            "AAAAAAAAAAAAAAAA",
            "BBBBBBBBBBBBBBBB",
        ]);
        expect(adventure.journal).toHaveLength(2);
        // Inline members are source data in a SetField, not sublevel documents.
        expect(JSON.stringify(adventure.scenes)).not.toContain("_key");
        expect(JSON.stringify(adventure.journal)).not.toContain("_key");
    });

    it("points each pin at a page the bundled journal actually holds", () => {
        const ground = read(sceneDir)["Test Ground Floor"];
        const adventure = read(adventureDir)["Test Place"];
        const entry = adventure.journal.find(
            (j: any) => j._id === ground.journal,
        );
        const pageIds = entry.pages.map((p: any) => p._id);
        expect(ground.notes).toHaveLength(1);
        expect(pageIds).toContain(ground.notes[0].pageId);
        expect(
            entry.pages.find((p: any) => p._id === ground.notes[0].pageId).name,
        ).toBe("Common Room");
    });
});
