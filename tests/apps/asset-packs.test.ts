/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, it, expect } from "vitest";
import {
    addAssetPack,
    countResolution,
    currentAssetPack,
    directoryLevels,
    folderFromFileUrl,
    emptyFixReport,
    mapLimit,
    needsDownload,
    normalizeFolder,
    packageLocations,
    packageRecord,
    packFileName,
    readAssetPackFile,
    recordPackFolder,
    removeAssetPack,
    rewriteDocumentSource,
    selectAssetPack,
    toDeletionOperators,
    uploadSourceFor,
    type AssetPackFile,
    type AssetPacksSetting,
} from "@src/apps/logic/asset-packs";
import type { AssetEntry, DOMParserLike } from "@src/utils/asset-rewrite";

const URL_A = "https://cdn.example/thalorna/ai-art.json";
const INSTALL = "modules/thalorna/";

const entry = (address: string, target: string, size = 10): AssetEntry => ({
    address,
    target,
    source: `../${target}`,
    size,
});

const pack = (over: Partial<AssetPackFile> = {}): AssetPackFile => ({
    name: "Illustrated",
    package: "thalorna",
    assets: [
        {
            address: "thalorna-none-icon-wolf",
            target: "icons/wolf.webp",
            source: "art/wolf.webp",
            size: 5,
        },
        {
            address: "thalorna-none-image-map",
            target: "images/map.webp",
            source: "https://other.example/map.webp",
            size: 7,
        },
    ],
    ...over,
});

describe("packFileName", () => {
    it("is the URL's last path segment, without query or fragment", () => {
        expect(packFileName("https://x.example/a/b/ai-art.json?v=2#top")).toBe("ai-art.json");
        expect(packFileName("worlds/w/packs/my%20art.json")).toBe("my art.json");
    });
});

describe("readAssetPackFile", () => {
    it("resolves relative sources against the pack file's URL and keeps absolute ones", () => {
        const result = readAssetPackFile(URL_A, pack(), "thalorna");
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.contents.assets.map((a) => a.source)).toEqual([
            "https://cdn.example/thalorna/art/wolf.webp",
            "https://other.example/map.webp",
        ]);
        expect(result.contents.name).toBe("Illustrated");
    });

    it("resolves a relative source against a relative pack URL using the base given", () => {
        const result = readAssetPackFile("packs/ai.json", pack(), "thalorna", "http://h:1/game");
        expect(result.ok && result.contents.assets[0].source).toBe(
            "http://h:1/packs/art/wolf.webp",
        );
    });

    it("refuses a file for another package", () => {
        expect(readAssetPackFile(URL_A, pack({ package: "sohl" }), "thalorna")).toEqual({
            ok: false,
            problem: "package",
        });
    });

    it("refuses a file named default.json", () => {
        expect(
            readAssetPackFile("https://cdn.example/thalorna/default.json", pack(), "thalorna"),
        ).toEqual({ ok: false, problem: "default" });
    });

    it("refuses a malformed file", () => {
        for (const bad of [
            null,
            [],
            { name: "x", package: "thalorna" },
            { name: 1, package: "thalorna", assets: [] },
            {
                name: "x",
                package: "thalorna",
                assets: [{ address: "a", target: "t", source: "s" }],
            },
            {
                name: "x",
                package: "thalorna",
                assets: [{ address: "a", target: "/abs", source: "s", size: 1 }],
            },
            {
                name: "x",
                package: "thalorna",
                assets: [{ address: "a", target: "../up", source: "s", size: 1 }],
            },
        ]) {
            expect(readAssetPackFile(URL_A, bad, "thalorna")).toEqual({
                ok: false,
                problem: "invalid",
            });
        }
    });
});

