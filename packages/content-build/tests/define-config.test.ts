/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import path from "node:path";
// The package's own entry point and configuration contract.
import { defineConfig } from "../index.mjs";
import type { ContentBuildConfigInput, PackSpec } from "../config.mjs";

/** The smallest configuration `defineConfig` accepts. */
function minimal(): ContentBuildConfigInput {
    return {
        rootDir: "/repo",
        contentPackage: "sohl",
        foundryPackage: "sohl",
        packageKind: "systems",
        stats: {
            systemId: "sohl",
            systemVersion: "0.6.0",
            lastModifiedBy: "sohlbuilder00000",
        },
        packs: [{ name: "items", type: "Item" }],
    };
}

describe("defineConfig", () => {
    it("returns a config carrying every field it was given", () => {
        const config = defineConfig({
            ...minimal(),
            assets: [{ from: "assets/icons", to: "assets/icons" }],
            publish: {
                site: true,
                manifests: { publish: true, consume: false },
            },
        });

        expect(config.contentPackage).toBe("sohl");
        expect(config.foundryPackage).toBe("sohl");
        expect(config.packageKind).toBe("systems");
        // `label` defaults to the pack name and `private` to false; a pack
        // declares no folder file and no companion unless it has one.
        expect(config.packs).toEqual([
            {
                name: "items",
                type: "Item",
                label: "items",
                private: false,
                folders: null,
                companions: [],
                mayBeEmpty: false,
            },
        ]);
        expect(config.assets).toEqual([
            { from: "assets/icons", to: "assets/icons" },
        ]);
        expect(config.publish).toEqual({
            site: true,
            manifests: { publish: true, consume: false },
        });
    });

    it("defaults the asset list to empty and every publishing switch to off", () => {
        const config = defineConfig(minimal());

        expect(config.assets).toEqual([]);
        expect(config.publish).toEqual({
            site: false,
            manifests: { publish: false, consume: false },
        });
    });

    it("treats the three publishing switches as independent", () => {
        // `kethira` publishes neither a site nor a manifest, but still consumes
        // manifests (#1385/#1446) — the shape must express exactly that.
        const config = defineConfig({
            ...minimal(),
            publish: { manifests: { consume: true } },
        });

        expect(config.publish.site).toBe(false);
        expect(config.publish.manifests.publish).toBe(false);
        expect(config.publish.manifests.consume).toBe(true);
    });

    it("freezes the returned config, deeply", () => {
        const config = defineConfig(minimal());

        expect(Object.isFrozen(config)).toBe(true);
        expect(Object.isFrozen(config.publish)).toBe(true);
        expect(Object.isFrozen(config.publish.manifests)).toBe(true);
        expect(Object.isFrozen(config.packs)).toBe(true);
        expect(Object.isFrozen(config.packs[0])).toBe(true);
        expect(Object.isFrozen(config.assets)).toBe(true);
    });

    it("copies the input so later mutation cannot reach the config", () => {
        const input = minimal();
        const config = defineConfig(input);
        const extra: PackSpec = { name: "actors", type: "Actor" };
        input.packs.push(extra);

        expect(config.packs).toHaveLength(1);
    });

    it.each<[string, unknown]>([
        ["no config at all", undefined],
        ["a non-object config", "sohl"],
        ["a missing contentPackage", { ...minimal(), contentPackage: "" }],
        ["a missing foundryPackage", { ...minimal(), foundryPackage: "  " }],
        ["an unknown packageKind", { ...minimal(), packageKind: "worlds" }],
        ["a non-array pack list", { ...minimal(), packs: "items" }],
        ["a pack with no name", { ...minimal(), packs: [{ type: "Item" }] }],
        [
            "a pack with an unknown document type",
            { ...minimal(), packs: [{ name: "items", type: "Widget" }] },
        ],
        [
            "two packs sharing a name",
            {
                ...minimal(),
                packs: [
                    { name: "items", type: "Item" },
                    { name: "items", type: "Actor" },
                ],
            },
        ],
        ["a missing rootDir", { ...minimal(), rootDir: undefined }],
        ["a relative rootDir", { ...minimal(), rootDir: "packages/x" }],
        ["a missing stats block", { ...minimal(), stats: undefined }],
        [
            "a stats block with no systemId",
            {
                ...minimal(),
                stats: { systemVersion: "1", lastModifiedBy: "a" },
            },
        ],
        ["a non-object paths block", { ...minimal(), paths: "build" }],
        ["an unknown path key", { ...minimal(), paths: { nope: "build" } }],
        [
            "an absolute configured path",
            { ...minimal(), paths: { content: "/etc/content" } },
        ],
        [
            "a non-array skipDirectories",
            { ...minimal(), skipDirectories: "Templates" },
        ],
        [
            "a companion with no document type",
            {
                ...minimal(),
                packs: [
                    {
                        name: "scenes",
                        type: "Scene",
                        companions: [{ name: "adventures" }],
                    },
                ],
            },
        ],
        [
            "a companion colliding with a pack name",
            {
                ...minimal(),
                packs: [
                    { name: "items", type: "Item" },
                    {
                        name: "scenes",
                        type: "Scene",
                        companions: [{ name: "items", type: "Adventure" }],
                    },
                ],
            },
        ],
        ["a non-array asset list", { ...minimal(), assets: {} }],
        [
            "an asset with no destination",
            { ...minimal(), assets: [{ from: "assets/icons" }] },
        ],
        [
            "a non-boolean publishing switch",
            { ...minimal(), publish: { site: "yes" } },
        ],
        ["an unknown key", { ...minimal(), publishSite: true }],
    ])("rejects %s", (_label, input) => {
        expect(() => defineConfig(input as ContentBuildConfigInput)).toThrow(
            TypeError,
        );
    });

    it("names the offending field in the error message", () => {
        expect(() =>
            defineConfig({
                ...minimal(),
                packageKind: "worlds",
            } as unknown as ContentBuildConfigInput),
        ).toThrow(/packageKind/);
    });
});

