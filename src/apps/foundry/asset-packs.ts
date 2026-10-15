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
 * Foundry binding of asset packs: the world setting, discovery of the content
 * packages that ship `asset-sets/default.json`, the Fix run (download, then
 * rewrite world references) and the import hook.
 *
 * Nothing here runs on its own except the `preCreate` rewrite, which only
 * points incoming references at files already present; downloads and world
 * writes happen only when a GM presses Fix.
 */

import {
    DEFAULT_PACK_PATH,
    currentAssetPack,
    directoryLevels,
    emptyFixReport,
    folderFromFileUrl,
    mapLimit,
    needsDownload,
    normalizeFolder,
    packageLocations,
    packageRecord,
    parseAssetPackFile,
    recordPackFolder,
    rewriteDocumentSource,
    toDeletionOperators,
    uploadSourceFor,
    type AssetPackFile,
    type AssetPacksSetting,
    type FixReport,
    type StoredAssetPack,
} from "@src/apps/logic/asset-packs";
import type {
    AssetEntry,
    AssetLocations,
    DOMParserLike,
    PackageAssetLocations,
} from "@src/utils/asset-rewrite";
import {
    fvttBrowseFiles,
    fvttCreateDirectory,
    fvttFileStorageEnv,
    fvttUploadFile,
} from "@src/core/FoundryHelpers";

/** Key of the world setting, under the `sohl` namespace. */
export const ASSET_PACKS_SETTING = "imageLocations";

/** Concurrent downloads during Fix. */
const DOWNLOAD_CONCURRENCY = 6;

/** Document types whose creation applies the import rewrite. */
const PRECREATE_TYPES = [
    "Actor",
    "Item",
    "ActiveEffect",
    "JournalEntry",
    "JournalEntryPage",
    "Scene",
    "Token",
    "Tile",
    "Note",
    "Macro",
    "RollTable",
    "TableResult",
] as const;

/** World collections Fix walks, by document name. */
const WORLD_COLLECTIONS = ["actors", "items", "journal", "scenes", "macros", "tables"] as const;

/** A content package that ships a Default pack. */
export interface ContentPackage {
    /** Content package: the first segment of its addresses. */
    pkg: string;
    /** Foundry package id. */
    foundryId: string;
    /** Foundry package title. */
    title: string;
    /** `systems/<id>/` or `modules/<id>/`. */
    installRoot: string;
    /** The shipped pack. */
    shipped: AssetPackFile;
}

/** The questions Fix asks the GM, replaceable for tests. */
export interface FixPrompts {
    /**
     * Ask for the folder a pack downloads into.
     * @returns The folder, or `null` when cancelled.
     */
    chooseFolder(pkg: ContentPackage, pack: StoredAssetPack): Promise<string | null>;
    /**
     * Warn that files of the same names in the folder are overwritten.
     * @returns Whether to proceed.
     */
    confirmOverwrite(pkg: ContentPackage, pack: StoredAssetPack, folder: string): Promise<boolean>;
}

/** Locations the import hook resolves against. */
let importLocations: AssetLocations = {};

/**
 * Read the setting.
 * @returns The setting (never `null`).
 */
export function getAssetPacksSetting(): AssetPacksSetting {
    return (game.settings.get("sohl" as any, ASSET_PACKS_SETTING as any) ??
        {}) as AssetPacksSetting;
}

/**
 * Write the setting.
 * @param value - The new setting.
 */
export async function setAssetPacksSetting(value: AssetPacksSetting): Promise<void> {
    await game.settings.set("sohl" as any, ASSET_PACKS_SETTING as any, value as any);
}

/**
 * Find the system and every active module whose install root holds
 * `asset-sets/default.json`, keyed by the `package` that file names.
 * @returns The content packages, the system first.
 */
export async function discoverContentPackages(): Promise<ContentPackage[]> {
    const g = game as any;
    const candidates: { foundryId: string; title: string; installRoot: string }[] = [
        { foundryId: g.system.id, title: g.system.title, installRoot: `systems/${g.system.id}/` },
    ];
    for (const mod of g.modules.values()) {
        if (mod.active) {
            candidates.push({
                foundryId: mod.id,
                title: mod.title,
                installRoot: `modules/${mod.id}/`,
            });
        }
    }
    const found = await Promise.all(
        candidates.map(async (c) => {
            try {
                const res = await fetch(foundry.utils.getRoute(c.installRoot + DEFAULT_PACK_PATH));
                if (!res.ok) return undefined;
                const shipped = parseAssetPackFile(await res.json());
                return shipped ? { ...c, pkg: shipped.package, shipped } : undefined;
            } catch {
                return undefined;
            }
        }),
    );
    return found.filter((p): p is ContentPackage => p !== undefined);
}

