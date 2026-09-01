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
import { HEADERS, ORIGIN_SUFFIX, SITE_OUT } from "../../utils/build-site.mjs";

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
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const read = (rel: string) => fs.readFileSync(path.join(REPO_ROOT, rel), "utf8");

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

/** The hostname part of a `_headers` match, without scheme or path. */
const hostOf = (match: string) => match.replace(/^https:\/\//, "").replace(/\/\*$/, "");

/**
 * A rule's host pattern as a regular expression over whole hostnames.
 *
 * Cloudflare's `:name` placeholders are **single-label** wildcards — "Placeholders
 * match all characters apart from the delimiter, which when part of the host, is
 * a period" — so a placeholder can never swallow a dot. That is the whole reason
 * a four-label pattern cannot match a three-label hostname, and modelling it here
 * is what turns "cannot match `www`" from a claim into an assertion.
 *
 * @param match - A rule's match line, e.g. `https://:project.pages.dev/*`.
 * @returns A regular expression anchored to a whole hostname.
 */
function hostMatcher(match: string): RegExp {
    const source = hostOf(match)
        .split(".")
        .map((label) =>
            label.startsWith(":") ? "[^.]+" : label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        )
        .join("\\.");
    return new RegExp(`^${source}$`);
}

/** The rules whose host pattern matches `host`. */
const rulesMatching = (host: string) =>
    rules(HEADERS).filter(([match]) => hostMatcher(match).test(host));

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

    it("marks the pkg custom domain noindex too (#1765)", () => {
        // The newest of the three host-assigned addresses, and the only one a
        // reader is plausibly handed: `<package>.pkg.heroiclands.org` is the
        // custom domain the hosting project carries so the router has an origin
        // to fetch. Measured before this rule existed, it answered 200 with no
        // `X-Robots-Tag` while the same deployment set it at `*.pages.dev`.
        expect(rules(HEADERS)).toContainEqual([
            `https://:package.${ORIGIN_SUFFIX}/*`,
            "X-Robots-Tag: noindex",
        ]);
    });

    it("scopes every rule to a host-assigned address", () => {
        // An unscoped `/*` would noindex the canonical path as well — and, for
        // anyone who takes this repository elsewhere, their own domain with it.
        // That portability is the point of the epic this belongs to (#1444).
        const hosted = new RegExp(`\\.(pages\\.dev|${ORIGIN_SUFFIX.replace(/\./g, "\\.")})$`);
        for (const [match] of rules(HEADERS)) {
            expect(match).toMatch(/^https:\/\/[^/]+\/\*$/);
            expect(hostOf(match)).toMatch(hosted);
        }
    });

    it("marks every host-assigned address, each by exactly one rule", () => {
        // The three families a deployment answers on, with real observed hosts:
        // the project's own address (its subdomain is `sohl-kb`, fixed when the
        // project was created and unchanged by the later rename to `sohl-site`),
        // a per-deployment alias, and the custom domain.
        for (const host of [
            "sohl-kb.pages.dev",
            "8a6cf436.sohl-kb.pages.dev",
            `sohl.${ORIGIN_SUFFIX}`,
        ]) {
            expect(rulesMatching(host)).toHaveLength(1);
        }
    });

    it("cannot match the canonical host, which must stay indexable", () => {
        // THE failure mode to design against. `www.heroiclands.org` is served
        // from this deployment through the router, and a `noindex` that reached
        // it would de-index the canonical site — far worse than the duplicate
        // address this file exists to close.
        //
        // It cannot: the pkg rule needs FOUR labels and a literal `pkg` third
        // from the end, and a single-label placeholder cannot span the dot that
        // would be needed to fold `www.heroiclands.org` (three labels) into it.
        // The two `.pages.dev` rules need a literal `pages.dev` suffix.
        //
        // The router strips `X-Robots-Tag` on the way through as well
        // (`heroiclands-site`, `worker/src/router.js`, `canonicalHeaders`), so
        // this is the first of two independent guards, not the only one.
        for (const host of [
            "www.heroiclands.org",
            "heroiclands.org",
            "api.heroiclands.org",
            "kb.heroiclands.org",
            "pkg.heroiclands.org",
        ]) {
            expect(rulesMatching(host)).toEqual([]);
        }
    });

    it("is uploaded at the deployment root, where Pages reads it", () => {
        // `_headers` is only consulted at the root of the deployed directory;
        // under /sohl/ it would be published as a text file and never applied.
        expect(read(".github/workflows/deploy-sohl.yml")).toContain(`pages deploy ${SITE_OUT} `);
    });
});
