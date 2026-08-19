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
// The shared content-build toolchain is a workspace package consumed by path;
// imported relatively here for the same reason `tests/utils/packs/*` import the
// pack scripts by path — build tooling lives outside the `@src` alias tree.
import { defineConfig } from "../../../packages/content-build/index.mjs";
import type {
    ContentBuildConfigInput,
    PackSpec,
} from "../../../packages/content-build/config.mjs";

/** The smallest configuration `defineConfig` accepts. */
function minimal(): ContentBuildConfigInput {
    return {
        contentPackage: "sohl",
        foundryPackage: "sohl",
        packageKind: "systems",
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
        // `label` defaults to the pack name and `private` to false.
        expect(config.packs).toEqual([
            { name: "items", type: "Item", label: "items", private: false },
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

describe("the package barrels", () => {
    it("exposes the engine and sohl namespaces", async () => {
        const pkg = await import("../../../packages/content-build/index.mjs");

        expect(pkg.engine).toBeTypeOf("object");
        expect(pkg.sohl).toBeTypeOf("object");
    });
});
