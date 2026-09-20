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
import { parse as parseYaml } from "yaml";

import { REQUIRED, SITE_OUT, missingRequired } from "../../utils/build-site.mjs";

/**
 * The site must publish a `404.html`.
 *
 * Cloudflare Pages serves the nearest `404.html` — with a genuine 404 status —
 * for any path the site does not publish, and falls back to the site **root**
 * when that file is missing. The fallback is a soft-404: a 200 and the landing
 * page, which reads as success to every "does this URL resolve?" check and lets
 * search engines index retired content as live.
 *
 * The **template** lives in the shared theme, because every consumer needs one
 * and none should keep its own copy. That splits the contract in
 * two, and only one half is ours:
 *
 * - _The theme_ owns `layouts/404.html`. It arrives as the npm package
 *   `@heroiclands/hugo-theme`, which the job running this suite does
 *   not install, so these assertions do not read it — asserting on an absent
 *   directory would fail for the wrong reason.
 * - _This repository_ owns the wording and the routes back, via
 *   `site.notfound` in `package-build.config.yaml` — written into the generated
 *   Hugo configuration as `params.notfound` — and owns the deploy that
 *   publishes the artifact.
 *
 * So the assertions below pin what this repository can actually regress: the
 * consumer configuration, the assembly step that refuses to ship a build
 * missing the file, and a deploy that puts the theme in front of Hugo at all.
 *
 * That last one is deliberately pinned to the *outcome* rather than to a
 * mechanism. Pinning how the theme arrives makes the assertion fail whenever
 * that changes, while the behaviour it guards is fine. What must hold is that
 * the theme is installed before Hugo runs, whatever installs it.
 */
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const read = (rel: string) => fs.readFileSync(path.join(REPO_ROOT, rel), "utf8");

describe("the /sohl/ site's 404 page", () => {
    const CONFIG = "package-build.config.yaml";
    const DEPLOY = ".github/workflows/deploy-sohl.yml";

    type NotFound = { tagline?: string; links?: Array<{ url: string }> };
    const notfound = (): NotFound | undefined =>
        (parseYaml(read(CONFIG)) as { site?: { notfound?: NotFound } }).site?.notfound;

    it("supplies the 404 page's wording, which the theme leaves to us", () => {
        // The theme carries layout, not addresses: it renders generic
        // wording when the consumer supplies none, so an empty section here
        // publishes a page that never names the site.
        const config = notfound();
        expect(config).toBeDefined();
        expect(config?.tagline).toMatch(/\S/);
    });

    it("offers at least one route back, so a stale link is not a dead end", () => {
        expect(notfound()?.links?.length).toBeGreaterThan(0);
    });

    it("routes back to the surfaces this site actually publishes", () => {
        // One 404 page serves the whole of /sohl/, so a reader who mistyped an
        // API address is handed the same file as one who mistyped a page
        // address — and it has to offer both the homepage and the API.
        const urls = (notfound()?.links ?? []).map((link) => link.url);
        expect(urls).toContain("/");
        expect(urls).toContain("/api/");
    });

    it("installs the theme, which is where the template lives", () => {
        // Without the theme, `layouts/404.html` is absent and Hugo emits no 404
        // at all — the exact soft-404 this guards against, reintroduced by a
        // build-order change rather than by deleting anything.
        const deploy = read(DEPLOY);
        const install = deploy.indexOf("npm ci");
        const hugo = deploy.search(/uses:\s*peaceiris\/actions-hugo/);
        expect(install, "the deploy must install dependencies").toBeGreaterThan(-1);
        expect(hugo, "the deploy must set up Hugo").toBeGreaterThan(-1);
        // Order is the whole point: installing *after* Hugo has already run
        // publishes a site built without the theme.
        expect(install).toBeLessThan(hugo);

        // And what `npm ci` installs has to include the theme. Read from the
        // manifest rather than the lockfile: the declaration is the intent, and
        // the lockfile only ever follows it.
        const pkg = JSON.parse(read("package.json"));
        expect(pkg.devDependencies).toHaveProperty("@heroiclands/hugo-theme");
    });

    it("is required by the assembly step, which the deploy runs", () => {
        // The vitest suite does not run Hugo, so the build that actually
        // produces the artifact asserts it, rather than the absence surfacing
        // in production.
        expect(REQUIRED).toContain("sohl/404.html");
        expect(read(DEPLOY)).toMatch(/site:assemble/);
    });
});

describe("assembling the /sohl/ deployment", () => {
    it("requires an entry point for every surface it publishes", () => {
        // One deploy carries the homepage, every page and the API
        // documentation; a half-assembled tree would 404 an advertised address.
        expect(REQUIRED).toEqual(["sohl/index.html", "sohl/404.html", "sohl/api/index.html"]);
    });

    it("names what is missing rather than publishing a partial tree", () => {
        const present = new Set(["sohl/index.html", "sohl/404.html"]);
        const missing = missingRequired("/site", (p: string) =>
            present.has(p.replace("/site/", "")),
        );
        expect(missing).toEqual(["sohl/api/index.html"]);
    });

    it("reports nothing missing from a complete tree", () => {
        expect(missingRequired("/site", () => true)).toEqual([]);
    });

    it("writes the root files the toolchain owns, where Pages reads them", () => {
        // `_headers` — the `noindex` on every host-assigned address — is
        // `package-build site-root`'s, written beside the prefix. Pages reads
        // it only from the root of the uploaded directory, so the assembly
        // has to run the command and the deploy has to upload that directory.
        const scripts = JSON.parse(read("package.json")).scripts as Record<string, string>;
        expect(scripts["site:assemble"]).toMatch(/package-build site-root/);
        expect(read(".github/workflows/deploy-sohl.yml")).toContain(`pages deploy ${SITE_OUT} `);
    });
});
