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
 * Assemble the deployable `/sohl/` site.
 *
 * This repository publishes one standalone site covering everything under
 * `/sohl/`, and two different builds produce it:
 *
 * - **Hugo** renders the package landing and the knowledgebase into
 *   `build/site/sohl/` (`npm run build:kb` — the prefix comes from the
 *   `publishDir` the toolchain generates into `build/hugo/hugo.toml`, not from
 *   this script).
 * - **TypeDoc** generates the API documentation into `build/docs-html`
 *   (`npm run docs:html`), which is plain HTML with relative links, so it is
 *   mounted here as a static tree at `build/site/sohl/api/`.
 *
 * The deployment carries the `/sohl/` prefix physically. That is what lets the
 * hosting project be checked at its own address before any routing points at
 * it — every link the pages emit is `/sohl/…`, and it resolves against the
 * deployment exactly as it will against www — and it leaves the routing layer
 * a pure path-preserving pass-through with nothing to rewrite.
 *
 * The files beside the prefix — the deployment root's `_headers` and
 * `_redirects` — are the toolchain's: `package-build site-root` writes them,
 * and `npm run site:assemble` runs it before this script.
 *
 * Usage: node utils/build-site.mjs [--api <dir>]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { RETIRED_HOSTS, findRetiredHrefs, repairRetiredHrefs } from "./retired-hosts.mjs";

/** The directory that is deployed. Its root is the site's origin, not `/sohl/`. */
export const SITE_OUT = "build/site";

/** Where the package is mounted inside the deployment. Matches `baseURL`. */
export const PACKAGE_DIR = "sohl";

/** Default location of the generated API documentation. */
export const API_SRC = "build/docs-html";

/**
 * Files without which the deployment is broken rather than merely incomplete,
 * as paths relative to {@link SITE_OUT}.
 *
 * Each is an entry point something already links to, so a build missing one
 * publishes a 404 at an address that is advertised — the package's homepage
 * the navigation points at, the API documentation, and the 404 page itself. That last one matters most: Cloudflare Pages serves the nearest
 * `404.html` with a genuine 404 status and, with none, falls back to the site
 * root — a soft-404 that answers 200 with the landing page and reads as success
 * to every link checker.
 */
export const REQUIRED = Object.freeze([
    `${PACKAGE_DIR}/index.html`,
    `${PACKAGE_DIR}/404.html`,
    `${PACKAGE_DIR}/api/index.html`,
]);

/**
 * The {@link REQUIRED} entries absent from an assembled site.
 *
 * @param {string} root - The assembled site directory.
 * @param {(p: string) => boolean} [exists] - Existence test, injectable for tests.
 * @returns {string[]} The missing paths, in {@link REQUIRED} order.
 */
export function missingRequired(root, exists = fs.existsSync) {
    return REQUIRED.filter((rel) => !exists(path.join(root, rel)));
}

/**
 * The origin this deployment is served from. Matches the generated `baseURL`,
 * which derives from `package.json`'s `homepage`.
 *
 * Only used to recognise the site's *own* absolute addresses, so that a link
 * can be checked against the tree being assembled rather than over the network.
 */
export const SITE_ORIGIN = "https://www.heroiclands.org";

/**
 * The file an address of this site is served from, or `undefined` if this
 * deployment publishes nothing there.
 *
 * Follows the static host's own resolution: a directory address answers with
 * its `index.html`, and an extensionless page with the `.html` beside it —
 * which is how TypeDoc links its own pages. A fragment or query names a place
 * within a page, not a different file, so both are dropped first.
 *
 * @param {string} root - The assembled site directory.
 * @param {string} url - An absolute URL.
 * @param {(p: string) => boolean} [exists] - Existence test, injectable for tests.
 * @returns {string | undefined} The file that serves it.
 */
