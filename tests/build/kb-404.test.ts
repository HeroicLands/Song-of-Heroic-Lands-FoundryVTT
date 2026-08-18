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
import {
    REQUIRED,
    REDIRECTS,
    missingRequired,
} from "../../utils/build-site.mjs";

/**
 * The site must publish a `404.html`.
 *
 * Cloudflare Pages serves the nearest `404.html` — with a genuine 404 status —
 * for any path the site does not publish, and falls back to the site **root**
 * when that file is missing. The fallback is a soft-404: a 200 and the landing
 * page, which reads as success to every "does this URL resolve?" check and lets
 * search engines index retired content as live (issue #1416).
 *
 * The **template** lives in the shared theme, because every consumer needs one
 * and none should keep its own copy (issue #1454). That splits the contract in
 * two, and only one half is ours:
 *
 * - _The theme_ owns `layouts/404.html`. It is a submodule, and the job that
 *   runs this suite does not check submodules out, so these assertions cannot
 *   read it — asserting on an empty directory would fail for the wrong reason.
 * - _This repository_ owns the wording and the routes back, via
 *   `params.notfound` in `kb/hugo.toml`, and owns the deploy that publishes the
 *   artifact.
 *
 * So the assertions below pin what this repository can actually regress: the
 * consumer configuration, the assembly step that refuses to ship a build
 * missing the file, and a deploy that checks the theme out at all.
 */
const REPO_ROOT = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../..",
);

const read = (rel: string) =>
    fs.readFileSync(path.join(REPO_ROOT, rel), "utf8");

describe("the /sohl/ site's 404 page (#1416)", () => {
    const CONFIG = "kb/hugo.toml";
    const DEPLOY = ".github/workflows/deploy-sohl.yml";

    it("supplies the 404 page's wording, which the theme leaves to us", () => {
        // The theme carries layout, not addresses (#1464): it renders generic
        // wording when the consumer supplies none, so an empty section here
        // publishes a page that never names the site.
        const config = read(CONFIG);
        expect(config).toMatch(/\[params\.notfound\]/);
        expect(config).toMatch(/tagline\s*=/);
    });

    it("offers at least one route back, so a stale link is not a dead end", () => {
        expect(read(CONFIG)).toMatch(/\[\[params\.notfound\.links\]\]/);
    });

    it("routes back to the surfaces this site actually publishes", () => {
        // One 404 page serves the whole of /sohl/, so a reader who mistyped an
        // API address is handed the same file as one who mistyped a
        // knowledgebase address — and it has to offer both (#1470).
        const urls = [...read(CONFIG).matchAll(/^\s*url\s*=\s*"(.*)"$/gm)].map(
            ([, u]) => u,
        );
        expect(urls).toContain("kb/");
        expect(urls).toContain("api/");
    });

    it("checks out the theme, which is where the template lives", () => {
        // Without the submodule the theme's `layouts/404.html` is absent and
        // Hugo emits no 404 at all — the exact soft-404 this guards against,
        // reintroduced by a checkout option rather than by deleting anything.
        expect(read(DEPLOY)).toMatch(/submodules:\s*recursive/);
    });

    it("is required by the assembly step, which the deploy runs", () => {
        // The vitest suite does not run Hugo, so the build that actually
        // produces the artifact asserts it, rather than the absence surfacing
        // in production.
        expect(REQUIRED).toContain("sohl/404.html");
        expect(read(DEPLOY)).toMatch(/site:assemble/);
    });
});

describe("assembling the /sohl/ deployment (#1470)", () => {
    it("requires an entry point for every surface it publishes", () => {
        // One deploy carries the landing page, the knowledgebase and the API
        // documentation; a half-assembled tree would 404 an advertised address.
        expect(REQUIRED).toEqual([
            "sohl/index.html",
            "sohl/404.html",
            "sohl/kb/index.html",
            "sohl/api/index.html",
        ]);
    });

    it("names what is missing rather than publishing a partial tree", () => {
        const present = new Set(["sohl/index.html", "sohl/404.html"]);
        const missing = missingRequired("/site", (p: string) =>
            present.has(p.replace("/site/", "")),
        );
        expect(missing).toEqual(["sohl/kb/index.html", "sohl/api/index.html"]);
    });

    it("reports nothing missing from a complete tree", () => {
        expect(missingRequired("/site", () => true)).toEqual([]);
    });

    it("sends the deployment's own root to the package", () => {
        // Only reachable at the hosting project's own address; once routing
        // exists (#1468) the site root is a different project's deploy.
        expect(REDIRECTS.trim()).toBe("/ /sohl/ 302");
    });
});