/**
 * The browser's DOMParser.
 * @returns A new parser.
 */
const domParser = (): DOMParserLike => new DOMParser() as unknown as DOMParserLike;

const htmlPathCache = new Map<string, string[]>();

/**
 * Dotted paths of every `HTMLField` in a document's schema and its system
 * model; a `*` segment stands for every element of an array.
 * @param doc - A document.
 * @returns The paths.
 */
export function htmlFieldPaths(doc: any): string[] {
    const key = `${doc.documentName}:${doc._source?.type ?? "base"}`;
    const cached = htmlPathCache.get(key);
    if (cached) return cached;
    const F = foundry.data.fields as any;
    const out: string[] = [];
    const walk = (field: any, path: string[]): void => {
        if (!field) return;
        if (field instanceof F.HTMLField) {
            out.push(path.join("."));
        } else if (
            field instanceof F.EmbeddedCollectionField ||
            field instanceof F.EmbeddedDocumentField
        ) {
            return;
        } else if (field instanceof F.TypeDataField) {
            const schema = doc.system?.schema;
            if (schema) walk(schema, path);
        } else if (field instanceof F.SchemaField) {
            for (const [k, f] of Object.entries(field.fields)) walk(f, [...path, k]);
        } else if (field instanceof F.ArrayField) {
            walk(field.element, [...path, "*"]);
        }
    };
    walk(doc.schema, []);
    htmlPathCache.set(key, out);
    return out;
}

/**
 * The update for one document, in Foundry's operator form.
 * @param doc - The document.
 * @param locations - Locations by content package.
 * @param parser - A `DOMParser`.
 * @param report - Receives each reference's resolution, if given.
 * @returns The update and the number of references seen.
 */
function documentUpdate(
    doc: any,
    locations: AssetLocations,
    parser: DOMParserLike,
    report?: FixReport,
): { update: Record<string, unknown> | undefined; references: number } {
    const { update, references } = rewriteDocumentSource(
        doc._source,
        htmlFieldPaths(doc),
        locations,
        parser,
        report,
        doc.documentName === "Actor" ? ["prototypeToken"] : [],
    );
    return {
        update:
            update &&
            toDeletionOperators(update, () => new (foundry.data.operators as any).ForcedDeletion()),
        references,
    };
}

/**
 * Embedded collections of a document, by document name, excluding the actor
 * delta (an unlinked token's synthetic actor is walked instead).
 * @param doc - A document.
 * @returns `[documentName, collection]` pairs.
 */
function embeddedCollections(doc: any): [string, any][] {
    const names = Object.keys(doc.constructor?.metadata?.embedded ?? {});
    return names
        .filter((n) => n !== "ActorDelta")
        .map((n) => [n, doc.getEmbeddedCollection(n)] as [string, any])
        .filter(([, c]) => c);
}

/**
 * Apply the rewrite to an unsaved document and every embedded document in its
 * source, without writing anything.
 * @param doc - A document about to be created.
 * @param locations - Locations by content package.
 */
export function rewriteIncomingDocument(doc: any, locations: AssetLocations): void {
    const parser = domParser();
    const visit = (d: any) => {
        const { update } = documentUpdate(d, locations, parser);
        if (update) d.updateSource(update);
        for (const [, collection] of embeddedCollections(d)) {
            for (const child of collection) visit(child);
        }
    };
    visit(doc);
}

/**
 * Write the rewrite for a set of sibling documents, then descend into each.
 * @param docs - The siblings.
 * @param write - Writes their updates in one batch.
 * @param locations - Locations by content package.
 * @param parser - A `DOMParser`.
 * @param report - Receives the counts.
 * @returns Resolves when written.
 */
async function rewriteSiblings(
    docs: any[],
    write: (updates: Record<string, unknown>[]) => Promise<unknown>,
    locations: AssetLocations,
    parser: DOMParserLike,
    report: FixReport,
): Promise<void> {
    const updates: Record<string, unknown>[] = [];
    for (const doc of docs) {
        const { update, references } = documentUpdate(doc, locations, parser, report);
        if (update) {
            updates.push({ _id: doc.id, ...update });
            report.changed++;
        } else if (references) {
            report.current++;
        }
    }
    if (updates.length) await write(updates);
    for (const doc of docs) await rewriteDescendants(doc, locations, parser, report);
}

