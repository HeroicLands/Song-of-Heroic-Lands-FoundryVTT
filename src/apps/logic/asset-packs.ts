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
 * Foundry-free logic behind the Asset Packs setting and its Fix button.
 *
 * A content package ships its art as `asset-sets/default.json` at its install
 * root (the **Default** pack). A GM may add other packs by the URL of a pack
 * file, `{name, package, assets: [{address, source, target, size}]}`; the file
 * is stored in the world setting with every relative `source` made absolute.
 * Fix downloads the selected pack's files into a folder the GM picks and
 * rewrites world references with {@link sohl.utils.resolveAsset}.
 */

import {
    rewriteFieldAssets,
    rewriteHtmlAssets,
    type AssetEntry,
    type AssetLocations,
    type AssetResolution,
    type DOMParserLike,
    type PackageAssetLocations,
} from "@src/utils/asset-rewrite";

/** A pack file: one content package's art in the deployed layout. */
export interface AssetPackFile {
    /** Display name. */
    name: string;
    /** Content package the pack is for: an address's first segment. */
    package: string;
    /** One entry per file. */
    assets: AssetEntry[];
}

/** A pack added to a package, as the world setting stores it. */
export interface StoredAssetPack {
    /** URL the pack file was fetched from; identifies the pack. */
    url: string;
    /** The pack's display name. */
    name: string;
    /** The pack file, every `source` absolute. */
    contents: AssetPackFile;
    /** Folder Fix last downloaded the pack into, ending in `/`; `null` before the first Fix. */
    folder: string | null;
}

/** One content package's record in the setting. */
export interface PackageAssetPacks {
    /** Packs added for the package; Default is never listed. */
    assetPacks: StoredAssetPack[];
    /** URL of the selected pack; `null` is Default. */
    current: string | null;
    /** Every root the package's references have had in this world, each ending in `/`. */
    used: string[];
}

/** The `sohl.imageLocations` world setting, keyed by content package. */
export type AssetPacksSetting = Record<string, PackageAssetPacks>;

/** Why a pack file was refused. */
export type PackFileProblem = "invalid" | "package" | "default";

/** The outcome of reading a fetched pack file. */
export type PackFileResult =
    { ok: true; contents: AssetPackFile } | { ok: false; problem: PackFileProblem };

/** File name reserved for the shipped pack. */
export const DEFAULT_PACK_FILE = "default.json";

/** Path of the shipped pack below a package's install root. */
export const DEFAULT_PACK_PATH = "asset-sets/default.json";

/**
 * The file name a URL names: its last path segment, decoded.
 *
 * @param url - Absolute or relative URL.
 * @returns The file name.
 */
