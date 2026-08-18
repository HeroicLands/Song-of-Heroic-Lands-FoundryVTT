/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
// Build-time CI guard (plain ESM, no Foundry). Imported by relative path
// because the build scripts live outside the `@src` alias tree.
import {
    SITE_ORIGIN,
    sitePathFor,
    repairRetiredLinksIn,
    retiredHrefsUnder,
} from "../../utils/build-site.mjs";

/**
 * The assembled `/sohl/` deployment is the last place a dead hostname can be
 * caught before a reader meets it, and the only place the API documentation can
 * be caught at all: it is generated from the newest release tag (#1452), so a
 * tag cut before the hostnames were withdrawn rebuilds the dead links on every
 * deploy no matter what `main` says (#1487).
 */
describe("sitePathFor", () => {
    /** A pretend deployment: only these files were published. */
    const published = new Set(
        [
            "sohl/index.html",
            "sohl/api/index.html",
            "sohl/api/classes/sohl.x.Y.html",
            "sohl/kb/index.html",
            "sohl/kb/dev-docs/concepts/architecture/index.html",
        ].map((p) => path.join("/site", p)),
    );
    const exists = (p: string) => published.has(p);

    it("resolves a directory address to its index page", () => {
        expect(sitePathFor("/site", `${SITE_ORIGIN}/sohl/kb/`, exists)).toBe(
            path.join("/site", "sohl/kb/index.html"),
        );
    });

    it("resolves an extensionless page to its .html file", () => {
        // TypeDoc's own links are extensionless; the host serves the .html.
        expect(
            sitePathFor(
                "/site",
                `${SITE_ORIGIN}/sohl/api/classes/sohl.x.Y`,
                exists,
            ),
        ).toBe(path.join("/site", "sohl/api/classes/sohl.x.Y.html"));
    });

    it("ignores a fragment and a query when locating the file", () => {
        expect(
            sitePathFor(
                "/site",
                `${SITE_ORIGIN}/sohl/api/classes/sohl.x.Y#anchor`,
                exists,
            ),
        ).toBe(path.join("/site", "sohl/api/classes/sohl.x.Y.html"));
    });

    it("returns nothing for an address this deployment does not publish", () => {
        // The whole point: a host swap alone lands here, and taking it would
        // trade a dead end a reader can see for a quiet 404.
        expect(
            sitePathFor(
                "/site",
                `${SITE_ORIGIN}/sohl/kb/concepts/architecture/`,
                exists,
            ),
        ).toBeUndefined();
    });

    it("returns nothing for an address on somebody else's origin", () => {
        expect(
            sitePathFor("/site", "https://example.com/sohl/kb/", exists),
        ).toBeUndefined();
    });

    it("refuses a path that climbs out of the deployment", () => {
        expect(
            sitePathFor("/site", `${SITE_ORIGIN}/../../etc/passwd`, exists),
        ).toBeUndefined();
    });
});

describe("the assembled tree", () => {
    let root: string;

    /** Write `body` to `rel` under the pretend deployment. */
    const put = (rel: string, body: string) => {
        const file = path.join(root, rel);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, body);
    };

    beforeEach(() => {
        root = fs.mkdtempSync(path.join(os.tmpdir(), "sohl-site-"));
        // The pages the repair is allowed to point at.
        put("sohl/index.html", "<p>landing</p>");
        put("sohl/kb/index.html", "<p>kb</p>");
        put("sohl/kb/dev-docs/concepts/architecture/index.html", "<p>arch</p>");
        put("sohl/api/index.html", "<p>api</p>");
    });

    afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

    it("finds nothing in a clean deployment", () => {
        expect(retiredHrefsUnder(root)).toEqual([]);
    });

    it("repairs a dead API link to the page that exists", () => {
        put(
            "sohl/api/index.html",
            '<a href="https://kb.heroiclands.org/concepts/architecture/">Arch</a>',
        );
        const report = repairRetiredLinksIn(path.join(root, "sohl/api"), root);

        expect(report.repaired).toHaveLength(1);
        expect(report.unresolved).toEqual([]);
        expect(
            fs.readFileSync(path.join(root, "sohl/api/index.html"), "utf8"),
        ).toBe(
            '<a href="https://www.heroiclands.org/sohl/kb/dev-docs/' +
                'concepts/architecture/">Arch</a>',
        );
        // And the tree is clean afterwards — the gate's own question.
        expect(retiredHrefsUnder(root)).toEqual([]);
    });

    it("repairs pages nested below the tree it is given", () => {
        put(
            "sohl/api/classes/X.html",
            '<a href="https://api.heroiclands.org/">API</a>',
        );
        const report = repairRetiredLinksIn(path.join(root, "sohl/api"), root);
        expect(report.repaired).toHaveLength(1);
        expect(retiredHrefsUnder(root)).toEqual([]);
    });

    it("leaves a link it cannot rescue for the gate to report", () => {
        put(
            "sohl/api/index.html",
            '<a href="https://kb.heroiclands.org/no/such/page/">Gone</a>',
        );
        const report = repairRetiredLinksIn(path.join(root, "sohl/api"), root);

        expect(report.unresolved).toHaveLength(1);
        const left = retiredHrefsUnder(root);
        expect(left).toHaveLength(1);
        expect(left[0].file).toBe(path.join("sohl", "api", "index.html"));
    });

    it("reports a dead link outside the API tree instead of repairing it", () => {
        // The knowledgebase is built from `main`, where the source can simply be
        // corrected — so a hit there is a defect to fix, not output to patch.
        put(
            "sohl/kb/index.html",
            '<a href="https://kb.heroiclands.org/concepts/architecture/">Arch</a>',
        );
        repairRetiredLinksIn(path.join(root, "sohl/api"), root);
        expect(retiredHrefsUnder(root)).toHaveLength(1);
    });

    it("does not rewrite anything in a deployment that is already clean", () => {
        const before = fs.readFileSync(
            path.join(root, "sohl/api/index.html"),
            "utf8",
        );
        const report = repairRetiredLinksIn(path.join(root, "sohl/api"), root);
        expect(report.repaired).toEqual([]);
        expect(
            fs.readFileSync(path.join(root, "sohl/api/index.html"), "utf8"),
        ).toBe(before);
    });

    it("looks only at HTML, not at the assets beside it", () => {
        put("sohl/api/assets/search.js", 'x="https://kb.heroiclands.org/z/"');
        expect(retiredHrefsUnder(root)).toEqual([]);
    });
});