export function sitePathFor(root, url, exists = fs.existsSync) {
    const prefix = `${SITE_ORIGIN}/`;
    if (!String(url).startsWith(prefix)) return undefined;

    const rel = String(url)
        .slice(prefix.length)
        .replace(/[#?].*$/, "");
    const base = path.resolve(root);
    const resolved = path.resolve(base, rel);
    // A `..` in the address would otherwise read outside the deployment, and
    // an address that escapes it is not one this site publishes anyway.
    if (resolved !== base && !resolved.startsWith(base + path.sep)) {
        return undefined;
    }

    const candidates =
        rel === "" || rel.endsWith("/") ?
            [path.join(resolved, "index.html")]
        :   [resolved, `${resolved}.html`, path.join(resolved, "index.html")];
    return candidates.find(exists);
}

/** Every `.html` file beneath `dir`, as paths relative to `dir`. */
function htmlUnder(dir, rel = "") {
    const out = [];
    if (!fs.existsSync(dir)) return out;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const next = path.join(rel, e.name);
        if (e.isDirectory()) out.push(...htmlUnder(path.join(dir, e.name), next));
        else if (e.name.endsWith(".html")) out.push(next);
    }
    return out;
}

/**
 * Repoint every retired-host link under `dir` at an address this deployment
 * actually publishes.
 *
 * Applied to the API documentation only, and only because its source is out of
 * reach: it is generated from the newest **release tag**, so a tag cut
 * before a hostname was withdrawn rebuilds the dead links on every deploy no
 * matter what `main` says — which is how `/sohl/api/` came to offer two
 * hostnames that no longer resolve. Everything else under `/sohl/` is
 * built from `main`, where the source can simply be corrected, so a hit there
 * is left for {@link retiredHrefsUnder} to fail the build over.
 *
 * A replacement is only taken when the page it names is present in the tree, so
 * this can repair a link but never invent one — a wrong repair would trade a
 * dead end a reader can see for a quiet 404.
 *
 * @param {string} dir - The subtree to repair.
 * @param {string} root - The assembled site directory, which addresses resolve against.
 * @returns {{repaired: Array<{file: string, from: string, to: string}>, unresolved: Array<{file: string, url: string}>}}
 */
export function repairRetiredLinksIn(dir, root) {
    const resolves = (url) => sitePathFor(root, url) !== undefined;
    const repaired = [];
    const unresolved = [];

    for (const rel of htmlUnder(dir)) {
        const file = path.join(dir, rel);
        const before = fs.readFileSync(file, "utf8");
        const result = repairRetiredHrefs(before, resolves);
        if (result.html !== before) fs.writeFileSync(file, result.html);
        repaired.push(...result.repaired.map((r) => ({ file: rel, ...r })));
        unresolved.push(...result.unresolved.map((url) => ({ file: rel, url })));
    }
    return { repaired, unresolved };
}

/**
 * Every link to a retired hostname left in the assembled deployment.
 *
 * The last gate before a reader meets one, and the only one the API
 * documentation passes through at all. Reads the rendered pages, since an
 * `href` is an HTML notion; prose that merely *names* a withdrawn host is not
 * reported, because the developer docs explain the move and saying so is not a
 * dead end.
 *
 * @param {string} root - The assembled site directory.
 * @returns {Array<{file: string, url: string, attr: string}>} In reading order.
 */
export function retiredHrefsUnder(root) {
    const out = [];
    for (const rel of htmlUnder(root)) {
        const html = fs.readFileSync(path.join(root, rel), "utf8");
        out.push(...findRetiredHrefs(html).map((hit) => ({ file: rel, ...hit })));
    }
    return out;
}

/**
 * Recursively copy `src` onto `dest`.
 *
 * @param {string} src - Source directory.
 * @param {string} dest - Destination directory, replaced if present.
 */
function copyTree(src, dest) {
    fs.rmSync(dest, { recursive: true, force: true });
    fs.cpSync(src, dest, { recursive: true });
}

/** Count every file beneath `dir`. */
function countFiles(dir) {
    let n = 0;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        n += e.isDirectory() ? countFiles(path.join(dir, e.name)) : 1;
    }
    return n;
}

function main(argv) {
    const at = argv.indexOf("--api");
    const apiSrc = at === -1 ? API_SRC : argv[at + 1];
    const root = path.resolve(SITE_OUT);
    const pkg = path.join(root, PACKAGE_DIR);

    if (!fs.existsSync(path.join(pkg, "index.html"))) {
        console.error(
            `build-site: ${SITE_OUT}/${PACKAGE_DIR}/ holds no rendered site — ` +
                `run \`npm run build:kb\` first.`,
        );
        process.exit(1);
    }
    if (!fs.existsSync(path.join(apiSrc, "index.html"))) {
        console.error(
            `build-site: no API documentation at ${apiSrc} — run ` +
                `\`npm run docs:prepare && npm run docs:html\`, or point ` +
                `--api at a tree built elsewhere.`,
        );
        process.exit(1);
    }

    copyTree(apiSrc, path.join(pkg, "api"));

    // The package's own 404 page, copied to the deployment root so a path
    // outside /sohl/ — reachable only at the hosting project's own address —
    // answers with a real 404 rather than the host's default page.
    fs.copyFileSync(path.join(pkg, "404.html"), path.join(root, "404.html"));

    const missing = missingRequired(root);
    if (missing.length) {
        console.error(`build-site: the assembled site is missing:\n  ${missing.join("\n  ")}`);
        process.exit(1);
    }

    // The API documentation is a rebuild of a release tag, so it can carry
    // addresses that were correct when that tag was cut. Repair what can be
    // repaired against the tree that has just been assembled…
    const { repaired } = repairRetiredLinksIn(path.join(pkg, "api"), root);
    if (repaired.length) {
        console.log(
            `build-site: repaired ${repaired.length} link(s) to a retired ` +
                `hostname in the API documentation.\n` +
                `  These come from the release tag the documentation is built ` +
                `from, whose source cannot\n  be corrected after the fact. If ` +
                `the newest release already carries the surviving\n  addresses, ` +
                `then this is instead a fresh reintroduction — fix the link in ` +
                `src/ JSDoc\n  or in utils/typedoc-plugin-brand-chrome.mjs, ` +
                `where the next tag will carry it too.`,
        );
        for (const r of repaired) {
            console.log(`  ${PACKAGE_DIR}/api/${r.file}: ${r.from}\n    → ${r.to}`);
        }
    }

    // …and refuse to publish whatever is left. A link to a withdrawn hostname
    // fails at DNS with no redirect to follow, so it is a hard dead end on the
    // canonical surface, and nothing downstream would notice it.
    const dead = retiredHrefsUnder(root);
    if (dead.length) {
        console.error(`\nbuild-site: ${dead.length} link(s) address a retired hostname:\n`);
        for (const d of dead) console.error(`  ${d.file}: ${d.url}`);
        console.error(
            "\nThese hostnames have been withdrawn, so the link fails at DNS — there is\n" +
                "no redirect to follow. The surviving addresses are:\n" +
                [...RETIRED_HOSTS].map(([host, base]) => `  ${host} → ${base}`).join("\n") +
                "\n\nA hit under a page built from `main` is a source defect: correct the link\n" +
                "there. A hit left in the API documentation means no replacement page could\n" +
                "be found in this deployment — check the address the link should have, and\n" +
                "teach `rewriteCandidates` in utils/retired-hosts.mjs how to reach it.\n",
        );
        process.exit(1);
    }

    console.log(
        `build-site: ${SITE_OUT}/ assembled — ${countFiles(pkg)} file(s) under ` +
            `/${PACKAGE_DIR}/, API documentation from ${apiSrc}.`,
    );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    main(process.argv.slice(2));
}
