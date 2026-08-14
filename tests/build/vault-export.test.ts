/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
// Build-time export helper (plain ESM, no Foundry). Imported by relative path
// because the build scripts live outside the `@src` alias tree.
import {
    VAULT_CONTENT_DIR,
    isExportable,
    isExportableDir,
    planExport,
    summarize,
} from "../../utils/vault-export.mjs";

describe("vault export — what may leave the vault", () => {
    it("exports the content tree from SoHL/ only", () => {
        expect(VAULT_CONTENT_DIR).toBe("SoHL");
    });

    it("takes markdown notes at any depth", () => {
        expect(isExportable("Armor/Armor/Buckram_Cap.md")).toBe(true);
        expect(isExportable("Rules/Combat/Attack.md")).toBe(true);
        expect(isExportable("README.md")).toBe(true);
    });

    it("takes the per-pack folder manifests", () => {
        for (const p of [
            "item-folders.yaml",
            "actor-folders.yaml",
            "journal-folders.yaml",
            "macro-folders.yaml",
        ]) {
            expect(isExportable(p)).toBe(true);
        }
    });

    it("leaves editor and OS noise behind", () => {
        expect(isExportable(".DS_Store")).toBe(false);
        expect(isExportable("Weapons/.DS_Store")).toBe(false);
        expect(isExportable(".obsidian/workspace.json")).toBe(false);
        expect(isExportable("Armor/.hidden/note.md")).toBe(false);
    });

    it("leaves Obsidian templater scaffolding behind", () => {
        expect(isExportable("Templates/Weapon.md")).toBe(false);
        expect(isExportable("Templates/nested/Armour.md")).toBe(false);
    });

    it("leaves anything that is neither a note nor a manifest behind", () => {
        expect(isExportable("Weapons/diagram.png")).toBe(false);
        expect(isExportable("notes.txt")).toBe(false);
        // A stray yaml that is not a folder manifest stays put.
        expect(isExportable("Armor/metadata.yaml")).toBe(false);
        // A manifest is only a manifest at the tree root.
        expect(isExportable("Armor/item-folders.yaml")).toBe(false);
    });
});

describe("vault export — which directories are walked", () => {
    it("descends the content directories", () => {
        expect(isExportableDir("Armor")).toBe(true);
        expect(isExportableDir("Armor/Armor")).toBe(true);
        expect(isExportableDir("Rules/Combat")).toBe(true);
    });

    it("never opens a dot directory or the templater scaffolding", () => {
        expect(isExportableDir(".obsidian")).toBe(false);
        expect(isExportableDir(".obsidian/plugins")).toBe(false);
        expect(isExportableDir("Templates")).toBe(false);
        expect(isExportableDir("Templates/nested")).toBe(false);
        expect(isExportableDir("Armor/.trash")).toBe(false);
    });
});

describe("vault export — the plan", () => {
    it("writes a note the target does not have", () => {
        const plan = planExport(
            new Map([["Skills/Climbing.md", "a"]]),
            new Map(),
        );
        expect(plan.create).toEqual(["Skills/Climbing.md"]);
        expect(plan.update).toEqual([]);
        expect(plan.remove).toEqual([]);
    });

    it("rewrites a note whose content differs", () => {
        const plan = planExport(
            new Map([["Skills/Climbing.md", "new"]]),
            new Map([["Skills/Climbing.md", "old"]]),
        );
        expect(plan.update).toEqual(["Skills/Climbing.md"]);
        expect(plan.create).toEqual([]);
    });

    it("leaves a byte-identical note alone", () => {
        const plan = planExport(
            new Map([["Skills/Climbing.md", "same"]]),
            new Map([["Skills/Climbing.md", "same"]]),
        );
        expect(plan.unchanged).toEqual(["Skills/Climbing.md"]);
        expect(plan.update).toEqual([]);
    });

    it("removes a target file the vault no longer exports", () => {
        // This is what retires the notes that live only under Setting/: the
        // export is authoritative, so anything it does not produce is stale.
        const plan = planExport(
            new Map(),
            new Map([["Creatures/Mythic/Unicorn.md", "x"]]),
        );
        expect(plan.remove).toEqual(["Creatures/Mythic/Unicorn.md"]);
    });

    it("reports drift when anything would change, and none when clean", () => {
        const clean = planExport(
            new Map([["a.md", "1"]]),
            new Map([["a.md", "1"]]),
        );
        expect(clean.drifted).toBe(false);

        const drifting: [Map<string, string>, Map<string, string>][] = [
            [new Map([["a.md", "1"]]), new Map()],
            [new Map([["a.md", "2"]]), new Map([["a.md", "1"]])],
            [new Map(), new Map([["a.md", "1"]])],
        ];
        for (const [src, dst] of drifting) {
            expect(planExport(src, dst).drifted).toBe(true);
        }
    });

    it("orders every list deterministically, so a report never churns", () => {
        const plan = planExport(
            new Map([
                ["b.md", "x"],
                ["a.md", "x"],
                ["c.md", "x"],
            ]),
            new Map([["z.md", "x"]]),
        );
        expect(plan.create).toEqual(["a.md", "b.md", "c.md"]);
        expect(plan.remove).toEqual(["z.md"]);
    });
});

describe("vault export — refusing to run on nothing", () => {
    it("treats an empty source as a fault, not an empty export", () => {
        // A mistyped vault path would otherwise mirror "nothing" over the
        // content tree and delete all of it, and the build would then ship
        // empty compendiums without a single error.
        expect(() => summarize(planExport(new Map(), new Map()))).toThrow(
            /exported no files/i,
        );
    });

    it("summarizes a real plan without complaint", () => {
        const summary = summarize(
            planExport(
                new Map([
                    ["a.md", "1"],
                    ["b.md", "2"],
                ]),
                new Map([["a.md", "1"]]),
            ),
        );
        expect(summary).toMatch(/1 created/);
        expect(summary).toMatch(/1 unchanged/);
    });
});
