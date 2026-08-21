/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
    unaddressableForeignPackages,
    formatUnaddressableFinding,
} from "../../utils/kb-foreign-manifest.mjs";

/**
 * The guard #1664 exists for.
 *
 * A vendored manifest is read with one key shape and written with another, and
 * the two never collide — so every cross-package address resolves to nothing
 * and *nothing reports it*, because a link that does not resolve falls through
 * to its display text. That is how the v2 → v3 key change (#1499) left this
 * build with 2,367 foreign entries and no working lookup for over a release.
 *
 * The lookup itself is fixed; this asserts the shape can never drift again in
 * silence.
 */
describe("unaddressableForeignPackages", () => {
    /** An index keyed the way the manifest is actually written today. */
    const canonical = () =>
        new Map([
            [
                "thalorna-affiliation-aerarimmpr",
                { package: "thalorna", name: "Aerar Immpr" },
            ],
            [
                "thalorna-being-grukarahk",
                { package: "thalorna", name: "Grukar-ahk" },
            ],
        ]);

    /** The same entries under the v2 shape this build stopped emitting. */
    const legacy = () =>
        new Map([
            [
                "affiliation/aerarimmpr",
                { package: "thalorna", name: "Aerar Immpr" },
            ],
            ["being/grukarahk", { package: "thalorna", name: "Grukar-ahk" }],
        ]);

    it("passes a manifest whose keys this build can address", () => {
        expect(unaddressableForeignPackages(canonical())).toEqual([]);
    });

    it("reports a package whose every key is unreadable", () => {
        const findings = unaddressableForeignPackages(legacy());
        expect(findings).toHaveLength(1);
        expect(findings[0].package).toBe("thalorna");
        // The count is the whole point of the finding: "2 entries, 0 of them
        // addressable" is what distinguishes drift from an empty manifest.
        expect(findings[0].entries).toBe(2);
        expect(findings[0].sampleKey).toBe("affiliation/aerarimmpr");
    });

    it("stays silent for a package that publishes nothing", () => {
        // A pack-only or not-yet-populated package legitimately contributes no
        // entries. Failing the build on that would make the guard unusable
        // exactly while a package is being brought up.
        expect(unaddressableForeignPackages(new Map())).toEqual([]);
    });

    it("does not fire when some keys are addressable", () => {
        // Partial drift resolves *something*, so it is not the silent-total
        // failure this guard names — and the dead-link check reports the rest.
        const mixed = new Map([...canonical(), ...legacy()]);
        expect(unaddressableForeignPackages(mixed)).toEqual([]);
    });

    it("reports each drifted package separately", () => {
        const two = new Map([
            ["affiliation/a", { package: "thalorna" }],
            ["deity/b", { package: "kethira" }],
        ]);
        expect(unaddressableForeignPackages(two).map((f) => f.package)).toEqual(
            ["thalorna", "kethira"],
        );
    });
});

describe("formatUnaddressableFinding", () => {
    /** A manifest directory holding one file with a locatable offending key. */
    function withManifest(body: string, run: (dir: string) => void) {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sohl-manifest-"));
        try {
            fs.writeFileSync(path.join(dir, "thalorna.json"), body);
            run(dir);
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    }

    const finding = {
        package: "thalorna",
        entries: 2,
        sampleKey: "affiliation/aerarimmpr",
    };

    it("locates the offending key and reports its line and column", () => {
        const body = [
            "{",
            '    "version": 4,',
            '    "entries": {',
            '        "affiliation/aerarimmpr": { "name": "Aerar Immpr" }',
            "    }",
            "}",
        ].join("\n");
        withManifest(body, (dir) => {
            const line = formatUnaddressableFinding(finding, dir);
            // `file:line:column: severity: message`, path first on the line —
            // the standing diagnostic form, so an editor can jump to it.
            expect(line).toMatch(/^[^\s:]\S*thalorna\.json:4:9: error: .*/);
            expect(line).toContain("affiliation/aerarimmpr");
        });
    });

    it("drops the position rather than guessing when the key is not found", () => {
        withManifest('{"version":4,"entries":{}}', (dir) => {
            const line = formatUnaddressableFinding(finding, dir);
            expect(line).toMatch(/thalorna\.json: error: /);
            // Never 1:1 — that sends the reader to the top of the file for a
            // finding that is not there.
            expect(line).not.toContain(":1:1:");
        });
    });

    it("drops the position when the manifest cannot be read at all", () => {
        const line = formatUnaddressableFinding(finding, "/no/such/dir");
        expect(line).toMatch(/thalorna\.json: error: /);
    });
});

describe("this repository's vendored manifests", () => {
    it("are addressable by the build that reads them", async () => {
        // The regression test proper. #1664 was invisible precisely because no
        // check ran against the real file; this one does, so a manifest
        // refreshed under a future key shape fails here rather than quietly
        // deleting every cross-package link from the site.
        const { loadForeignManifests } =
            await import("@heroiclands/content-build/engine/kb-manifest");
        const foreign = loadForeignManifests(
            path.resolve(__dirname, "../../assets/manifests"),
            new Set(["sohl"]),
        );
        expect(foreign.index.size).toBeGreaterThan(0);
        expect(unaddressableForeignPackages(foreign.index)).toEqual([]);
    });
});
