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
    packageRelative,
    resolvePackageUrl,
    MANIFEST_VERSION,
    LINK_PACKAGES,
    PACKAGE_BASE,
} from "../../utils/kb-manifest.mjs";

const entry = (type: string, shortcode: string, name: string, url: string) => ({
    fm: { type, shortcode },
    name,
    url,
});

/**
 * The manifest document's shape.
 *
 * `kb-manifest.mjs` is plain ESM with no declaration file, so its exports widen
 * to `object` and every property read fails `lint:dts` (tsc with `skipLibCheck`
 * off) even though the runtime is fine. Naming the shape here keeps the
 * assertions honest — a field renamed in the helper fails to compile rather
 * than silently reading `undefined`.
 */
interface Manifest {
    version: number;
    package: string;
    foundryPackage?: string;
    entries: Record<
        string,
        { path: string; name: string; uuid?: string; docUuid?: string }
    >;
}
const manifestOf = (doc: unknown) => doc as Manifest;

let dir: string;
beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "sohl-manifest-"));
});
afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
});

describe("packageRelative", () => {
    it("strips the emitting package's own base", () => {
        expect(
            packageRelative("/thalorna/creature/grukar-ahk/", "/thalorna/"),
        ).toBe("creature/grukar-ahk/");
    });

    it("leaves a root-based package's address untouched but for the slash", () => {
        expect(packageRelative("/skill/climbing/", "/")).toBe(
            "skill/climbing/",
        );
    });

    it("refuses a URL that does not sit under the declared base", () => {
        // Emitting it anyway would record an address that resolves nowhere once
        // a consumer prefixes its own base — the 404 this format exists to end.
        expect(() =>
            packageRelative("/sohl/skill/climbing/", "/thalorna/"),
        ).toThrow(/base/);
    });
});

describe("resolvePackageUrl", () => {
    it("prefixes the consumer's base for that package", () => {
        expect(resolvePackageUrl("creature/grukar-ahk/", "/thalorna/")).toBe(
            "/thalorna/creature/grukar-ahk/",
        );
    });

    it("produces an absolute URL when the base names another origin", () => {
        expect(
            resolvePackageUrl(
                "creature/grukar-ahk/",
                "https://thalorna.example.org/",
            ),
        ).toBe("https://thalorna.example.org/creature/grukar-ahk/");
    });

    it("rejects a base that does not end in a slash", () => {
        expect(() => resolvePackageUrl("creature/x/", "/thalorna")).toThrow(
            /slash/,
        );
    });

    it("rejects a site-absolute address — the shape this format replaced", () => {
        expect(() =>
            resolvePackageUrl("/thalorna/creature/x/", "/thalorna/"),
        ).toThrow(/relative/);
    });
});

