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

/**
 * The knowledgebase must publish a `404.html`.
 *
 * Cloudflare Pages serves the deployment's `404.html` — with a genuine 404
 * status — for any path the site does not publish, and falls back to the site
 * **root** when that file is missing. The fallback is a soft-404: a 200 and the
 * landing page, which reads as success to every "does this URL resolve?" check
 * and lets search engines index retired content as live (issue #1416).
 *
 * The shared theme carries no 404 template, so the KB's own
 * `kb/layouts/404.html` is the only thing that makes Hugo emit the file. These
 * assertions pin the two halves of that contract: the layout exists and renders
 * through the theme's `baseof`, and the deploy workflow refuses to ship a build
 * that lacks the artifact.
 */
const REPO_ROOT = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../..",
);

const read = (rel: string) =>
    fs.readFileSync(path.join(REPO_ROOT, rel), "utf8");

describe("knowledgebase 404 page (#1416)", () => {
    const LAYOUT = "kb/layouts/404.html";

    it("has a 404 layout, so Hugo writes kb/public/404.html", () => {
        expect(fs.existsSync(path.join(REPO_ROOT, LAYOUT))).toBe(true);
    });

    it("renders through the theme chrome rather than as a bare page", () => {
        // `baseof.html` supplies the header, footer, and styling; a layout
        // joins it by filling the `main` block. Without the block the file
        // would still be written, but empty of everything below <main>.
        expect(read(LAYOUT)).toMatch(/\{\{\s*define\s+"main"\s*\}\}/);
    });

    it("tells the reader the page is missing and offers a way back", () => {
        const layout = read(LAYOUT);
        expect(layout).toMatch(/Page not found/);
        // At minimum, home — a stale link should never be a dead end.
        expect(layout).toMatch(/href="\/"/);
    });

    it("is verified in the deploy workflow before publishing", () => {
        // The layout can only regress by deletion, and the vitest suite does
        // not run Hugo — so the build that actually produces the artifact
        // asserts it, rather than the absence surfacing in production.
        expect(read(".github/workflows/deploy-kb.yml")).toMatch(
            /test -s kb\/public\/404\.html/,
        );
    });
});
