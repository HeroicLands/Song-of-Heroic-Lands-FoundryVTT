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
 * The **template** now lives in the shared theme, because every consumer needs
 * one and none should keep its own copy (issue #1454). That splits the contract
 * in two, and only one half is ours:
 *
 * - _The theme_ owns `layouts/404.html`. It is a submodule, and the job that
 *   runs this suite does not check submodules out, so these assertions cannot
 *   read it — asserting on an empty directory would fail for the wrong reason.
 * - _This repository_ owns the wording and the routes back, via
 *   `params.notfound` in `kb/hugo.toml`, and owns the deploy that publishes the
 *   artifact.
 *
 * So the assertions below pin what this repository can actually regress: the
 * consumer configuration, and a deploy that both checks out the theme and
 * refuses to ship a build missing the file.
 */
const REPO_ROOT = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../..",
);

const read = (rel: string) =>
    fs.readFileSync(path.join(REPO_ROOT, rel), "utf8");

describe("knowledgebase 404 page (#1416)", () => {
    const CONFIG = "kb/hugo.toml";
    const DEPLOY = ".github/workflows/deploy-kb.yml";

    it("supplies the 404 page's wording, which the theme leaves to us", () => {
        // The theme carries layout, not addresses (#1464): it renders generic
        // wording when the consumer supplies none, so an empty section here
        // publishes a page that never names the knowledgebase.
        const config = read(CONFIG);
        expect(config).toMatch(/\[params\.notfound\]/);
        expect(config).toMatch(/tagline\s*=/);
    });

    it("offers at least one route back, so a stale link is not a dead end", () => {
        expect(read(CONFIG)).toMatch(/\[\[params\.notfound\.links\]\]/);
    });

    it("checks out the theme, which is where the template lives", () => {
        // Without the submodule the theme's `layouts/404.html` is absent and
        // Hugo emits no 404 at all — the exact soft-404 this guards against,
        // reintroduced by a checkout option rather than by deleting anything.
        expect(read(DEPLOY)).toMatch(/submodules:\s*recursive/);
    });

    it("is verified in the deploy workflow before publishing", () => {
        // The vitest suite does not run Hugo, so the build that actually
        // produces the artifact asserts it, rather than the absence surfacing
        // in production.
        expect(read(DEPLOY)).toMatch(/test -s kb\/public\/404\.html/);
    });
});
