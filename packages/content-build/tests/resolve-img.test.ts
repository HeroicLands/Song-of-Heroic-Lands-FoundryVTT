/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
// Build-time pack helper (plain ESM, no Foundry). Imported by relative path
// because the pack-build scripts live outside the `@src` alias tree.
import { resolveImg } from "../engine/helpers.mjs";
import { defineConfig } from "../index.mjs";

describe("resolveImg (content → Foundry img path translation, #890)", () => {
    it("prefixes a bundled `icons/` path with the system asset root", () => {
        expect(resolveImg("icons/game-icons/lorc/monkey.svg")).toBe(
            "systems/sohl/assets/icons/game-icons/lorc/monkey.svg",
        );
        expect(resolveImg("icons/other/sword.svg")).toBe(
            "systems/sohl/assets/icons/other/sword.svg",
        );
    });

    it("prefixes a bundled `images/` path with the same asset root", () => {
        expect(resolveImg("images/creatures/dragon.webp")).toBe(
            "systems/sohl/assets/images/creatures/dragon.webp",
        );
    });

    it("leaves an already system-rooted path unchanged", () => {
        const p = "systems/sohl/assets/icons/game-icons/lorc/monkey.svg";
        expect(resolveImg(p)).toBe(p);
    });

    it("passes through any other rooted path unchanged (module, URL)", () => {
        expect(resolveImg("modules/foo/bar.webp")).toBe("modules/foo/bar.webp");
        expect(resolveImg("https://example.com/a.png")).toBe(
            "https://example.com/a.png",
        );
    });

    it("returns an empty string for an empty, null, or undefined path", () => {
        // Translation only — each builder applies its own per-type default to
        // an empty result (actors → being, items → per-type / miscgear).
        expect(resolveImg("")).toBe("");
        expect(resolveImg(undefined)).toBe("");
        expect(resolveImg(null)).toBe("");
    });
});

describe("resolveImg for a non-`sohl` consumer (#1508)", () => {
    /** A module repository's configuration — the case the hoist exists for. */
    const moduleConfig = defineConfig({
        rootDir: "/tmp/sohl-thalorna",
        contentPackage: "thalorna",
        foundryPackage: "sohl-thalorna",
        packageKind: "modules",
        stats: {
            systemId: "sohl",
            systemVersion: "0.1.0",
            lastModifiedBy: "thalornabuild000",
        },
        packs: [{ name: "items", type: "Item" }],
    });

    it("emits `modules/<id>/assets/…` for a module package", () => {
        // Foundry installs a module under `modules/`, so the same content path
        // has to resolve to a different served root. Nothing but configuration
        // decides which.
        expect(
            resolveImg("icons/game-icons/lorc/monkey.svg", moduleConfig),
        ).toBe("modules/sohl-thalorna/assets/icons/game-icons/lorc/monkey.svg");
        expect(resolveImg("images/maps/keep.webp", moduleConfig)).toBe(
            "modules/sohl-thalorna/assets/images/maps/keep.webp",
        );
    });

    it("still leaves an already-rooted path alone", () => {
        const p = "modules/sohl-thalorna/assets/icons/other/sword.svg";
        expect(resolveImg(p, moduleConfig)).toBe(p);
        expect(resolveImg("", moduleConfig)).toBe("");
    });
});