/**
 * Rewrite a document's embedded documents and, for an unlinked token, its
 * synthetic actor.
 * @param doc - The parent document.
 * @param locations - Locations by content package.
 * @param parser - A `DOMParser`.
 * @param report - Receives the counts.
 * @returns Resolves when written.
 */
async function rewriteDescendants(
    doc: any,
    locations: AssetLocations,
    parser: DOMParserLike,
    report: FixReport,
): Promise<void> {
    for (const [name, collection] of embeddedCollections(doc)) {
        await rewriteSiblings(
            [...collection],
            (updates) => doc.updateEmbeddedDocuments(name, updates),
            locations,
            parser,
            report,
        );
    }
    if (doc.documentName === "Token" && !doc.actorLink && doc.actor) {
        const synthetic = doc.actor;
        await rewriteSiblings(
            [synthetic],
            ([u]) => synthetic.update(withoutId(u)),
            locations,
            parser,
            report,
        );
    }
}

const withoutId = (u: Record<string, unknown>) => {
    const { _id, ...rest } = u;
    return rest;
};

/**
 * Rewrite every world document's references. Compendiums are never written.
 * @param locations - Locations by content package.
 * @param report - Receives the counts.
 */
export async function rewriteWorldReferences(
    locations: AssetLocations,
    report: FixReport,
): Promise<void> {
    const parser = domParser();
    const g = game as any;
    for (const name of WORLD_COLLECTIONS) {
        const collection = g[name];
        if (!collection) continue;
        const cls = collection.documentClass;
        await rewriteSiblings(
            [...collection],
            (updates) => cls.updateDocuments(updates),
            locations,
            parser,
            report,
        );
    }
}

/**
 * The storage, path within it and bucket for a folder.
 * @param folder - Folder path or URL.
 * @returns The storage, path and bucket.
 */
function storageFor(folder: string): ReturnType<typeof uploadSourceFor> {
    return uploadSourceFor(folder, fvttFileStorageEnv(folder));
}

/**
 * The files in a folder; empty when it does not exist.
 * @param dir - Folder path or URL, ending in `/`.
 * @returns Each file's URL as the storage reports it, by decoded basename.
 */
