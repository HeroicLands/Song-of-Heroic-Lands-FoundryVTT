/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
// Build-time CI guard (plain ESM, no Foundry). Imported by relative path
// because the build scripts live outside the `@src` alias tree.
import {
    RETIRED_HOSTS,
    findRetiredHrefs,
    repairRetiredHrefs,
    rewriteCandidates,
    rewriteHint,
} from "../../utils/retired-hosts.mjs";

/**
 * A retired hostname fails at DNS rather than redirecting, so a link carrying
 * one is a hard dead end with nothing to follow — the defect #1485 shipped 71
 * times. What makes it worth a guard is that no build notices: an absolute URL
 * is opaque to the wikilink checks, compiles cleanly into the journals, and
 * publishes to the knowledgebase looking exactly like a working link.
 */
describe("RETIRED_HOSTS", () => {
    it("names both withdrawn hostnames", () => {
        expect([...RETIRED_HOSTS.keys()].sort()).toEqual([
            "api.heroiclands.org",
            "kb.heroiclands.org",
        ]);
    });

    it("gives each host the address that replaced it", () => {
        expect(RETIRED_HOSTS.get("api.heroiclands.org")).toContain("www.heroiclands.org/sohl/api/");
        expect(RETIRED_HOSTS.get("kb.heroiclands.org")).toContain("www.heroiclands.org/sohl/kb/");
    });
});

describe("rewriteHint", () => {
    it("turns a dead API link into the working one", () => {
        // Both drifts at once: the version segment the API site stopped
        // publishing, and the host that was then withdrawn.
        expect(rewriteHint("https://api.heroiclands.org/main/classes/sohl.x.Y.html#anchor")).toBe(
            "https://www.heroiclands.org/sohl/api/classes/sohl.x.Y#anchor",
        );
    });

    it("drops a `latest` segment the same way as `main`", () => {
        expect(rewriteHint("https://api.heroiclands.org/latest/classes/Z.html")).toBe(
            "https://www.heroiclands.org/sohl/api/classes/Z",
        );
    });

    it("repoints a knowledgebase link", () => {
        expect(rewriteHint("https://kb.heroiclands.org/rules/combat/")).toBe(
            "https://www.heroiclands.org/sohl/kb/rules/combat/",
        );
    });

    it("has no suggestion for a URL on a host it does not know", () => {
        expect(rewriteHint("https://example.com/x")).toBeUndefined();
    });
});

/**
 * The published API documentation is built from the newest *release tag*
 * (#1452), so it can carry addresses that were correct when the tag was cut and
 * have since been withdrawn — which is what #1487 found on `/sohl/api/`. That
 * tag cannot be edited, so the deployment repairs those links as it assembles
 * the tree. These are the pure parts of that repair.
 */
describe("findRetiredHrefs", () => {
    it("finds a retired host in an href", () => {
        const found = findRetiredHrefs(
            '<a href="https://kb.heroiclands.org/concepts/architecture/">Arch</a>',
        );
        expect(found).toHaveLength(1);
        expect(found[0].attr).toBe("href");
        expect(found[0].url).toBe("https://kb.heroiclands.org/concepts/architecture/");
    });

    it("finds one in a src attribute too", () => {
        const found = findRetiredHrefs('<img src="https://kb.heroiclands.org/logo.png">');
        expect(found).toHaveLength(1);
        expect(found[0].attr).toBe("src");
    });

    it("accepts single quotes and spacing around the equals sign", () => {
        expect(findRetiredHrefs("<a href = 'https://api.heroiclands.org/'>x</a>")).toHaveLength(1);
    });

    it("ignores a retired host named in prose rather than linked", () => {
        // The developer docs discuss the withdrawal by name. That is a fact
        // about the site, not a dead end a reader can click into, and failing
        // the deploy over it would make the guard unusable.
        expect(
            findRetiredHrefs("<p>The old <code>api.heroiclands.org</code> was withdrawn.</p>"),
        ).toEqual([]);
    });

    it("leaves the surviving addresses alone", () => {
        expect(findRetiredHrefs('<a href="https://www.heroiclands.org/sohl/api/">API</a>')).toEqual(
            [],
        );
    });
});

