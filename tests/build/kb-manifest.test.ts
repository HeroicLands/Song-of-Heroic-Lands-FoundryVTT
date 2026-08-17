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

// Build-time helper (plain ESM, no Foundry), imported by relative path because
// the KB build scripts live outside the `@src` alias tree.
import {
    buildManifest,
    writeManifests,
    loadForeignManifests,
    manifestsComplete,
    MANIFEST_VERSION,
    LINK_PACKAGES,
} from "../../utils/kb-manifest.mjs";

const entry = (type: string, shortcode: string, name: string, url: string) => ({
    fm: { type, shortcode },
    name,
    url,
});

let dir: string;
beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "sohl-manifest-"));
});
afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
});

describe("buildManifest", () => {
    it("keys entries by type/shortcode and carries url and name", () => {
        const doc = buildManifest("sohl", [
            entry("skill", "climb", "Climbing", "/skill/climbing/"),
        ]);
        expect(doc.version).toBe(MANIFEST_VERSION);
        expect(doc.package).toBe("sohl");
        expect(doc.entries["skill/climb"]).toEqual({
            url: "/skill/climbing/",
            name: "Climbing",
        });
    });

    it("omits a note with no shortcode — it cannot be addressed", () => {
        const doc = buildManifest("sohl", [
            { fm: { type: "doc" }, name: "Prose", url: "/rules/prose/" },
            entry("skill", "climb", "Climbing", "/skill/climbing/"),
        ]);
        expect(Object.keys(doc.entries)).toEqual(["skill/climb"]);
    });

    it("sorts keys so the committed file diffs only on real change", () => {
        const doc = buildManifest("sohl", [
            entry("skill", "zeta", "Zeta", "/skill/zeta/"),
            entry("skill", "alpha", "Alpha", "/skill/alpha/"),
        ]);
        expect(Object.keys(doc.entries)).toEqual(["skill/alpha", "skill/zeta"]);
    });
});

describe("loadForeignManifests", () => {
    const write = (pkg: string, body: object) =>
        fs.writeFileSync(
            path.join(dir, `${pkg}.json`),
            JSON.stringify(body, null, 2),
        );

    it("returns an empty index when the directory does not exist", () => {
        const r = loadForeignManifests(path.join(dir, "absent"), []);
        expect(r.index.size).toBe(0);
        expect(r.packages.size).toBe(0);
    });

    it("loads a foreign package's addresses", () => {
        write("thalorna", {
            version: MANIFEST_VERSION,
            package: "thalorna",
            entries: {
                "creature/grkrahk": {
                    url: "/thalorna/creature/grukar-ahk/",
                    name: "Grukar-ahk",
                },
            },
        });
        const r = loadForeignManifests(dir, ["sohl"]);
        expect(r.packages.has("thalorna")).toBe(true);
        expect(r.index.get("creature/grkrahk")).toMatchObject({
            url: "/thalorna/creature/grukar-ahk/",
            package: "thalorna",
        });
    });

    it("skips a package built locally — a live build outranks a vendored copy", () => {
        write("sohl", {
            version: MANIFEST_VERSION,
            package: "sohl",
            entries: { "skill/climb": { url: "/stale/", name: "Stale" } },
        });
        const r = loadForeignManifests(dir, ["sohl"]);
        expect(r.packages.has("sohl")).toBe(false);
        expect(r.index.size).toBe(0);
    });

    it("rejects a manifest written to a different format version", () => {
        write("thalorna", {
            version: MANIFEST_VERSION + 1,
            package: "thalorna",
            entries: {},
        });
        const r = loadForeignManifests(dir, ["sohl"]);
        expect(r.packages.has("thalorna")).toBe(false);
        expect(r.stale[0]).toMatchObject({ package: "thalorna" });
    });

    it("reports an unreadable manifest rather than throwing", () => {
        fs.writeFileSync(path.join(dir, "thalorna.json"), "{ not json");
        const r = loadForeignManifests(dir, ["sohl"]);
        expect(r.stale).toHaveLength(1);
        expect(r.index.size).toBe(0);
    });
});

describe("manifestsComplete", () => {
    it("is incomplete while a linkable package is neither local nor vendored", () => {
        const r = manifestsComplete(["sohl"], []);
        expect(r.complete).toBe(false);
        expect(r.missing).toContain("thalorna");
    });

    it("is complete once every linkable package is accounted for", () => {
        expect(manifestsComplete(["sohl"], ["thalorna"]).complete).toBe(true);
        expect(manifestsComplete(LINK_PACKAGES, []).complete).toBe(true);
    });

    it("does not require kethira, which publishes no pages", () => {
        // The module must stay withdrawable; a manifest edge into it would
        // quietly prevent that.
        expect(LINK_PACKAGES).not.toContain("kethira");
    });
});