async function listFolder(dir: string): Promise<Map<string, string>> {
    const { source, path, bucket } = storageFor(dir);
    try {
        const result = await fvttBrowseFiles(source, path, bucket);
        return new Map(
            result.files.map((f) => {
                const base = f.split(/[?#]/, 1)[0];
                return [decodeURIComponent(base.slice(base.lastIndexOf("/") + 1)), f];
            }),
        );
    } catch {
        return new Map();
    }
}

/**
 * Create a `data` folder level by level; S3 and the Forge need none.
 * @param dir - Folder path.
 */
async function ensureFolder(dir: string): Promise<void> {
    const { source, path } = storageFor(dir);
    if (source !== "data") return;
    let parent = "";
    for (const level of directoryLevels(path)) {
        let dirs: string[] = [];
        try {
            dirs = (await fvttBrowseFiles(source, parent)).dirs.map((d) =>
                decodeURIComponent(d.replace(/\/$/, "")),
            );
        } catch {
            dirs = [];
        }
        if (!dirs.includes(level)) {
            try {
                await fvttCreateDirectory(source, level);
            } catch {
                // Created meanwhile by a parallel upload.
            }
        }
        parent = level;
    }
}

/**
 * Upload a file into a folder.
 * @param dir - Folder path or URL.
 * @param file - The file.
 * @returns The uploaded file's URL, when the storage reports one.
 */
async function uploadInto(dir: string, file: File): Promise<string | undefined> {
    const { source, path, bucket } = storageFor(dir);
    return fvttUploadFile(source, path.replace(/\/$/, ""), file, bucket);
}

/**
 * Size a `HEAD` reports for a URL.
 * @param url - File URL.
 * @returns The `Content-Length`, if any.
 */
async function headLength(url: string): Promise<number | undefined> {
    try {
        const res = await fetch(url, { method: "HEAD", cache: "no-store" });
        if (!res.ok) return undefined;
        const len = res.headers.get("content-length");
        return len === null ? undefined : Number(len);
    } catch {
        return undefined;
    }
}

/**
 * Download what a folder lacks of a pack.
 *
 * The folder's URL is learned from the storage: an S3 folder chosen as
 * `s3://<bucket>/<key>/` is served at a URL the server builds, read back from
 * the listing or from an upload.
 *
 * @param entries - The pack's entries.
 * @param folder - Folder, ending in `/`.
 * @param report - Receives the counts.
 * @returns Targets present in the folder after the run, and the folder's URL.
 */
export async function downloadPack(
    entries: readonly AssetEntry[],
    folder: string,
    report: FixReport,
): Promise<{ present: Set<string>; url: string }> {
    const dirOf = (target: string) => target.slice(0, target.lastIndexOf("/") + 1);
    const dirs = [...new Set(entries.map((e) => dirOf(e.target)))];
    const listings = new Map<string, Map<string, string>>();
    for (const dir of dirs) listings.set(dir, await listFolder(folder + dir));
    let url: string | undefined;
    const learn = (fileUrl: string | undefined, target: string) => {
        if (!url && fileUrl) url = folderFromFileUrl(fileUrl, target);
    };
    const created = new Map<string, Promise<void>>();
    const present = new Set<string>();
    const progress = (ui.notifications as any).info(
        game.i18n.localize("SOHL.AssetPacks.Fix.checking"),
        { progress: true },
    );
    let done = 0;
    await mapLimit(entries, DOWNLOAD_CONCURRENCY, async (e) => {
        const dir = dirOf(e.target);
        const name = e.target.slice(dir.length);
        const listedUrl = listings.get(dir)?.get(name);
        learn(listedUrl, e.target);
        const listed = listedUrl !== undefined;
        const length = listed ? await headLength(listedUrl) : undefined;
        if (!needsDownload(listed, length, e.size)) {
            report.present++;
            present.add(e.target);
        } else {
            try {
                const res = await fetch(e.source, { cache: "no-store" });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const blob = await res.blob();
                if (!created.has(dir)) created.set(dir, ensureFolder(folder + dir));
                await created.get(dir);
                learn(
                    await uploadInto(folder + dir, new File([blob], name, { type: blob.type })),
                    e.target,
                );
                report.downloaded++;
                present.add(e.target);
            } catch (err) {
                report.failed++;
                report.errors.push(`${e.target}: ${(err as Error).message ?? String(err)}`);
            }
        }
        done++;
        progress?.update?.({
            pct: done / entries.length,
            message: game.i18n.format("SOHL.AssetPacks.Fix.progress", {
                done: String(done),
                total: String(entries.length),
            }),
        });
    });
    return { present, url: url ?? folder };
}

/**
 * Targets of a pack's entries present in a folder, by listing it.
 * @param entries - The pack's entries.
 * @param folder - Folder, ending in `/`.
 * @returns Present targets.
 */
async function presentTargets(
    entries: readonly AssetEntry[],
    folder: string,
): Promise<Set<string>> {
    const dirOf = (target: string) => target.slice(0, target.lastIndexOf("/") + 1);
    const listings = new Map<string, Map<string, string>>();
    for (const dir of new Set(entries.map((e) => dirOf(e.target)))) {
        listings.set(dir, await listFolder(folder + dir));
    }
    return new Set(
        entries
            .filter((e) =>
                listings.get(dirOf(e.target))?.has(e.target.slice(dirOf(e.target).length)),
            )
            .map((e) => e.target),
    );
}

/**
 * Rebuild the locations the import hook uses from the setting. A package
 * whose selected pack's folder cannot be listed by this user resolves to its
 * shipped files.
 */
export async function refreshImportLocations(): Promise<void> {
    const setting = getAssetPacksSetting();
    const canBrowse = (game as any).user?.can?.("FILES_BROWSE") !== false;
    const next: Record<string, PackageAssetLocations> = {};
    for (const p of await discoverContentPackages()) {
        const rec = packageRecord(setting, p.pkg);
        const pack = currentAssetPack(setting, p.pkg);
        const base = {
            installRoot: p.installRoot,
            shipped: p.shipped.assets,
            used: rec.used,
            known: rec.assetPacks.map((a) => a.contents.assets),
        };
        next[p.pkg] =
            pack?.folder && canBrowse ?
                packageLocations({
                    ...base,
                    pack: {
                        folder: pack.folder,
                        entries: pack.contents.assets,
                        present: await presentTargets(pack.contents.assets, pack.folder),
                    },
                })
            :   packageLocations(base);
    }
    importLocations = next;
}

/** The questions Fix asks through Foundry's own dialogs. */
export const defaultFixPrompts: FixPrompts = {
    chooseFolder(pkg, pack) {
        return new Promise((resolve) => {
            let settled = false;
            const FP = (foundry.applications.apps as any).FilePicker.implementation;
            const picker = new FP({
                type: "folder",
                current: pack.folder ?? "",
                window: {
                    title: game.i18n.format("SOHL.AssetPacks.Fix.chooseFolder", {
                        pack: pack.name,
                        package: pkg.title,
                    }),
                },
                callback: (path: string, fp: any) => {
                    settled = true;
                    // A folder picked on S3 is its key; name the bucket with it.
                    const bucket = fp?.activeSource === "s3" ? fp.source?.bucket : undefined;
                    resolve(bucket ? `s3://${bucket}/${path}` : path);
                },
            });
            picker.addEventListener("close", () => {
                if (!settled) resolve(null);
            });
            void picker.render({ force: true });
        });
    },
    async confirmOverwrite(pkg, pack, folder) {
        const ok = await foundry.applications.api.DialogV2.confirm({
            window: { title: "SOHL.AssetPacks.Fix.overwriteTitle" },
            content: `<p>${foundry.utils.escapeHTML(
                game.i18n.format("SOHL.AssetPacks.Fix.overwrite", {
                    pack: pack.name,
                    package: pkg.title,
                    folder,
                }),
            )}</p>`,
        } as any);
        return ok === true;
    },
};

/**
 * Make the world match each package's selected pack: download what the
 * selected pack's folder lacks, then rewrite every world reference. GM only;
 * runs only when called.
 * @param prompts - The questions to ask; Foundry's dialogs by default.
 * @returns What was done.
 */
export async function runFix(prompts: FixPrompts = defaultFixPrompts): Promise<FixReport> {
    const report = emptyFixReport();
    if (!(game as any).user?.isGM) {
        ui.notifications.warn(game.i18n.localize("SOHL.AssetPacks.Fix.gmOnly"));
        return report;
    }
    const cfg = CONFIG as any;
    const hadSuppress = Object.hasOwn(cfg, "SUPPRESS_MEDIA_OPTIMIZER");
    const priorSuppress = cfg.SUPPRESS_MEDIA_OPTIMIZER;
    cfg.SUPPRESS_MEDIA_OPTIMIZER = true;
    try {
        let setting = getAssetPacksSetting();
        const locations: Record<string, PackageAssetLocations> = {};
        for (const p of await discoverContentPackages()) {
            const pack = currentAssetPack(setting, p.pkg);
            const base = {
                installRoot: p.installRoot,
                shipped: p.shipped.assets,
                known: packageRecord(setting, p.pkg).assetPacks.map((a) => a.contents.assets),
            };
            if (!pack) {
                locations[p.pkg] = packageLocations({
                    ...base,
                    used: packageRecord(setting, p.pkg).used,
                });
                continue;
            }
            const chosen = await prompts.chooseFolder(p, pack);
            const folder = chosen ? normalizeFolder(chosen) : "";
            if (!folder || !(await prompts.confirmOverwrite(p, pack, folder))) {
                report.skipped.push(p.pkg);
                continue;
            }
            const { present, url } = await downloadPack(pack.contents.assets, folder, report);
            setting = recordPackFolder(setting, p.pkg, pack.url, url, p.installRoot);
            locations[p.pkg] = packageLocations({
                ...base,
                used: packageRecord(setting, p.pkg).used,
                pack: { folder: url, entries: pack.contents.assets, present },
            });
        }
        await setAssetPacksSetting(setting);
        await rewriteWorldReferences(locations, report);
        importLocations = { ...importLocations, ...locations };
    } finally {
        if (hadSuppress) cfg.SUPPRESS_MEDIA_OPTIMIZER = priorSuppress;
        else delete cfg.SUPPRESS_MEDIA_OPTIMIZER;
    }
    for (const line of report.errors) console.warn(`SoHL | Asset packs: ${line}`);
    ui.notifications.info(
        game.i18n.format("SOHL.AssetPacks.Fix.report", {
            downloaded: String(report.downloaded),
            present: String(report.present),
            failed: String(report.failed),
            changed: String(report.changed),
            current: String(report.current),
            fellBack: String(report.fellBack),
            staleDropped: String(report.staleDropped),
        }),
        { permanent: report.failed > 0 } as any,
    );
    return report;
}

/**
 * Register the setting's import hooks and load the locations they use.
 * Called from {@link registerAssetPacks}.
 */
export function registerAssetPackHooks(): void {
    for (const type of PRECREATE_TYPES) {
        (Hooks as any).on(
            `preCreate${type}`,
            (doc: any, _data: unknown, _o: unknown, userId: string) => {
                if (userId !== (game as any).user?.id) return;
                if (doc.pack) return;
                rewriteIncomingDocument(doc, importLocations);
            },
        );
    }
    (Hooks as any).once("ready", () => void refreshImportLocations());
}

/**
 * The locations the import hook currently uses.
 * @returns Locations by content package.
 */
export function currentImportLocations(): AssetLocations {
    return importLocations;
}
