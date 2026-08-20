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
 * Emit this package's cross-package link manifest (#1446, #1499).
 *
 * Every package names the notes it publishes in one file, keyed by the
 * canonical address and valued with everything another build needs to link to
 * it: the web `path`, the Foundry `uuid`, and the `anchors` its sections
 * compiled to. A consuming build vendors the file and resolves a cross-package
 * link through it rather than guessing whether an unknown address is a typo.
 *
 * **This lives beside the pack compilers, not in the knowledgebase build.** The
 * manifest's payload is mostly Foundry addresses, and the anchors can only be
 * known by splitting each note into pages the way {@link splitPages} does — a
 * pass the knowledgebase build does not run. The web address is imported from
 * {@link contentAddress}, which the knowledgebase build uses too, so the two
 * cannot drift.
 *
 * **A document and its documentation are two entries.** An item note compiles
 * into an item, and separately its prose compiles into a JournalEntry. Those
 * are two documents with two UUIDs, so they get two addresses —
 * `affliction-aconite` and `docaffliction-aconite` — each stating its own
 * `uuid`. The item entry carries a `doc` pointer naming the other address
 * rather than repeating its UUID: the doc entry owns that fact. A `macro` note
 * is the same arrangement (#1514), which is why the type set is
 * {@link sohl.utils.packs.DOC_ENTRY_TYPES} — read by this emitter and by the
 * journals compiler alike, so a manifest cannot claim documentation nothing
 * compiled.
 *
 * **Anchors carry whole UUIDs.** Nothing owns a *page* address — there is no
 * per-page entry — so a complete link restates nothing, leaves an anchor free
 * to live outside its own entry, and keeps the page-id hash out of the
 * published contract. A consumer resolves `[[docaffliction-aconite#crafting]]`
 * with a lookup instead of reimplementing a sha256/base64/truncate rule.
 *
 * Usage: node utils/build-link-manifest.mjs
 */

import fs from "node:fs";
import path from "node:path";

import {
    contentAddress,
    KB_PREFIX,
    sectionOf,
} from "@heroiclands/content-build/engine/content-address";
import {
    canonicalKey,
    writeManifests,
} from "@heroiclands/content-build/engine/kb-manifest";
import { walkMarkdownTree } from "@heroiclands/content-build/engine/helpers";
import {
    contentPackage,
    foundryPackageId,
} from "@heroiclands/content-build/engine/content-package";

// Resolved once, here, rather than at each use. The package exports these as
// accessors so that *importing* a module never needs a consumer config
// (#1559); this is a build entry point, which always has one, so reading them
// at module scope is the same instant the script runs.
const CONTENT_PACKAGE = contentPackage();
const FOUNDRY_PACKAGE_ID = foundryPackageId();
import {
    compendiumUuid,
    packForType,
    pageUuid,
} from "@heroiclands/content-build/engine/ids";
import { packRouter as loadPackRouter } from "@heroiclands/content-build/engine/pack-router";
const packRouter = loadPackRouter();
import {
    hasDocEntry,
    itemDocEntryId,
} from "@heroiclands/content-build/engine/item-docs";
import {
    journalPageId,
    splitPages,
} from "@heroiclands/content-build/engine/journals";

const CONTENT_BASE = path.resolve("./assets/content");
const MANIFEST_OUT = path.resolve("./build/manifests");

/** Where this build serves its own package (#1470). */
const LOCAL_BASE = `/${CONTENT_PACKAGE}/`;

/**
 * The reserved anchor name for a journal's **first** page.
 *
 * Every journal has one and it is what an item's `docHtml` points at, but it
 * carries no authored `{#slug}` — so without a reserved name the one page that
 * always exists would be the one page the manifest could not address. Cannot
 * collide with an authored slug, which is `[a-z0-9-]+`.
 */
const LEAD_ANCHOR = "$lead";

/**
 * Every page of a note's journal, as `anchorName → whole UUID`.
 *
 * @param {string} entryUuid - The journal entry's UUID.
 * @param {string} entryId - The journal entry's id, which page ids hash against.
 * @param {string} body - The note's markdown body.
 * @param {string} name - The note's name, used as the lead page's title.
 * @returns {Record<string, string>} The anchors.
 */
function anchorsOf(entryUuid, entryId, body, name) {
    const anchors = {};
    const pages = splitPages(body, name);
    pages.forEach((page, index) => {
        const uuid = pageUuid(entryUuid, journalPageId(entryId, page, index));
        if (index === 0) anchors[LEAD_ANCHOR] = uuid;
        if (page.anchorSlug) anchors[page.anchorSlug] = uuid;
    });
    return anchors;
}

/**
 * Every note this package publishes, as manifest entries.
 *
 * Drafts are excluded because the site does not publish them, and an entry for
 * an unpublished page is exactly the dead link the manifest exists to prevent.
 *
 * @param {string} contentBase - Absolute path to the content tree.
 * @returns {{entries: Array<object>, skipped: Array<object>}}
 */
export function collectEntries(contentBase) {
    const entries = [];
    const skipped = [];
    for (const { frontmatter: fm, body, absPath } of walkMarkdownTree(
        contentBase,
    )) {
        if (!fm || fm.package !== CONTENT_PACKAGE) continue;
        if (fm.draft === true) continue;
        if (!fm.type || !fm.shortcode) continue;

        const rel = path.relative(contentBase, absPath);
        const section = sectionOf(fm);
        if (typeof section !== "string" || !section) {
            skipped.push({
                file: rel,
                reason: `type "${fm.type}" has no section`,
            });
            continue;
        }

        const base = path.basename(absPath);
        const name = fm.name?.full ?? path.basename(absPath, ".md");
        let address;
        try {
            address = contentAddress(
                fm,
                name,
                base.toLowerCase() === "readme.md",
            );
        } catch (err) {
            skipped.push({ file: rel, reason: err.message });
            continue;
        }
        const url = `${LOCAL_BASE}${KB_PREFIX}${address}`;
        const key = canonicalKey(CONTENT_PACKAGE, fm.type, fm.shortcode);

        if (hasDocEntry(fm.type)) {
            // The document — an item, or a macro — and separately the
            // JournalEntry its prose compiles into.
            const docKey = canonicalKey(
                CONTENT_PACKAGE,
                `doc${fm.type}`,
                fm.shortcode,
            );
            const docEntryId = itemDocEntryId(fm.id);
            const docEntryUuid = compendiumUuid(
                FOUNDRY_PACKAGE_ID,
                "doc",
                docEntryId,
                // A published address must name the pack the document actually
                // shipped in: a consumer resolves the UUID verbatim, and a
                // repository may ship several packs of one type (#1566).
                packRouter.defaultOf("JournalEntry"),
            );
            entries.push({
                key,
                fm,
                name,
                url,
                uuid:
                    fm.id ?
                        compendiumUuid(
                            FOUNDRY_PACKAGE_ID,
                            fm.type,
                            fm.id,
                            packRouter.resolveOrNull(
                                fm,
                                packForType(fm.type).docType,
                            ),
                        )
                    :   undefined,
                doc: docKey,
            });
            entries.push({
                key: docKey,
                fm,
                name,
                // On the web the item note renders as one page which *is* its
                // documentation, so both addresses resolve to the same URL.
                url,
                uuid: fm.id ? docEntryUuid : undefined,
                anchors:
                    fm.id ?
                        anchorsOf(docEntryUuid, docEntryId, body ?? "", name)
                    :   undefined,
            });
            continue;
        }

        // Everything else is one document. A `doc` note compiles into a journal
        // in its own right, so its anchors sit on its own entry.
        const uuid =
            fm.id ?
                compendiumUuid(
                    FOUNDRY_PACKAGE_ID,
                    fm.type,
                    fm.id,
                    packRouter.resolveOrNull(fm, packForType(fm.type).docType),
                )
            :   undefined;
        entries.push({
            key,
            fm,
            name,
            url,
            uuid,
            anchors:
                uuid && fm.type === "doc" ?
                    anchorsOf(uuid, fm.id, body ?? "", name)
                :   undefined,
        });
    }
    return { entries, skipped };
}

function main() {
    if (!fs.existsSync(CONTENT_BASE)) {
        console.error(
            `build-link-manifest: no content tree at ${CONTENT_BASE}`,
        );
        process.exitCode = 1;
        return;
    }

    const { entries, skipped } = collectEntries(CONTENT_BASE);
    if (entries.length === 0) {
        console.error(
            `build-link-manifest: ${CONTENT_BASE} yielded no published notes, so ` +
                `the manifest would claim this package publishes nothing.`,
        );
        process.exitCode = 1;
        return;
    }

    const written = writeManifests(
        new Map([[CONTENT_PACKAGE, entries]]),
        MANIFEST_OUT,
        { [CONTENT_PACKAGE]: LOCAL_BASE },
        { [CONTENT_PACKAGE]: FOUNDRY_PACKAGE_ID },
    );

    for (const { package: pkg, file, count } of written) {
        console.log(
            `build-link-manifest: ${pkg} → ${path.relative(process.cwd(), file)} ` +
                `(${count} entries, from ${entries.length} addressable note(s))`,
        );
    }
    if (skipped.length) {
        console.log(`\n  ${skipped.length} note(s) have no address:`);
        for (const s of skipped.slice(0, 20)) {
            console.log(`    ${s.reason}  (${s.file})`);
        }
        if (skipped.length > 20) {
            console.log(`    … and ${skipped.length - 20} more`);
        }
    }
}

main();