describe("the setting", () => {
    const contents = pack();

    it("gives a package with no record its default", () => {
        expect(packageRecord({}, "thalorna")).toEqual({ assetPacks: [], current: null, used: [] });
        expect(currentAssetPack({}, "thalorna")).toBeUndefined();
    });

    it("adds a pack, selects it, and leaves the input untouched", () => {
        const before: AssetPacksSetting = {};
        const after = addAssetPack(before, "thalorna", {
            url: URL_A,
            name: "Illustrated",
            contents,
        });
        expect(before).toEqual({});
        expect(after.thalorna.current).toBe(URL_A);
        expect(after.thalorna.assetPacks).toEqual([
            { url: URL_A, name: "Illustrated", contents, folder: null },
        ]);
        expect(currentAssetPack(after, "thalorna")?.url).toBe(URL_A);
    });

    it("replaces a pack added again from the same URL, keeping its folder", () => {
        let s = addAssetPack({}, "thalorna", { url: URL_A, name: "Old", contents });
        s = recordPackFolder(s, "thalorna", URL_A, "art/thal/", INSTALL);
        s = selectAssetPack(s, "thalorna", null);
        s = addAssetPack(s, "thalorna", { url: URL_A, name: "New", contents });
        expect(s.thalorna.assetPacks).toHaveLength(1);
        expect(s.thalorna.assetPacks[0]).toMatchObject({ name: "New", folder: "art/thal/" });
        expect(s.thalorna.current).toBe(URL_A);
    });

    it("selects Default with null, and refuses an unknown URL", () => {
        let s = addAssetPack({}, "thalorna", { url: URL_A, name: "A", contents });
        s = selectAssetPack(s, "thalorna", null);
        expect(s.thalorna.current).toBeNull();
        expect(() => selectAssetPack(s, "thalorna", "https://nope/x.json")).toThrow();
    });

    it("records a pack's folder and every root references have had", () => {
        let s = addAssetPack({}, "thalorna", { url: URL_A, name: "A", contents });
        s = recordPackFolder(s, "thalorna", URL_A, "art/one/", INSTALL);
        s = recordPackFolder(s, "thalorna", URL_A, "art/two/", INSTALL);
        s = recordPackFolder(s, "thalorna", URL_A, "art/one/", INSTALL);
        expect(s.thalorna.assetPacks[0].folder).toBe("art/one/");
        expect(s.thalorna.used).toEqual([INSTALL, "art/one/", "art/two/"]);
    });
});

describe("removeAssetPack", () => {
    const contents = pack();
    const two = () => {
        let s = addAssetPack({}, "thalorna", { url: URL_A, name: "A", contents });
        s = recordPackFolder(s, "thalorna", URL_A, "art/a/", INSTALL);
        s = addAssetPack(s, "thalorna", { url: "https://x.test/b.json", name: "B", contents });
        return s;
    };

    it("removes an added pack that is not selected, leaving the rest and `used` alone", () => {
        const before = two();
        const after = removeAssetPack(before, "thalorna", URL_A);
        expect(after.thalorna.assetPacks.map((p) => p.url)).toEqual(["https://x.test/b.json"]);
        expect(after.thalorna.current).toBe("https://x.test/b.json");
        expect(after.thalorna.used).toEqual(before.thalorna.used);
        expect(before.thalorna.assetPacks).toHaveLength(2);
    });

    it("refuses the selected pack and an unknown URL", () => {
        const s = two();
        expect(() => removeAssetPack(s, "thalorna", "https://x.test/b.json")).toThrow();
        expect(() => removeAssetPack(s, "thalorna", "https://nope/x.json")).toThrow();
        expect(() => removeAssetPack({}, "thalorna", URL_A)).toThrow();
    });
});

describe("normalizeFolder", () => {
    it("ends a folder with exactly one slash", () => {
        expect(normalizeFolder("art/thal")).toBe("art/thal/");
        expect(normalizeFolder("art/thal/")).toBe("art/thal/");
        expect(normalizeFolder("")).toBe("");
    });
});

describe("packageLocations", () => {
    const shipped = [
        entry("thalorna-none-icon-wolf", "icons/wolf.svg"),
        entry("thalorna-none-icon-missing", "icons/missing.svg"),
    ];

    it("points Default at the install root with the shipped entries", () => {
        const loc = packageLocations({ installRoot: INSTALL, shipped, used: [] });
        expect(loc.current).toBe(INSTALL);
        expect(loc.installed).toBe(INSTALL);
        expect([...loc.entries.current.keys()]).toEqual([...loc.entries.installed.keys()]);
        expect(loc.used).toEqual([INSTALL]);
    });

    it("knows every target each address has in the shipped pack and every added pack", () => {
        const loc = packageLocations({
            installRoot: INSTALL,
            shipped,
            used: [],
            known: [pack().assets, [entry("thalorna-none-icon-wolf", "icons/wolf.png")]],
        });
        expect(loc.known?.get("thalorna-none-icon-wolf")).toEqual([
            "icons/wolf.svg",
            "icons/wolf.webp",
            "icons/wolf.png",
        ]);
        expect(loc.known?.get("thalorna-none-image-map")).toEqual(["images/map.webp"]);
    });

    it("points a pack at its folder with only the entries present there", () => {
        const loc = packageLocations({
            installRoot: INSTALL,
            shipped,
            used: [INSTALL, "art/"],
            pack: {
                folder: "art/",
                entries: pack().assets,
                present: new Set(["icons/wolf.webp"]),
            },
        });
        expect(loc.current).toBe("art/");
        expect([...loc.entries.current.keys()]).toEqual(["thalorna-none-icon-wolf"]);
        expect(loc.used).toEqual([INSTALL, "art/"]);
    });
});

