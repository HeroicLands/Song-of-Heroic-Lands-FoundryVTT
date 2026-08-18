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
    findRetiredLinks,
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
        expect(RETIRED_HOSTS.get("api.heroiclands.org")).toContain(
            "www.heroiclands.org/sohl/api/",
        );
        expect(RETIRED_HOSTS.get("kb.heroiclands.org")).toContain(
            "www.heroiclands.org/sohl/kb/",
        );
    });
});

describe("findRetiredLinks", () => {
    it("finds a retired host in a markdown link", () => {
        const found = findRetiredLinks(
            "| **API** | [`TraumaLogic.requestTreatment`]" +
                "(https://api.heroiclands.org/main/classes/X.html#req) |\n",
        );
        expect(found).toHaveLength(1);
        expect(found[0].host).toBe("api.heroiclands.org");
        expect(found[0].url).toBe(
            "https://api.heroiclands.org/main/classes/X.html#req",
        );
    });

    it("reports the line each one is on", () => {
        const found = findRetiredLinks(
            "clean\nhttps://kb.heroiclands.org/rules/\nclean\n",
        );
        expect(found).toHaveLength(1);
        expect(found[0].line).toBe(2);
    });

    it("finds several on one line, and both hosts", () => {
        const found = findRetiredLinks(
            "see https://api.heroiclands.org/main/a.html and " +
                "https://kb.heroiclands.org/b/\n",
        );
        expect(found.map((f) => f.host)).toEqual([
            "api.heroiclands.org",
            "kb.heroiclands.org",
        ]);
    });

    it("matches a bare or scheme-less occurrence, not just a full URL", () => {
        // The rot shows up in prose and in `system.json`-style bare hosts too;
        // catching only `https://…` would let those through.
        expect(
            findRetiredLinks("visit api.heroiclands.org today"),
        ).toHaveLength(1);
    });

    it("leaves the surviving host alone", () => {
        // The whole point of the move — these are the addresses that work.
        expect(
            findRetiredLinks(
                "https://www.heroiclands.org/sohl/api/classes/X\n" +
                    "https://www.heroiclands.org/sohl/kb/user-guide/\n",
            ),
        ).toEqual([]);
    });

    it("is not fooled by a longer hostname that ends the same way", () => {
        // `myapi.heroiclands.org` is a different host; a naive substring match
        // would report it and fail the build on a link that works.
        expect(findRetiredLinks("https://myapi.heroiclands.org/x")).toEqual([]);
    });

    it("returns nothing for content with no absolute links at all", () => {
        expect(findRetiredLinks("[[skill-battle]] and some prose\n")).toEqual(
            [],
        );
    });
});

describe("rewriteHint", () => {
    it("turns a dead API link into the working one", () => {
        // Both drifts at once: the version segment the API site stopped
        // publishing, and the host that was then withdrawn.
        expect(
            rewriteHint(
                "https://api.heroiclands.org/main/classes/sohl.x.Y.html#anchor",
            ),
        ).toBe("https://www.heroiclands.org/sohl/api/classes/sohl.x.Y#anchor");
    });

    it("drops a `latest` segment the same way as `main`", () => {
        expect(
            rewriteHint("https://api.heroiclands.org/latest/classes/Z.html"),
        ).toBe("https://www.heroiclands.org/sohl/api/classes/Z");
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
