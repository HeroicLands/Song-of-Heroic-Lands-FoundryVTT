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

/**
 * Pure rewrite of asset references from their addresses.
 *
 * Every asset reference in a compiled document states its address
 * (`<package>-none-<icon|image>-<shortcode>`) beside the path: `data-asset` on
 * an `<img>`, or `flags.sohl.assets` mirroring a path field. This module builds
 * the path a reference should now have from that address and the world's image
 * locations, and leaves any value a person changed alone. It uses no Foundry API;
 * the HTML parser is a parameter.
 */

/** One `assets.json` entry, in the deployed layout. */
export interface AssetEntry {
    /** The asset's address. */
    address: string;
    /** Path below a location root, with extension: `icons/wolf.webp`. */
    target: string;
    /** URL the file is fetched from, resolved against the URL of the `assets.json` that lists it. */
    readonly source: string;
    /** Size in bytes. */
    size: number;
}

/** The image locations and `assets.json` entries of one Foundry package. */
export interface PackageAssetLocations {
    /** Root the world points at, ending in `/`. */
    current: string;
    /** Every root the package has had in this world, each ending in `/`. */
    used: readonly string[];
    /** Install root (`systems/<id>/` or `modules/<id>/`), ending in `/`. */
    installed: string;
    /** `assets.json` entries of the `current` and `installed` roots, by address. */
    entries: {
        current: ReadonlyMap<string, AssetEntry>;
        installed: ReadonlyMap<string, AssetEntry>;
    };
    /**
     * Every `target` each address has in any set the package has used, by
     * address. The guard accepts any of them under a `used` root, so a file from
     * a set that no longer covers the address is still recognized as its own.
     */
    known?: ReadonlyMap<string, readonly string[]>;
}

/** Locations of every package, keyed by content package (an address's first segment). */
export type AssetLocations = Readonly<Record<string, PackageAssetLocations>>;

/** Which entry set a target came from. */
export type AssetSource = "current" | "installed" | "stand-in";

/**
 * The outcome of resolving one reference.
 *
 * - `unchanged`: the value already is the target.
 * - `rewrite`: set the value to `value`.
 * - `stale`: the value is not the address's own file (a hand edit, or a
 *   random token image); leave it and drop the address.
 * - `unresolved`: nothing can be judged (malformed address, a package with no
 *   locations, or no entry and no stand-in); leave everything alone.
 */
export type AssetResolution =
    | { status: "unchanged"; source: AssetSource }
    | { status: "rewrite"; value: string; source: AssetSource }
    | { status: "stale" }
    | { status: "unresolved" };

/** The slice of an element the HTML rewrite uses. */
export interface ElementLike {
    getAttribute(name: string): string | null;
    setAttribute(name: string, value: string): void;
    removeAttribute(name: string): void;
}

/** The slice of `DOMParser` the HTML rewrite uses. */
export interface DOMParserLike {
    parseFromString(
        html: string,
        type: "text/html",
    ): {
        body: {
            innerHTML: string;
            querySelectorAll(selector: string): Iterable<ElementLike>;
        };
    };
}

const ADDRESS = /^([^-]+)-none-(icon|image)-.+$/;

/**
 * Resolve one reference.
 *
 * The target is the address's entry in the package's `current` entries
 * (`current` + `target`), else its `installed` entry (`installed` + `target`), else
 * the package's stand-in for the address's type (`installed` + the target of
 * `<package>-none-<type>-missing`). A value equal to the target is `unchanged`.
 * Otherwise the value is rewritten only when it is the address's own file — its
 * entry's target, or any of its `known` targets — under a root in `used` or the
 * install root, or the stand-in under the install root; any other value is
 * `stale`.
 *
 * @param address - Full address, e.g. `thalorna-none-icon-wolf`.
 * @param value - The field's or attribute's present value.
 * @param locations - Locations by content package; the address's first
 *   segment selects the package.
 * @returns The resolution; see {@link AssetResolution}.
 */
export function resolveAsset(
    address: string,
    value: string | undefined,
    locations: AssetLocations,
): AssetResolution {
    const parsed = ADDRESS.exec(address);
    if (!parsed) return { status: "unresolved" };
    const [, pkg, type] = parsed;
    if (!Object.hasOwn(locations, pkg)) return { status: "unresolved" };
    const loc = locations[pkg];

    const currentEntry = loc.entries.current.get(address);
    const installedEntry = loc.entries.installed.get(address);
    const standIn = loc.entries.installed.get(`${pkg}-none-${type}-missing`);

    let target: string;
    let source: AssetSource;
    if (currentEntry) {
        target = loc.current + currentEntry.target;
        source = "current";
    } else if (installedEntry) {
        target = loc.installed + installedEntry.target;
        source = "installed";
    } else if (standIn) {
        target = loc.installed + standIn.target;
        source = "stand-in";
    } else {
        return { status: "unresolved" };
    }

    if (typeof value !== "string" || value === "") return { status: "stale" };
    if (value === target) return { status: "unchanged", source };

    const own = new Set(loc.known?.get(address) ?? []);
    const entryTarget = (currentEntry ?? installedEntry)?.target;
    if (entryTarget !== undefined) own.add(entryTarget);
    const roots = [...loc.used, loc.installed];
    const isOwnFile = roots.some(
        (root) => value.startsWith(root) && own.has(value.slice(root.length)),
    );
    const isStandIn = standIn !== undefined && value === loc.installed + standIn.target;
    if (!isOwnFile && !isStandIn) return { status: "stale" };

    return { status: "rewrite", value: target, source };
}

