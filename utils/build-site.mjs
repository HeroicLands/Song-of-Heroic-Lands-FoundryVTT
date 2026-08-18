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
 * Assemble the deployable `/sohl/` site (#1470).
 *
 * This repository publishes one standalone site covering everything under
 * `/sohl/`, and two different builds produce it:
 *
 * - **Hugo** renders the package landing and the knowledgebase into
 *   `build/site/sohl/` (`npm run build:kb` — the prefix comes from `publishDir`
 *   in `kb/hugo.toml`, not from this script).
 * - **TypeDoc** generates the API documentation into `build/docs-html`
 *   (`npm run docs:html`), which is plain HTML with relative links, so it is
 *   mounted here as a static tree at `build/site/sohl/api/`.
 *
 * The deployment carries the `/sohl/` prefix physically. That is what lets the
 * hosting project be checked at its own address before any routing points at
 * it — every link the pages emit is `/sohl/…`, and it resolves against the
 * deployment exactly as it will against www — and it leaves the routing layer
 * (#1468) a pure path-preserving pass-through with nothing to rewrite.
 *
 * Usage: node utils/build-site.mjs [--api <dir>]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
 * publishes a 404 at an address that is advertised — the landing page the
 * navigation points at, the knowledgebase, the API documentation, and the 404
 * page itself. That last one matters most: Cloudflare Pages serves the nearest
 * `404.html` with a genuine 404 status and, with none, falls back to the site
 * root — a soft-404 that answers 200 with the landing page and reads as success
 * to every link checker (#1416).
 */
export const REQUIRED = Object.freeze([
    `${PACKAGE_DIR}/index.html`,
    `${PACKAGE_DIR}/404.html`,
    `${PACKAGE_DIR}/kb/index.html`,
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
 * The deployment root's `_redirects`, sending its own root to the package.
 *
 * Only ever consulted at the hosting project's own address: once routing is in
 * place (#1468) `www.heroiclands.org/` is another project's deploy entirely and
 * never reaches this one. Without it that address answers with the host's bare
 * default page, which is a poor first impression of a deploy whose whole
 * purpose is to be checked there.
 */
export const REDIRECTS = `/ /${PACKAGE_DIR}/ 302\n`;

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
    fs.writeFileSync(path.join(root, "_redirects"), REDIRECTS);

    const missing = missingRequired(root);
    if (missing.length) {
        console.error(
            `build-site: the assembled site is missing:\n  ${missing.join("\n  ")}`,
        );
        process.exit(1);
    }

    console.log(
        `build-site: ${SITE_OUT}/ assembled — ${countFiles(pkg)} file(s) under ` +
            `/${PACKAGE_DIR}/, API documentation from ${apiSrc}.`,
    );
}

if (
    process.argv[1] &&
    path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
    main(process.argv.slice(2));
}
