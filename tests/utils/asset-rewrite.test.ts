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
    resolveAsset,
    rewriteHtmlAssets,
    rewriteFieldAssets,
    type AssetEntry,
    type AssetLocations,
    type AssetResolution,
    type DOMParserLike,
} from "@src/utils/asset-rewrite";

const INSTALL = "modules/thalorna/";
const WORLD = "worlds/mine/thalorna/";
const OLD = "https://old.example/thalorna/";

const entry = (address: string, target: string): [string, AssetEntry] => [
    address,
    { address, target, source: `sources/${target}`, size: 1 },
];

const ADDR = "thalorna-none-icon-wolf";
const IMG = "thalorna-none-image-map";

function locations(
    over: {
        current?: string;
        used?: string[];
        currentEntries?: [string, AssetEntry][];
        installedEntries?: [string, AssetEntry][];
    } = {},
): AssetLocations {
    return {
        thalorna: {
            current: over.current ?? WORLD,
            used: over.used ?? [INSTALL, WORLD, OLD],
            installed: INSTALL,
            entries: {
                current: new Map(over.currentEntries ?? []),
                installed: new Map(
                    over.installedEntries ?? [
                        entry("thalorna-none-icon-missing", "icons/missing.svg"),
                        entry("thalorna-none-image-missing", "images/missing.svg"),
                    ],
                ),
            },
        },
    };
}

describe("resolveAsset", () => {
    it("targets the current location's entry first", () => {
        const loc = locations({
            currentEntries: [entry(ADDR, "icons/wolf.webp")],
            installedEntries: [
                entry(ADDR, "icons/wolf.webp"),
                entry("thalorna-none-icon-missing", "icons/missing.svg"),
            ],
        });
        expect(resolveAsset(ADDR, `${INSTALL}icons/wolf.webp`, loc)).toEqual({
            status: "rewrite",
            value: `${WORLD}icons/wolf.webp`,
            source: "current",
        });
    });

    it("falls back to the installed entry", () => {
        const loc = locations({
            installedEntries: [entry(ADDR, "icons/wolf.webp")],
        });
        expect(resolveAsset(ADDR, `${OLD}icons/wolf.webp`, loc)).toEqual({
            status: "rewrite",
            value: `${INSTALL}icons/wolf.webp`,
            source: "installed",
        });
    });

    it("falls back to the stand-in for the address's type", () => {
        const loc = locations();
        expect(resolveAsset(ADDR, `${WORLD}icons/wolf.webp`, loc)).toEqual({ status: "stale" });
        expect(resolveAsset(IMG, `${INSTALL}images/missing.svg`, loc)).toEqual({
            status: "unchanged",
            source: "stand-in",
        });
        expect(
            resolveAsset(
                IMG,
                `${INSTALL}images/map.webp`,
                locations({
                    installedEntries: [entry("thalorna-none-image-missing", "images/missing.svg")],
                }),
            ),
        ).toEqual({ status: "stale" });
    });

    it("moves the address's file from another set's root to the stand-in when no set covers it", () => {
        const base = locations();
        const loc: AssetLocations = {
            thalorna: {
                ...base.thalorna,
                known: new Map([[ADDR, ["icons/wolf.webp"]]]),
            },
        };
        expect(resolveAsset(ADDR, `${WORLD}icons/wolf.webp`, loc)).toEqual({
            status: "rewrite",
            value: `${INSTALL}icons/missing.svg`,
            source: "stand-in",
        });
        expect(resolveAsset(ADDR, `${WORLD}icons/other.webp`, loc)).toEqual({ status: "stale" });
    });

    it("rewrites the stand-in to the real file once a location holds it", () => {
        const standIn = `${INSTALL}icons/missing.svg`;
        const loc = locations({ currentEntries: [entry(ADDR, "icons/wolf.webp")] });
        expect(resolveAsset(ADDR, standIn, loc)).toEqual({
            status: "rewrite",
            value: `${WORLD}icons/wolf.webp`,
            source: "current",
        });
    });

    it("is idempotent", () => {
        const loc = locations({ currentEntries: [entry(ADDR, "icons/wolf.webp")] });
        expect(resolveAsset(ADDR, `${WORLD}icons/wolf.webp`, loc)).toEqual({
            status: "unchanged",
            source: "current",
        });
    });

    it("leaves a hand-picked value alone and reports it stale", () => {
        const loc = locations({ currentEntries: [entry(ADDR, "icons/wolf.webp")] });
        expect(resolveAsset(ADDR, "worlds/mine/art/my-wolf.png", loc)).toEqual({
            status: "stale",
        });
    });

    it("reports a random token image under a used root as stale", () => {
        const loc = locations({ currentEntries: [entry(ADDR, "icons/wolf.webp")] });
        expect(resolveAsset(ADDR, `${INSTALL}icons/other.webp`, loc)).toEqual({ status: "stale" });
    });

    it("reports the address's file under a root not in used as stale", () => {
        const loc = locations({
            used: [INSTALL],
            currentEntries: [entry(ADDR, "icons/wolf.webp")],
        });
        expect(resolveAsset(ADDR, `${OLD}icons/wolf.webp`, loc)).toEqual({ status: "stale" });
    });

    it("reports a missing or non-string value as stale", () => {
        const loc = locations({ currentEntries: [entry(ADDR, "icons/wolf.webp")] });
        expect(resolveAsset(ADDR, undefined, loc)).toEqual({ status: "stale" });
        expect(resolveAsset(ADDR, "", loc)).toEqual({ status: "stale" });
    });

    it("is unresolved for a package without locations or a malformed address", () => {
        const loc = locations();
        expect(resolveAsset("sohl-none-icon-x", "a.png", loc)).toEqual({
            status: "unresolved",
        });
        expect(resolveAsset("not-an-address", "a.png", loc)).toEqual({
            status: "unresolved",
        });
    });

    it("is unresolved when nothing, not even a stand-in, can be targeted", () => {
        const loc = locations({ installedEntries: [] });
        expect(resolveAsset(ADDR, `${INSTALL}icons/wolf.webp`, loc)).toEqual({
            status: "unresolved",
        });
    });
});

