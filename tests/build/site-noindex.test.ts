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
import { HEADERS, SITE_OUT } from "../../utils/build-site.mjs";

/**
 * The hosting project answers at a host-assigned address as well as at its path
 * on `www.heroiclands.org`, and a second address serving the same pages can be
 * indexed and compete with the canonical URL (#1469). The deployment carries a
 * `_headers` file that marks those addresses `noindex`.
 *
 * What this suite can pin is the file the build writes and where it is
 * uploaded — Cloudflare Pages reads `_headers` from the **root** of the
 * deployment, so a rule written anywhere else is silently inert. The response
 * headers themselves are checked against the running deploy, at both addresses,
 * which is what the issue's acceptance criteria ask for.
 */
const REPO_ROOT = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../..",
);

const read = (rel: string) =>
    fs.readFileSync(path.join(REPO_ROOT, rel), "utf8");

/** `_headers` rules as [match, ...directives] groups, blank lines dropped. */
function rules(headers: string): Array<[string, ...string[]]> {
    const out: Array<[string, ...string[]]> = [];
    for (const line of headers.split("\n")) {
        if (!line.trim()) continue;
        if (/^\s/.test(line)) out.at(-1)?.push(line.trim());
        else out.push([line.trim()]);
    }
    return out;
}

describe("the /sohl/ deployment's host-assigned addresses (#1469)", () => {
    it("marks the project's own address noindex", () => {
        expect(rules(HEADERS)).toContainEqual([
            "https://:project.pages.dev/*",
            "X-Robots-Tag: noindex",
        ]);
    });

    it("marks a per-deployment address noindex too", () => {
        // Every deployment gets <deployment>.<project>.pages.dev of its own,
        // so the project rule alone leaves each build its own indexable copy.
        expect(rules(HEADERS)).toContainEqual([
            "https://:version.:project.pages.dev/*",
            "X-Robots-Tag: noindex",
        ]);
    });

    it("scopes every rule to a host-assigned address", () => {
        // An unscoped `/*` would noindex the canonical path as well — and, for
        // anyone who takes this repository elsewhere, their own domain with it.
        // That portability is the point of the epic this belongs to (#1444).
        for (const [match] of rules(HEADERS)) {
            expect(match).toMatch(/^https:\/\/[^/]*\.pages\.dev\/\*$/);
        }
    });

    it("is uploaded at the deployment root, where Pages reads it", () => {
        // `_headers` is only consulted at the root of the deployed directory;
        // under /sohl/ it would be published as a text file and never applied.
        expect(read(".github/workflows/deploy-sohl.yml")).toContain(
            `pages deploy ${SITE_OUT} `,
        );
    });
});