describe("defineConfig — the layout a consumer supplies (#1508)", () => {
    it("defaults every path to the conventional repository layout", () => {
        const config = defineConfig(minimal());

        expect(config.paths).toEqual({
            content: path.join("/repo", "assets/content"),
            packageManifest: path.join("/repo", "assets/templates"),
            manifests: path.join("/repo", "assets/manifests"),
            packJson: path.join("/repo", "build/packs-json"),
            stage: path.join("/repo", "build/stage/packs"),
            unpack: path.join("/repo", "build/tmp/packs"),
        });
    });

    it("resolves a consumer's overrides against its own root", () => {
        // The point of the hoist: a consuming repository supplies its layout
        // instead of inheriting this one's.
        const config = defineConfig({
            ...minimal(),
            rootDir: "/elsewhere",
            paths: { content: "content", stage: "dist/packs" },
        });

        expect(config.paths.content).toBe(path.join("/elsewhere", "content"));
        expect(config.paths.stage).toBe(path.join("/elsewhere", "dist/packs"));
        // Unnamed paths keep the convention, anchored at the same root.
        expect(config.paths.packJson).toBe(
            path.join("/elsewhere", "build/packs-json"),
        );
    });

    it("derives the served asset root from the package kind and id", () => {
        expect(defineConfig(minimal()).assetRoot).toBe("systems/sohl/assets");
        expect(
            defineConfig({
                ...minimal(),
                foundryPackage: "sohl-thalorna",
                packageKind: "modules",
            }).assetRoot,
        ).toBe("modules/sohl-thalorna/assets");
    });

    it("derives one pack-directory list from the one pack list", () => {
        // `SOURCE_PACKS` and `PACK_CONFIGS` were two lists that had to agree;
        // the compile order is now derived from the single declaration.
        const config = defineConfig({
            ...minimal(),
            packs: [
                { name: "items", type: "Item", folders: "item-folders.yaml" },
                {
                    name: "scenes",
                    type: "Scene",
                    companions: [{ name: "adventures", type: "Adventure" }],
                },
            ],
        });

        expect(config.packDirectories).toEqual([
            "items",
            "scenes",
            "adventures",
        ]);
        expect(config.packs[0].folders).toBe("item-folders.yaml");
        expect(config.packs[1].companions).toEqual([
            {
                name: "adventures",
                type: "Adventure",
                label: "adventures",
                private: false,
                folders: null,
                companions: [],
                mayBeEmpty: false,
            },
        ]);
    });

    it("defaults the skipped-directory list to empty", () => {
        // `Templates/` is an Obsidian convention, not a property of the
        // toolchain — a consumer that uses it says so.
        expect(defineConfig(minimal()).skipDirectories).toEqual([]);
        expect(
            defineConfig({ ...minimal(), skipDirectories: ["Templates"] })
                .skipDirectories,
        ).toEqual(["Templates"]);
    });

    it("carries no Foundry core version — only where to read it from", () => {
        // The manifest's `compatibility.minimum` moves with test evidence; a
        // captured copy would silently stop following it.
        expect(JSON.stringify(defineConfig(minimal()))).not.toMatch(
            /compatibility|coreVersion/,
        );
    });

    it("freezes the added blocks too", () => {
        const config = defineConfig(minimal());
        expect(Object.isFrozen(config.paths)).toBe(true);
        expect(Object.isFrozen(config.stats)).toBe(true);
        expect(Object.isFrozen(config.skipDirectories)).toBe(true);
        expect(Object.isFrozen(config.packDirectories)).toBe(true);
    });
});

describe("the package barrels", () => {
    it("exposes the engine and sohl namespaces", async () => {
        const pkg = await import("../index.mjs");

        expect(pkg.engine).toBeTypeOf("object");
        expect(pkg.sohl).toBeTypeOf("object");
    });
});
