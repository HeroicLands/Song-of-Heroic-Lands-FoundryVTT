/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Build-time helper (plain ESM, no Foundry). Imported by relative path
// because the build scripts live outside the `@src` alias tree.
import { injectAdaptiveFill } from "../../utils/svg-theme.mjs";
import { ItemMetadatas, ActorMetadatas } from "@src/utils/constants";

/**
 * Every bundled icon must survive the dark-mode fill injection (#893).
 *
 * `injectAdaptiveFill` declines any SVG whose shapes carry an inline
 * `style="…fill:…"`, because an inline style beats the `<style>` rule it
 * injects and a half-recoloured icon is worse than none. That guard is right,
 * so the obligation falls on the source files: an icon that states its colour
 * as a `fill` **attribute** themes, and one that states it in a style attribute
 * ships black — invisible on the dark compendium and directory windows, whose
 * `<img>` thumbnails SoHL's `.sohl`-scoped CSS cannot reach.
 *
 * Forty-five bundled icons were authored the second way, five of them default
 * item or actor art (#1677). This suite is the standing gate that keeps the set
 * at zero: a newly added icon carrying inline fills fails here rather than
 * shipping un-themed.
 */
const REPO_ROOT = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../..",
);
const ICONS = path.join(REPO_ROOT, "assets/icons");

/**
 * Icons the fill injection legitimately declines, each with the issue that will
 * close the gap. Add to this only for an icon the injection genuinely *cannot*
 * theme — never to quiet a newly added file that could simply state its colour
 * as a `fill` attribute.
 */
const CANNOT_THEME: Record<string, string> = {
    // Stroke-drawn outline: its shapes are `fill: none` and their colour lives
    // in an inline `stroke:`, which no injected rule can override. Rewriting the
    // fills alone would half-recolour it — the exact outcome the guard prevents.
    "assets/icons/other/mantle.svg": "#1687 — strokes are not themed",
};

/** Every `.svg` under `assets/icons`, as repo-relative paths. */
function bundledIcons(dir: string = ICONS): string[] {
    const out: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) out.push(...bundledIcons(full));
        else if (entry.name.endsWith(".svg"))
            out.push(path.relative(REPO_ROOT, full));
    }
    return out.sort();
}

/** `true` when the build's injection declines this file. */
function skipped(rel: string): boolean {
    const src = fs.readFileSync(path.join(REPO_ROOT, rel), "utf8");
    return injectAdaptiveFill(src) === src;
}

/** `systems/sohl/assets/…` (a Foundry path) → repo-relative. */
const toRepoPath = (image: string) => image.replace(/^systems\/sohl\//, "");

describe("bundled icon dark-mode theming (#1677)", () => {
    it("finds the bundled icon set", () => {
        // Guards the walk itself — an empty list would pass every case below.
        expect(bundledIcons().length).toBeGreaterThan(4000);
    });

    it("themes every bundled icon", () => {
        const gaps = bundledIcons()
            .filter(skipped)
            .filter((rel) => !(rel in CANNOT_THEME));
        expect(gaps).toEqual([]);
    });

    it("keeps the can't-theme allowlist honest", () => {
        // An entry that no longer skips has been fixed — drop it, so the list
        // never grows into a record of icons nobody re-checks.
        for (const [rel, why] of Object.entries(CANNOT_THEME)) {
            expect(
                fs.existsSync(path.join(REPO_ROOT, rel)),
                `${rel} exists`,
            ).toBe(true);
            expect(skipped(rel), `${rel} still skips — ${why}`).toBe(true);
        }
    });

    it("themes every default item and actor art", () => {
        // The surface that matters most: a default icon is what an item shows
        // in the compendium and directory before anyone picks another.
        const art = [...ItemMetadatas, ...ActorMetadatas].map((m) =>
            toRepoPath(m.Image),
        );
        expect(art.length).toBeGreaterThan(0);
        for (const rel of art) {
            expect(
                fs.existsSync(path.join(REPO_ROOT, rel)),
                `${rel} exists`,
            ).toBe(true);
        }
        expect(art.filter(skipped)).toEqual([]);
    });
});