/** A minimal stand-in for DOMParser: handles `<img>` tags only. */
class FakeParser implements DOMParserLike {
    parseFromString(html: string) {
        const attrs = (tag: string) => {
            const map = new Map<string, string>();
            for (const m of tag.matchAll(/([\w-]+)="([^"]*)"/g)) map.set(m[1], m[2]);
            return map;
        };
        const parts = html.split(/(<img\b[^>]*>)/);
        const imgs = parts.map((p) => (p.startsWith("<img") ? attrs(p) : undefined));
        const elements = imgs
            .filter((a): a is Map<string, string> => a !== undefined)
            .map((a) => ({
                hasAttr: (n: string) => a.has(n),
                getAttribute: (n: string) => a.get(n) ?? null,
                setAttribute: (n: string, v: string) => void a.set(n, v),
                removeAttribute: (n: string) => void a.delete(n),
            }));
        return {
            body: {
                querySelectorAll: (sel: string) => {
                    expect(sel).toBe("img[data-asset]");
                    return elements.filter((e) => e.hasAttr("data-asset"));
                },
                get innerHTML() {
                    return parts
                        .map((p, i) => {
                            const a = imgs[i];
                            if (!a) return p;
                            return `<img ${[...a].map(([k, v]) => `${k}="${v}"`).join(" ")}>`;
                        })
                        .join("");
                },
            },
        };
    }
}