describe("uploadSourceFor", () => {
    it("uses the Forge library for a path under its prefix", () => {
        expect(
            uploadSourceFor("https://assets.forge-vtt.com/u1/art/icons", {
                forgePrefix: "https://assets.forge-vtt.com/",
            }),
        ).toEqual({ source: "forgevtt", path: "art/icons" });
    });

    it("uploads to the key prefix of an S3 URL", () => {
        expect(
            uploadSourceFor("https://bucket.s3.example/art/icons", {
                s3: { bucket: "bucket", key: "art/icons" },
            }),
        ).toEqual({ source: "s3", path: "art/icons", bucket: "bucket" });
    });

    it("reads an s3:// folder as its bucket and key", () => {
        expect(uploadSourceFor("s3://bucket/art/icons/", {})).toEqual({
            source: "s3",
            path: "art/icons/",
            bucket: "bucket",
        });
    });

    it("uses user data otherwise", () => {
        expect(uploadSourceFor("art/icons", {})).toEqual({ source: "data", path: "art/icons" });
        expect(
            uploadSourceFor("art/icons", { forgePrefix: "https://assets.forge-vtt.com/" }),
        ).toEqual({ source: "data", path: "art/icons" });
    });
});

describe("folderFromFileUrl", () => {
    it("is the file's URL without its target", () => {
        expect(
            folderFromFileUrl(
                "http://s3.localhost:8333/b/run/a/icons/e2ewolf.svg",
                "icons/e2ewolf.svg",
            ),
        ).toBe("http://s3.localhost:8333/b/run/a/");
        expect(
            folderFromFileUrl("https://b.s3.example/x/images/my%20map.webp", "images/my map.webp"),
        ).toBe("https://b.s3.example/x/");
        expect(folderFromFileUrl("https://elsewhere/x.webp", "images/x.webp")).toBeUndefined();
    });
});

describe("directoryLevels", () => {
    it("lists each level from the top", () => {
        expect(directoryLevels("a/b/c/")).toEqual(["a", "a/b", "a/b/c"]);
        expect(directoryLevels("")).toEqual([]);
    });
});

describe("needsDownload", () => {
    it("downloads what is missing or a different size", () => {
        expect(needsDownload(false, undefined, 5)).toBe(true);
        expect(needsDownload(true, 4, 5)).toBe(true);
        expect(needsDownload(true, undefined, 5)).toBe(true);
        expect(needsDownload(true, 5, 5)).toBe(false);
    });
});

describe("mapLimit", () => {
    it("keeps order and never runs more than the limit at once", async () => {
        let running = 0;
        let peak = 0;
        const out = await mapLimit([1, 2, 3, 4, 5, 6, 7], 3, async (n) => {
            running++;
            peak = Math.max(peak, running);
            await new Promise((r) => setTimeout(r, 1));
            running--;
            return n * 2;
        });
        expect(out).toEqual([2, 4, 6, 8, 10, 12, 14]);
        expect(peak).toBe(3);
    });
});

/** Minimal DOMParser stand-in handling `<img>` tags only. */
class ImgParser implements DOMParserLike {
    parseFromString(html: string) {
        const parts = html.split(/(<img\b[^>]*>)/);
        const maps = parts.map((p) => {
            if (!p.startsWith("<img")) return undefined;
            const m = new Map<string, string>();
            for (const a of p.matchAll(/([\w-]+)="([^"]*)"/g)) m.set(a[1], a[2]);
            return m;
        });
        const els = maps
            .filter((m): m is Map<string, string> => !!m)
            .map((m) => ({
                has: (n: string) => m.has(n),
                getAttribute: (n: string) => m.get(n) ?? null,
                setAttribute: (n: string, v: string) => void m.set(n, v),
                removeAttribute: (n: string) => void m.delete(n),
            }));
        return {
            body: {
                querySelectorAll: () => els.filter((e) => e.has("data-asset")),
                get innerHTML() {
                    return parts
                        .map((p, i) => {
                            const m = maps[i];
                            if (!m) return p;
                            return `<img ${[...m].map(([k, v]) => `${k}="${v}"`).join(" ")}>`;
                        })
                        .join("");
                },
            },
        };
    }
}