describe("rewriteCandidates", () => {
    it("offers the mapped address first", () => {
        expect(rewriteCandidates("https://api.heroiclands.org/")[0]).toBe(
            "https://www.heroiclands.org/sohl/api/",
        );
    });

    it("offers the developer-docs section for a bare knowledgebase path", () => {
        // The old API landing linked the developer docs without their section
        // segment, so the host swap alone lands on a 404. `/dev-docs/` is where
        // that page lives now, and the assembler takes only the candidate that
        // resolves in the tree it just built.
        expect(rewriteCandidates("https://kb.heroiclands.org/concepts/architecture/")).toEqual([
            "https://www.heroiclands.org/sohl/kb/concepts/architecture/",
            "https://www.heroiclands.org/sohl/kb/dev-docs/concepts/architecture/",
        ]);
    });

    it("rewrites the old /dev/ route to /dev-docs/", () => {
        expect(rewriteCandidates("https://kb.heroiclands.org/dev/how-to/testing/")).toContain(
            "https://www.heroiclands.org/sohl/kb/dev-docs/how-to/testing/",
        );
    });

    it("offers nothing for a host it did not retire", () => {
        expect(rewriteCandidates("https://example.com/x")).toEqual([]);
    });
});

describe("repairRetiredHrefs", () => {
    /** Accept only addresses that exist in a small pretend tree. */
    const resolves = (url: string) =>
        [
            "https://www.heroiclands.org/sohl/api/",
            "https://www.heroiclands.org/sohl/kb/",
            "https://www.heroiclands.org/sohl/kb/dev-docs/concepts/architecture/",
        ].includes(url);

    it("replaces a dead href with the candidate that resolves", () => {
        const { html, repaired, unresolved } = repairRetiredHrefs(
            '<a href="https://kb.heroiclands.org/concepts/architecture/">A</a>',
            resolves,
        );
        expect(html).toBe(
            '<a href="https://www.heroiclands.org/sohl/kb/dev-docs/' +
                'concepts/architecture/">A</a>',
        );
        expect(repaired).toHaveLength(1);
        expect(unresolved).toEqual([]);
    });

    it("does not settle for a candidate that would 404", () => {
        // The host swap alone resolves at DNS and then 404s. Taking it would
        // turn a visible dead end into a quiet one.
        const { repaired } = repairRetiredHrefs(
            '<a href="https://kb.heroiclands.org/concepts/architecture/">A</a>',
            resolves,
        );
        expect(repaired[0].to).not.toBe(
            "https://www.heroiclands.org/sohl/kb/concepts/architecture/",
        );
    });

    it("reports a link no candidate can rescue, and leaves it in place", () => {
        const { html, repaired, unresolved } = repairRetiredHrefs(
            '<a href="https://kb.heroiclands.org/gone/">A</a>',
            resolves,
        );
        expect(unresolved).toEqual(["https://kb.heroiclands.org/gone/"]);
        expect(repaired).toEqual([]);
        expect(html).toContain("kb.heroiclands.org");
    });

    it("repairs every occurrence, not just the first", () => {
        const { repaired } = repairRetiredHrefs(
            '<a href="https://api.heroiclands.org/">a</a>' +
                '<a href="https://kb.heroiclands.org">b</a>',
            resolves,
        );
        expect(repaired).toHaveLength(2);
    });

    it("returns clean HTML untouched", () => {
        const clean = '<a href="https://www.heroiclands.org/sohl/kb/">KB</a>';
        const { html, repaired } = repairRetiredHrefs(clean, resolves);
        expect(html).toBe(clean);
        expect(repaired).toEqual([]);
    });
});