export function packFileName(url: string): string {
    const path = url.split(/[?#]/, 1)[0];
    const last = path.slice(path.lastIndexOf("/") + 1);
    try {
        return decodeURIComponent(last);
    } catch {
        return last;
    }
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
    v !== null && typeof v === "object" && !Array.isArray(v);

/**
 * Whether a `target` is a relative path that stays below its root.
 *
 * @param target - Candidate target.
 * @returns True for `icons/wolf.webp`; false for `/x`, `../x`, `a/../../x` or a URL.
 */
function isSafeTarget(target: string): boolean {
    if (!target || target.startsWith("/") || /^[a-z][a-z0-9+.-]*:/i.test(target)) return false;
    return !target.split("/").some((seg) => seg === ".." || seg === "");
}

/**
 * Check the shape of a parsed pack file.
 *
 * @param json - Parsed JSON.
 * @returns The pack file, or `undefined` when its shape is wrong.
 */
export function parseAssetPackFile(json: unknown): AssetPackFile | undefined {
    if (!isRecord(json)) return undefined;
    const { name, package: pkg, assets } = json;
    if (typeof name !== "string" || typeof pkg !== "string" || !Array.isArray(assets)) {
        return undefined;
    }
    const entries: AssetEntry[] = [];
    for (const a of assets) {
        if (
            !isRecord(a) ||
            typeof a.address !== "string" ||
            typeof a.source !== "string" ||
            typeof a.target !== "string" ||
            typeof a.size !== "number" ||
            !isSafeTarget(a.target)
        ) {
            return undefined;
        }
        entries.push({ address: a.address, source: a.source, target: a.target, size: a.size });
    }
    return { name, package: pkg, assets: entries };
}

/**
 * Read a pack file fetched from `url` for the package `pkg`.
 *
 * Refuses a malformed file, a file whose `package` is not `pkg`, and a file
 * named `default.json` (reserved for the shipped pack). Every relative
 * `source` is resolved against `url`, itself resolved against `base` when
 * relative, so the stored copy records where each file comes from.
 *
 * @param url - URL the file was fetched from.
 * @param json - The parsed file.
 * @param pkg - Content package of the settings row.
 * @param base - Base for a relative `url`, such as the page's address.
 * @returns The pack file with absolute sources, or the problem.
 */
export function readAssetPackFile(
    url: string,
    json: unknown,
    pkg: string,
    base?: string,
): PackFileResult {
    if (packFileName(url) === DEFAULT_PACK_FILE) return { ok: false, problem: "default" };
    const parsed = parseAssetPackFile(json);
    if (!parsed) return { ok: false, problem: "invalid" };
    if (parsed.package !== pkg) return { ok: false, problem: "package" };
    let origin: URL;
    try {
        origin = new URL(url, base);
    } catch {
        return { ok: false, problem: "invalid" };
    }
    const assets = parsed.assets.map((a) => ({ ...a, source: new URL(a.source, origin).href }));
    return { ok: true, contents: { ...parsed, assets } };
}

/**
 * A package's record, or the Default record when it has none.
 *
 * @param setting - The setting.
 * @param pkg - Content package.
 * @returns The record (never shared with `setting`).
 */
export function packageRecord(setting: AssetPacksSetting, pkg: string): PackageAssetPacks {
    const rec = Object.hasOwn(setting, pkg) ? setting[pkg] : undefined;
    return {
        assetPacks: [...(rec?.assetPacks ?? [])],
        current: rec?.current ?? null,
        used: [...(rec?.used ?? [])],
    };
}

/**
 * The package's selected pack, or `undefined` for Default.
 *
 * @param setting - The setting.
 * @param pkg - Content package.
 * @returns The selected pack.
 */
export function currentAssetPack(
    setting: AssetPacksSetting,
    pkg: string,
): StoredAssetPack | undefined {
    const rec = packageRecord(setting, pkg);
    return rec.current === null ? undefined : rec.assetPacks.find((p) => p.url === rec.current);
}

/**
 * Add a pack and select it. A pack added again from the same URL replaces the
 * stored copy and keeps its folder.
 *
 * @param setting - The setting; not modified.
 * @param pkg - Content package.
 * @param added - The pack.
 * @param added.url - URL the pack file was fetched from.
 * @param added.name - Display name.
 * @param added.contents - The pack file, sources absolute.
 * @returns The new setting.
 */
export function addAssetPack(
    setting: AssetPacksSetting,
    pkg: string,
    added: { url: string; name: string; contents: AssetPackFile },
): AssetPacksSetting {
    const rec = packageRecord(setting, pkg);
    const prior = rec.assetPacks.find((p) => p.url === added.url);
    const stored: StoredAssetPack = { ...added, folder: prior?.folder ?? null };
    const assetPacks =
        prior ?
            rec.assetPacks.map((p) => (p.url === added.url ? stored : p))
        :   [...rec.assetPacks, stored];
    return { ...setting, [pkg]: { ...rec, assetPacks, current: added.url } };
}

/**
 * Select a package's pack.
 *
 * @param setting - The setting; not modified.
 * @param pkg - Content package.
 * @param url - URL of an added pack, or `null` for Default.
 * @returns The new setting.
 * @throws When `url` names no added pack.
 */
export function selectAssetPack(
    setting: AssetPacksSetting,
    pkg: string,
    url: string | null,
): AssetPacksSetting {
    const rec = packageRecord(setting, pkg);
    if (url !== null && !rec.assetPacks.some((p) => p.url === url)) {
        throw new Error(`No asset pack ${url} is added for ${pkg}`);
    }
    return { ...setting, [pkg]: { ...rec, current: url } };
}

/**
 * Remove an added pack from a package. Only the stored pack goes: downloaded
 * files stay where they are and the package's `used` roots are unchanged.
 *
 * @param setting - The setting; not modified.
 * @param pkg - Content package.
 * @param url - URL of an added pack that is not the selected one.
 * @returns The new setting.
 * @throws When `url` names no added pack, or names the selected pack.
 */
export function removeAssetPack(
    setting: AssetPacksSetting,
    pkg: string,
    url: string,
): AssetPacksSetting {
    const rec = packageRecord(setting, pkg);
    if (!rec.assetPacks.some((p) => p.url === url)) {
        throw new Error(`No asset pack ${url} is added for ${pkg}`);
    }
    if (rec.current === url) throw new Error(`Asset pack ${url} is selected for ${pkg}`);
    return {
        ...setting,
        [pkg]: { ...rec, assetPacks: rec.assetPacks.filter((p) => p.url !== url) },
    };
}

/**
 * Record the folder a pack was downloaded into, and add it and the install
 * root to the package's `used` roots.
 *
 * @param setting - The setting; not modified.
 * @param pkg - Content package.
 * @param url - The pack's URL.
 * @param folder - Folder, ending in `/`.
 * @param installRoot - The package's install root.
 * @returns The new setting.
 */
export function recordPackFolder(
    setting: AssetPacksSetting,
    pkg: string,
    url: string,
    folder: string,
    installRoot: string,
): AssetPacksSetting {
    const rec = packageRecord(setting, pkg);
    const assetPacks = rec.assetPacks.map((p) => (p.url === url ? { ...p, folder } : p));
    const used = [...rec.used];
    for (const root of [installRoot, folder]) if (!used.includes(root)) used.push(root);
    return { ...setting, [pkg]: { ...rec, assetPacks, used } };
}

/**
 * End a folder path with exactly one `/`; an empty path stays empty.
 *
 * @param path - Folder path or URL.
 * @returns The folder.
 */
export function normalizeFolder(path: string): string {
    const trimmed = path.replace(/\/+$/, "");
    return trimmed ? `${trimmed}/` : "";
}

/**
 * Build one package's locations for {@link sohl.utils.resolveAsset}.
 *
 * With no `pack`, the package is at Default: the install root with the shipped
 * entries. With a pack, the current root is its folder and the current entries
 * are only those whose `target` is in `present`, so an absent file falls back
 * to the shipped copy, then the stand-in.
 *
 * `known` collects every target each address has in the shipped pack and in
 * every pack listed, so the guard recognizes a file from any of them.
 *
 * @param args - The package's roots and entries.
 * @param args.installRoot - The install root, ending in `/`.
 * @param args.shipped - The shipped pack's entries.
 * @param args.used - The recorded `used` roots.
 * @param args.known - The entries of every added pack.
 * @param args.pack - The selected pack, when it is not Default.
 * @param args.pack.folder - Its folder, ending in `/`.
 * @param args.pack.entries - Its entries.
 * @param args.pack.present - Targets present in the folder.
 * @returns The package's locations.
 */
export function packageLocations(args: {
    installRoot: string;
    shipped: readonly AssetEntry[];
    used: readonly string[];
    known?: readonly (readonly AssetEntry[])[];
    pack?: { folder: string; entries: readonly AssetEntry[]; present: ReadonlySet<string> };
}): PackageAssetLocations {
    const byAddress = (list: readonly AssetEntry[]) =>
        new Map(list.map((e) => [e.address, e] as [string, AssetEntry]));
    const installed = byAddress(args.shipped);
    const used = [...args.used];
    if (!used.includes(args.installRoot)) used.unshift(args.installRoot);
    const known = new Map<string, string[]>();
    for (const list of [args.shipped, ...(args.known ?? []), args.pack?.entries ?? []]) {
        for (const e of list) {
            const targets = known.get(e.address) ?? [];
            if (!targets.includes(e.target)) targets.push(e.target);
            known.set(e.address, targets);
        }
    }
    if (!args.pack) {
        return {
            current: args.installRoot,
            installed: args.installRoot,
            used,
            entries: { current: installed, installed },
            known,
        };
    }
    const { folder, entries, present } = args.pack;
    if (!used.includes(folder)) used.push(folder);
    return {
        current: folder,
        installed: args.installRoot,
        used,
        entries: {
            current: byAddress(entries.filter((e) => present.has(e.target))),
            installed,
        },
        known,
    };
}

/** A Foundry file storage. */
export type UploadSource = "forgevtt" | "s3" | "data";

/**
 * Choose the storage a folder lives in and the path to upload to.
 *
 * `forgevtt` when the folder starts with the Forge Assets Library prefix (the
 * path is the part after the prefix and the user's id segment); `s3` when it
 * matches an S3 URL or is written `s3://<bucket>/<key>` (the path is the key
 * prefix); `data` otherwise.
 *
 * @param folder - Folder path or URL.
 * @param env - What decides the storage.
 * @param env.forgePrefix - The Forge Assets Library prefix, when on the Forge.
 * @param env.s3 - The S3 match of `folder`, if any.
 * @param env.s3.bucket - Its bucket.
 * @param env.s3.key - Its key.
 * @returns Storage, upload path and S3 bucket.
 */
export function uploadSourceFor(
    folder: string,
    env: { forgePrefix?: string; s3?: { bucket: string; key: string } },
): { source: UploadSource; path: string; bucket?: string } {
    if (env.forgePrefix && folder.startsWith(env.forgePrefix)) {
        const rest = folder.slice(env.forgePrefix.length);
        return { source: "forgevtt", path: rest.slice(rest.indexOf("/") + 1) };
    }
    const s3Scheme = /^s3:\/\/([^/]+)\/?(.*)$/.exec(folder);
    if (s3Scheme) return { source: "s3", path: s3Scheme[2], bucket: s3Scheme[1] };
    if (env.s3) return { source: "s3", path: env.s3.key, bucket: env.s3.bucket };
    return { source: "data", path: folder };
}

/**
 * The folder a file sits in, given the file's URL and its `target` below the
 * folder; the target may appear URL-encoded.
 *
 * @param fileUrl - The file's URL, as a storage reports it.
 * @param target - The file's target.
 * @returns The folder, ending in `/`, or `undefined` when the URL does not end in the target.
 */
export function folderFromFileUrl(fileUrl: string, target: string): string | undefined {
    const encoded = target.split("/").map(encodeURIComponent).join("/");
    for (const tail of [target, encoded]) {
        if (fileUrl.endsWith(`/${tail}`)) return fileUrl.slice(0, fileUrl.length - tail.length);
    }
    return undefined;
}

/**
 * Each directory level of a path, from the top: `a/b/` → `["a", "a/b"]`.
 *
 * @param path - Directory path.
 * @returns The levels.
 */
export function directoryLevels(path: string): string[] {
    const segs = path.split("/").filter(Boolean);
    return segs.map((_, i) => segs.slice(0, i + 1).join("/"));
}

/**
 * Whether a file must be downloaded.
 *
 * @param listed - The folder holds a file of that name.
 * @param contentLength - Size a `HEAD` reported, if any.
 * @param size - Size the pack states.
 * @returns True when missing or a different size.
 */
export function needsDownload(
    listed: boolean,
    contentLength: number | undefined,
    size: number,
): boolean {
    return !listed || contentLength !== size;
}

/**
 * Map over items with at most `limit` calls in flight, keeping order.
 *
 * @param items - Inputs.
 * @param limit - Concurrency.
 * @param fn - Async mapper.
 * @returns The results in input order.
 */
export async function mapLimit<T, R>(
    items: readonly T[],
    limit: number,
    fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
    const out: R[] = new Array(items.length);
    let next = 0;
    const worker = async () => {
        while (next < items.length) {
            const i = next++;
            out[i] = await fn(items[i], i);
        }
    };
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
    return out;
}

/** What one Fix did. */
export interface FixReport {
    /** Files downloaded. */
    downloaded: number;
    /** Files already present at the stated size. */
    present: number;
    /** Files that failed to download. */
    failed: number;
    /** Documents written. */
    changed: number;
    /** Documents with references that needed nothing. */
    current: number;
    /** References resolved to a file other than the selected pack's. */
    fellBack: number;
    /** References left alone because a person changed them; their address was dropped. */
    staleDropped: number;
    /** Packages skipped because the GM cancelled. */
    skipped: string[];
    /** Messages for files that failed. */
    errors: string[];
}

/**
 * A report with every count at zero.
 *
 * @returns The report.
 */
export function emptyFixReport(): FixReport {
    return {
        downloaded: 0,
        present: 0,
        failed: 0,
        changed: 0,
        current: 0,
        fellBack: 0,
        staleDropped: 0,
        skipped: [],
        errors: [],
    };
}

/**
 * Count one reference's resolution into a report.
 *
 * @param report - Report to update.
 * @param res - The resolution.
 */
export function countResolution(report: FixReport, res: AssetResolution): void {
    if (res.status === "stale") report.staleDropped++;
    else if ((res.status === "rewrite" || res.status === "unchanged") && res.source !== "current") {
        report.fellBack++;
    }
}

/**
 * Read a nested value by path segments.
 *
 * @param obj - Root.
 * @param segs - Path.
 * @returns The value.
 */
function getAt(obj: unknown, segs: readonly string[]): unknown {
    let cur = obj;
    for (const s of segs) cur = isRecord(cur) || Array.isArray(cur) ? (cur as any)[s] : undefined;
    return cur;
}

/**
 * Rewrite the HTML at a path in `root` (mutating it), where a `*` segment
 * stands for every element of an array.
 *
 * @param root - Object to rewrite in place.
 * @param segs - Path segments.
 * @param rewrite - Returns the new HTML, or `undefined` when unchanged.
 * @returns Whether anything changed.
 */
function rewriteHtmlAt(
    root: unknown,
    segs: readonly string[],
    rewrite: (html: string) => string | undefined,
): boolean {
    const star = segs.indexOf("*");
    if (star < 0) {
        const parent = getAt(root, segs.slice(0, -1));
        const key = segs[segs.length - 1];
        if (!isRecord(parent) || typeof parent[key] !== "string") return false;
        const next = rewrite(parent[key] as string);
        if (next === undefined) return false;
        parent[key] = next;
        return true;
    }
    const arr = getAt(root, segs.slice(0, star));
    if (!Array.isArray(arr)) return false;
    let changed = false;
    for (const el of arr) {
        if (rewriteHtmlAt(el, segs.slice(star + 1), rewrite)) changed = true;
    }
    return changed;
}

/**
 * Deep-merge plain objects (b wins on leaves).
 *
 * @param a - Base.
 * @param b - Overlay.
 * @returns A new object.
 */
function mergeUpdates(a: Record<string, unknown>, b: Record<string, unknown>) {
    const out: Record<string, unknown> = { ...a };
    for (const [k, v] of Object.entries(b)) {
        out[k] = isRecord(out[k]) && isRecord(v) ? mergeUpdates(out[k] as any, v) : v;
    }
    return out;
}

/**
 * Compute the update that points one document's references at the current
 * locations.
 *
 * Path fields are those named in `flags.sohl.assets`, through
 * {@link rewriteFieldAssets}. HTML fields are the dotted `htmlPaths` (a `*`
 * segment stands for every array element), each through
 * {@link rewriteHtmlAssets}; an array holding a rewritten field is written
 * back whole, since Foundry rebuilds an array updated by index.
 *
 * @param source - The document's source; not modified.
 * @param htmlPaths - Paths of the document's HTML fields.
 * @param locations - Locations by content package.
 * @param parser - A `DOMParser`.
 * @param report - Receives each reference's resolution.
 * @param flaggedModels - Keys of embedded models that carry their own
 *   `flags.sohl.assets` for their own fields, such as an actor's
 *   `prototypeToken`.
 * @returns The update (or `undefined`) and the number of references seen.
 */
export function rewriteDocumentSource(
    source: Record<string, unknown>,
    htmlPaths: readonly string[],
    locations: AssetLocations,
    parser: DOMParserLike,
    report?: FixReport,
    flaggedModels: readonly string[] = [],
): { update: Record<string, unknown> | undefined; references: number } {
    let references = 0;
    const onResolve = (res: AssetResolution) => {
        references++;
        if (report) countResolution(report, res);
    };
    const flags = getAt(source, ["flags", "sohl", "assets"]);
    let update = rewriteFieldAssets(source, flags, locations, onResolve) ?? {};
    for (const key of flaggedModels) {
        const model = source[key];
        if (!isRecord(model)) continue;
        const own = getAt(model, ["flags", "sohl", "assets"]);
        const sub = rewriteFieldAssets(model, own, locations, onResolve);
        if (sub) update = mergeUpdates(update, { [key]: sub });
    }

    let copy: Record<string, unknown> | undefined;
    for (const path of htmlPaths) {
        const segs = path.split(".");
        const top = segs.indexOf("*") < 0 ? segs : segs.slice(0, segs.indexOf("*"));
        const value = getAt(source, top);
        if (value === undefined || value === null) continue;
        if (typeof value === "string" && !value.includes("data-asset")) continue;
        copy ??= JSON.parse(JSON.stringify(source)) as Record<string, unknown>;
        const changed = rewriteHtmlAt(copy, segs, (html) =>
            html.includes("data-asset") ?
                rewriteHtmlAssets(html, locations, parser, onResolve)
            :   undefined,
        );
        if (!changed) continue;
        const patch: Record<string, unknown> = {};
        let cur = patch;
        top.forEach((seg, i) => {
            if (i === top.length - 1) cur[seg] = getAt(copy, top);
            else cur = cur[seg] = {} as Record<string, unknown>;
        });
        update = mergeUpdates(update, patch);
    }
    return { update: Object.keys(update).length ? update : undefined, references };
}

/**
 * Replace each legacy `"-=key": null` deletion with `key: <deletion>`.
 *
 * @param update - An update from {@link rewriteDocumentSource}.
 * @param deletion - Makes the deletion marker (Foundry's `ForcedDeletion`).
 * @returns A new update.
 */
export function toDeletionOperators(
    update: Record<string, unknown>,
    deletion: () => unknown,
): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(update)) {
        if (k.startsWith("-=") && v === null) out[k.slice(2)] = deletion();
        else out[k] = isRecord(v) ? toDeletionOperators(v, deletion) : v;
    }
    return out;
}