describe("rewriteDocumentSource", () => {
    const shipped = [
        entry("thalorna-none-icon-wolf", "icons/wolf.webp"),
        entry("thalorna-none-image-map", "images/map.webp"),
        entry("thalorna-none-icon-missing", "icons/missing.svg"),
    ];
    const locations = {
        thalorna: packageLocations({
            installRoot: INSTALL,
            shipped,
            used: [INSTALL, "art/"],
            pack: {
                folder: "art/",
                entries: shipped,
                present: new Set(["icons/wolf.webp", "images/map.webp"]),
            },
        }),
    };
    const parser = new ImgParser();

    it("rewrites flagged path fields and HTML fields, including inside arrays", () => {
        const source = {
            img: `${INSTALL}icons/wolf.webp`,
            flags: { sohl: { assets: { img: "thalorna-none-icon-wolf" } } },
            system: {
                description: `<p><img src="${INSTALL}images/map.webp" data-asset="thalorna-none-image-map"></p>`,
                notes: [
                    { text: `<img src="x.png">` },
                    {
                        text: `<img src="${INSTALL}icons/wolf.webp" data-asset="thalorna-none-icon-wolf">`,
                    },
                ],
            },
        };
        const report = emptyFixReport();
        const result = rewriteDocumentSource(
            source,
            ["system.description", "system.notes.*.text"],
            locations,
            parser,
            report,
        );
        expect(result.references).toBe(3);
        expect(result.update).toEqual({
            img: "art/icons/wolf.webp",
            system: {
                description: `<p><img src="art/images/map.webp" data-asset="thalorna-none-image-map"></p>`,
                notes: [
                    { text: `<img src="x.png">` },
                    {
                        text: `<img src="art/icons/wolf.webp" data-asset="thalorna-none-icon-wolf">`,
                    },
                ],
            },
        });
        // The source is never mutated.
        expect(source.img).toBe(`${INSTALL}icons/wolf.webp`);
        expect(source.system.notes[1].text).toContain(INSTALL);
    });

    it("rewrites an embedded model that carries its own flags, such as the prototype token", () => {
        const source = {
            img: `${INSTALL}icons/wolf.webp`,
            flags: { sohl: { assets: { img: "thalorna-none-icon-wolf" } } },
            prototypeToken: {
                texture: { src: `${INSTALL}icons/missing.svg` },
                flags: { sohl: { assets: { texture: { src: "thalorna-none-icon-wolf" } } } },
            },
        };
        const result = rewriteDocumentSource(source, [], locations, parser, undefined, [
            "prototypeToken",
        ]);
        expect(result.references).toBe(2);
        expect(result.update).toEqual({
            img: "art/icons/wolf.webp",
            prototypeToken: { texture: { src: "art/icons/wolf.webp" } },
        });
    });

    it("drops a stale flag and leaves the hand-set value", () => {
        const source = {
            img: "my/own.png",
            flags: { sohl: { assets: { img: "thalorna-none-icon-wolf" } } },
        };
        const report = emptyFixReport();
        const result = rewriteDocumentSource(source, [], locations, parser, report);
        expect(result.update).toEqual({ flags: { sohl: { assets: { "-=img": null } } } });
        expect(report.staleDropped).toBe(1);
    });

    it("reports nothing to do for a current document and nothing seen for an unflagged one", () => {
        const current = {
            img: "art/icons/wolf.webp",
            flags: { sohl: { assets: { img: "thalorna-none-icon-wolf" } } },
        };
        expect(rewriteDocumentSource(current, [], locations, parser)).toEqual({
            update: undefined,
            references: 1,
        });
        expect(
            rewriteDocumentSource({ img: "x.png" }, ["system.description"], locations, parser),
        ).toEqual({ update: undefined, references: 0 });
    });
});

describe("countResolution", () => {
    it("tallies fall-backs and stale drops", () => {
        const r = emptyFixReport();
        countResolution(r, { status: "rewrite", value: "x", source: "stand-in" });
        countResolution(r, { status: "unchanged", source: "installed" });
        countResolution(r, { status: "unchanged", source: "current" });
        countResolution(r, { status: "stale" });
        expect(r.fellBack).toBe(2);
        expect(r.staleDropped).toBe(1);
    });
});

describe("toDeletionOperators", () => {
    it("turns each `-=key: null` into `key: <deletion>`", () => {
        const del = { deletion: true };
        expect(
            toDeletionOperators(
                {
                    img: "a",
                    flags: { sohl: { assets: { "-=img": null, texture: { "-=src": null } } } },
                },
                () => del,
            ),
        ).toEqual({ img: "a", flags: { sohl: { assets: { img: del, texture: { src: del } } } } });
    });
});