describe("buildManifest", () => {
    it("keys entries canonically and records a package-relative path", () => {
        const doc = manifestOf(
            buildManifest(
                "sohl",
                [entry("skill", "climb", "Climbing", "/skill/climbing/")],
                "/",
            ),
        );
        expect(doc.version).toBe(MANIFEST_VERSION);
        expect(doc.package).toBe("sohl");
        // Canonical: fully qualified, so the key is globally unique and a
        // foreign manifest merges straight into a local index (#1499).
        expect(doc.entries["sohl/skill/climb"]).toEqual({
            path: "skill/climbing/",
            name: "Climbing",
        });
    });

    it("records an address relative to the package's own base", () => {
        const doc = manifestOf(
            buildManifest(
                "thalorna",
                [
                    entry(
                        "creature",
                        "grkrahk",
                        "Grukar-ahk",
                        "/thalorna/creature/grukar-ahk/",
                    ),
                ],
                "/thalorna/",
            ),
        );
        expect(doc.entries["thalorna/creature/grkrahk"].path).toBe(
            "creature/grukar-ahk/",
        );
    });

    it("omits a note with no shortcode — it cannot be addressed", () => {
        const doc = manifestOf(
            buildManifest(
                "sohl",
                [
                    {
                        fm: { type: "doc" },
                        name: "Prose",
                        url: "/rules/prose/",
                    },
                    entry("skill", "climb", "Climbing", "/skill/climbing/"),
                ],
                "/",
            ),
        );
        expect(Object.keys(doc.entries)).toEqual(["sohl/skill/climb"]);
    });

    it("sorts keys so the committed file diffs only on real change", () => {
        const doc = manifestOf(
            buildManifest(
                "sohl",
                [
                    entry("skill", "zeta", "Zeta", "/skill/zeta/"),
                    entry("skill", "alpha", "Alpha", "/skill/alpha/"),
                ],
                "/",
            ),
        );
        expect(Object.keys(doc.entries)).toEqual([
            "sohl/skill/alpha",
            "sohl/skill/zeta",
        ]);
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

    const thalorna = (entries: object) => ({
        version: MANIFEST_VERSION,
        package: "thalorna",
        entries,
    });

    it("resolves a foreign address against the consumer's base for that package", () => {
        write(
            "thalorna",
            thalorna({
                "creature/grkrahk": {
                    path: "creature/grukar-ahk/",
                    name: "Grukar-ahk",
                },
            }),
        );
        const r = loadForeignManifests(dir, ["sohl"]);
        expect(r.packages.has("thalorna")).toBe(true);
        expect(r.index.get("creature/grkrahk")).toMatchObject({
            url: "/thalorna/creature/grukar-ahk/",
            package: "thalorna",
        });
    });

    it("repoints every inbound link when a package moves origin", () => {
        // The whole point of the format: relocating a package is one string in
        // the consumer, not 1,445 rewritten manifest entries (#1465).
        write(
            "thalorna",
            thalorna({
                "creature/grkrahk": {
                    path: "creature/grukar-ahk/",
                    name: "Grukar-ahk",
                },
                "polity/kldrn": {
                    path: "polity/kaeldarion/",
                    name: "Kaeldarion",
                },
            }),
        );
        const r = loadForeignManifests(dir, ["sohl"], {
            thalorna: "https://thalorna.example.org/",
        });
        expect(r.index.get("creature/grkrahk")).toMatchObject({
            url: "https://thalorna.example.org/creature/grukar-ahk/",
        });
        expect(r.index.get("polity/kldrn")).toMatchObject({
            url: "https://thalorna.example.org/polity/kaeldarion/",
        });
    });

    it("skips a package built locally — a live build outranks a vendored copy", () => {
        write("sohl", {
            version: MANIFEST_VERSION,
            package: "sohl",
            entries: { "skill/climb": { path: "stale/", name: "Stale" } },
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

    it("rejects the site-absolute shape rather than mis-resolving it", () => {
        // A v1 manifest's `url` is already prefixed; prefixing it again would
        // yield /thalorna/thalorna/… and 404 without erroring anywhere.
        write("thalorna", {
            version: 1,
            package: "thalorna",
            entries: {
                "creature/grkrahk": {
                    url: "/thalorna/creature/grukar-ahk/",
                    name: "Grukar-ahk",
                },
            },
        });
        const r = loadForeignManifests(dir, ["sohl"]);
        expect(r.index.size).toBe(0);
        expect(r.stale[0]).toMatchObject({ package: "thalorna" });
    });

    it("rejects a manifest for a package it holds no base for", () => {
        // Silently dropping it would turn every link into that package back
        // into an unresolved address, which reads as a typo.
        write("elsewhere", {
            version: MANIFEST_VERSION,
            package: "elsewhere",
            entries: { "creature/x": { path: "creature/x/", name: "X" } },
        });
        const r = loadForeignManifests(dir, ["sohl"]);
        expect(r.packages.has("elsewhere")).toBe(false);
        expect(r.stale[0]).toMatchObject({
            package: "elsewhere",
            reason: expect.stringContaining("base"),
        });
    });

    it("rejects a malformed entry rather than emitting a broken href", () => {
        write(
            "thalorna",
            thalorna({
                "creature/grkrahk": {
                    path: "/thalorna/creature/grukar-ahk/",
                    name: "Grukar-ahk",
                },
            }),
        );
        const r = loadForeignManifests(dir, ["sohl"]);
        expect(r.index.size).toBe(0);
        expect(r.stale).toHaveLength(1);
    });

    it("reports an unreadable manifest rather than throwing", () => {
        fs.writeFileSync(path.join(dir, "thalorna.json"), "{ not json");
        const r = loadForeignManifests(dir, ["sohl"]);
        expect(r.stale).toHaveLength(1);
        expect(r.index.size).toBe(0);
    });
});

describe("writeManifests", () => {
    it("round-trips an emitted manifest back to the URL it was built from", () => {
        // Emitted by a package served at its own root, consumed by a site that
        // mounts it under /thalorna/ — the address survives the move because it
        // never carried the mount point.
        writeManifests(
            new Map([
                [
                    "thalorna",
                    [
                        entry(
                            "creature",
                            "grkrahk",
                            "Grukar-ahk",
                            "/creature/grukar-ahk/",
                        ),
                    ],
                ],
            ]),
            dir,
            { thalorna: "/" },
        );
        const r = loadForeignManifests(dir, ["sohl"], PACKAGE_BASE);
        expect(r.index.get("thalorna/creature/grkrahk")).toMatchObject({
            url: "/thalorna/creature/grukar-ahk/",
            name: "Grukar-ahk",
            // Read back off the canonical key, so a consumer can recognise a
            // foreign package's types as addresses at all.
            type: "creature",
        });
    });

    it("carries the Foundry address when a foundry package is given", () => {
        const doc = manifestOf(
            buildManifest(
                "thalorna",
                [
                    {
                        fm: {
                            type: "creature",
                            shortcode: "grkrahk",
                            id: "abcdefabcdef0123",
                        },
                        name: "Grukar-ahk",
                        url: "/creature/grukar-ahk/",
                    },
                ],
                "/",
                "sohl-thalorna",
            ),
        );
        expect(doc.foundryPackage).toBe("sohl-thalorna");
        expect(doc.entries["thalorna/creature/grkrahk"].uuid).toBe(
            "Compendium.sohl-thalorna.actors.Actor.abcdefabcdef0123",
        );
    });

    it("omits the Foundry address for a note that compiles into no document", () => {
        // No `id`, so it becomes no Foundry document. Inventing a UUID would
        // assert a target that does not exist.
        const doc = manifestOf(
            buildManifest(
                "sohl",
                [entry("skill", "climb", "Climbing", "/skill/climbing/")],
                "/",
                "sohl",
            ),
        );
        expect(doc.entries["sohl/skill/climb"].uuid).toBeUndefined();
    });
});

describe("PACKAGE_BASE", () => {
    it("holds a base for every package that exchanges manifests", () => {
        // A missing base is a hard load error, so this is what keeps adding a
        // package to LINK_PACKAGES from failing every build that vendors it.
        for (const pkg of LINK_PACKAGES) {
            expect(PACKAGE_BASE).toHaveProperty(pkg);
        }
    });

    it("states every base as a slash-terminated prefix", () => {
        for (const base of Object.values(PACKAGE_BASE)) {
            expect(String(base).endsWith("/")).toBe(true);
        }
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