describe("rewriteHtmlAssets", () => {
    const loc = locations({
        currentEntries: [entry(ADDR, "icons/wolf.webp"), entry(IMG, "images/map.webp")],
    });
    const parser = new FakeParser();

    it("rewrites every <img data-asset>, dropping data-asset from a stale one", () => {
        const html =
            `<p>a</p><img src="${INSTALL}icons/wolf.webp" data-asset="${ADDR}">` +
            `<img src="mine/hand.png" data-asset="${IMG}">` +
            `<img src="${INSTALL}images/map.webp" data-asset="${IMG}">`;
        const seen: AssetResolution[] = [];
        const out = rewriteHtmlAssets(html, loc, parser, (r) => seen.push(r));
        expect(out).toBe(
            `<p>a</p><img src="${WORLD}icons/wolf.webp" data-asset="${ADDR}">` +
                `<img src="mine/hand.png">` +
                `<img src="${WORLD}images/map.webp" data-asset="${IMG}">`,
        );
        expect(seen.map((r) => r.status)).toEqual(["rewrite", "stale", "rewrite"]);
    });

    it("never touches an <img> without data-asset", () => {
        const html = `<img src="${INSTALL}icons/wolf.webp">`;
        expect(rewriteHtmlAssets(html, loc, parser)).toBeUndefined();
    });

    it("returns undefined when nothing changes, including no images", () => {
        expect(rewriteHtmlAssets("<p>text</p>", loc, parser)).toBeUndefined();
        const current = `<img src="${WORLD}icons/wolf.webp" data-asset="${ADDR}">`;
        expect(rewriteHtmlAssets(current, loc, parser)).toBeUndefined();
    });

    it("leaves an unresolved image's markup alone", () => {
        const html = `<img src="x.png" data-asset="sohl-none-icon-x">`;
        expect(rewriteHtmlAssets(html, loc, parser)).toBeUndefined();
    });
});

describe("rewriteFieldAssets", () => {
    const loc = locations({
        currentEntries: [entry(ADDR, "icons/wolf.webp")],
    });

    it("rewrites a flat field", () => {
        const source = { img: `${INSTALL}icons/wolf.webp` };
        const flags = { img: ADDR };
        expect(rewriteFieldAssets(source, flags, loc)).toEqual({
            img: `${WORLD}icons/wolf.webp`,
        });
    });

    it("walks nested flag keys and writes nested updates", () => {
        // The document is the prototype token: flags sit beside the field.
        const source = {
            texture: { src: `${INSTALL}icons/wolf.webp` },
            flags: { sohl: { assets: { texture: { src: ADDR } } } },
        };
        const flags = source.flags.sohl.assets;
        const update = rewriteFieldAssets(source, flags, loc);
        expect(update).toEqual({ texture: { src: `${WORLD}icons/wolf.webp` } });
        expect(JSON.stringify(update)).not.toMatch(/"[^"]*\.[^"]*":/);
    });

    it("removes stale flag keys with nested deletion syntax", () => {
        const source = {
            img: "worlds/mine/hand.png",
            texture: { src: "worlds/mine/hand2.png" },
        };
        const flags = { img: ADDR, texture: { src: ADDR } };
        expect(rewriteFieldAssets(source, flags, loc)).toEqual({
            flags: {
                sohl: {
                    assets: { "-=img": null, texture: { "-=src": null } },
                },
            },
        });
    });

    it("combines rewrites and stale removals and skips unresolved or current fields", () => {
        const source = {
            img: `${INSTALL}icons/wolf.webp`,
            other: "mine.png",
            same: `${WORLD}icons/wolf.webp`,
            odd: "z.png",
        };
        const flags = {
            img: ADDR,
            other: ADDR,
            same: ADDR,
            odd: "sohl-none-icon-q",
        };
        expect(rewriteFieldAssets(source, flags, loc)).toEqual({
            img: `${WORLD}icons/wolf.webp`,
            flags: { sohl: { assets: { "-=other": null } } },
        });
    });

    it("returns undefined when there is nothing to do", () => {
        expect(rewriteFieldAssets({}, undefined, loc)).toBeUndefined();
        expect(
            rewriteFieldAssets({ img: `${WORLD}icons/wolf.webp` }, { img: ADDR }, loc),
        ).toBeUndefined();
    });

    it("treats an absent field value as stale", () => {
        expect(rewriteFieldAssets({}, { img: ADDR }, loc)).toEqual({
            flags: { sohl: { assets: { "-=img": null } } },
        });
    });
});