/**
 * Rewrite every `<img data-asset>` in an HTML string.
 *
 * Each such image's `src` is resolved from its address. A stale image loses its
 * `data-asset`. An `<img>` without `data-asset` is never touched.
 *
 * @param html - HTML source.
 * @param locations - See {@link resolveAsset}.
 * @param parser - A `DOMParser`; defaults to the environment's.
 * @param onResolve - Called with each image's resolution, for reporting.
 * @returns The new HTML, or `undefined` when nothing changed.
 */
export function rewriteHtmlAssets(
    html: string,
    locations: AssetLocations,
    parser: DOMParserLike = new (
        globalThis as unknown as { DOMParser: new () => DOMParserLike }
    ).DOMParser(),
    onResolve?: (resolution: AssetResolution) => void,
): string | undefined {
    const body = parser.parseFromString(html, "text/html").body;
    let changed = false;
    for (const img of body.querySelectorAll("img[data-asset]")) {
        const address = img.getAttribute("data-asset");
        if (!address) continue;
        const result = resolveAsset(address, img.getAttribute("src") ?? undefined, locations);
        onResolve?.(result);
        if (result.status === "rewrite") {
            img.setAttribute("src", result.value);
            changed = true;
        } else if (result.status === "stale") {
            img.removeAttribute("data-asset");
            changed = true;
        }
    }
    return changed ? body.innerHTML : undefined;
}

/**
 * Walk the string leaves of a nested object into `[segments, address]` pairs.
 *
 * @param node - Nested object, or a leaf.
 * @param trail - Key segments leading to `node`.
 * @returns One pair per string leaf.
 */
function leaves(node: unknown, trail: string[] = []): [string[], string][] {
    if (typeof node === "string") return trail.length ? [[trail, node]] : [];
    if (node === null || typeof node !== "object") return [];
    return Object.entries(node).flatMap(([k, v]) => leaves(v, [...trail, k]));
}

/**
 * Set a nested key, creating intermediate objects.
 *
 * @param target - Object to write into.
 * @param segments - Key path.
 * @param value - Value stored at the path.
 */
function setNested(target: Record<string, unknown>, segments: string[], value: unknown): void {
    let cursor = target;
    for (const seg of segments.slice(0, -1)) {
        const next = cursor[seg];
        if (next === null || typeof next !== "object") cursor[seg] = {};
        cursor = cursor[seg] as Record<string, unknown>;
    }
    cursor[segments[segments.length - 1]] = value;
}

/**
 * Rewrite the path fields a document's asset flag names.
 *
 * `assets` is `flags.sohl.assets` of the document that holds the fields:
 * nested objects mirroring field paths, with addresses as leaves. Each field's
 * value is read from `source` by that path and resolved. The update is nested
 * (never dotted keys): rewritten fields at their own paths, and each stale
 * flag leaf removed with Foundry's `-=key` syntax under `flags.sohl.assets`.
 *
 * @param source - The document's source object.
 * @param assets - Its `flags.sohl.assets`, if any.
 * @param locations - See {@link resolveAsset}.
 * @param onResolve - Called with each field's resolution, for reporting.
 * @returns A Foundry update object, or `undefined` when nothing changes.
 */
export function rewriteFieldAssets(
    source: object,
    assets: unknown,
    locations: AssetLocations,
    onResolve?: (resolution: AssetResolution) => void,
): Record<string, unknown> | undefined {
    const update: Record<string, unknown> = {};
    let changed = false;
    for (const [segments, address] of leaves(assets)) {
        let present: unknown = source;
        for (const seg of segments) {
            present =
                present !== null && typeof present === "object" ?
                    (present as Record<string, unknown>)[seg]
                :   undefined;
        }
        const result = resolveAsset(
            address,
            typeof present === "string" ? present : undefined,
            locations,
        );
        onResolve?.(result);
        if (result.status === "rewrite") {
            setNested(update, segments, result.value);
            changed = true;
        } else if (result.status === "stale") {
            const last = segments.length - 1;
            const keyed = [...segments.slice(0, last), `-=${segments[last]}`];
            setNested(update, ["flags", "sohl", "assets", ...keyed], null);
            changed = true;
        }
    }
    return changed ? update : undefined;
}
