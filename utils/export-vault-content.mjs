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
 * Export the HeroicLands vault's SoHL content into `assets/content/`.
 *
 * Content is authored in the vault; this repository carries the export as a
 * **generated artifact that is committed**, so that contributors and CI — who
 * do not have the vault — build from the tree in git and never need it. Only
 * the maintainer runs this script.
 *
 * **`assets/content/` is therefore output, not source.** An edit made to it
 * here is reverted by the next export without a word. Content fixes belong in
 * the vault; pipeline fixes belong in this script.
 *
 * The export is an authoritative mirror of the vault's `SoHL/` directory: it
 * writes what the vault has and retires what it no longer carries. The vault's
 * `Setting/` tree — campaign and world material — is never exported.
 *
 * Usage:
 *   npm run content:export              // write the export into assets/content/
 *   npm run content:check               // report drift only, change nothing
 *   node utils/export-vault-content.mjs [--check] [--verbose] [--vault=<path>]
 *
 * The vault is located from `--vault=<path>`, else `HEROICLANDS_VAULT` in
 * `.env.local`. Exits non-zero when the vault cannot be found, when the export
 * would produce nothing, and — under `--check` — when the committed tree has
 * drifted from what the vault would produce.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

import {
    VAULT_CONTENT_DIR,
    isExportable,
    isExportableDir,
    planExport,
    summarize,
} from "./vault-export.mjs";

const repoRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
);

dotenv.config({ path: path.join(repoRoot, ".env.local"), quiet: true });
dotenv.config({ path: path.join(repoRoot, ".env"), quiet: true });

/** Where the export lands, relative to the repo root. */
const CONTENT_REL = path.join("assets", "content");

/**
 * Read every file below a directory, keyed by its `/`-separated relative path.
 *
 * Returns an empty map when the directory is absent, leaving the "nothing to
 * export" judgement to {@link summarize} rather than making it here.
 *
 * @param {string} root - Absolute path to walk.
 * @returns {Map<string, string>}
 */
function readTree(root) {
    /** @type {Map<string, string>} */
    const files = new Map();
    if (!fs.existsSync(root)) return files;

    /** @param {string} dir */
    const walk = (dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const abs = path.join(dir, entry.name);
            const rel = path.relative(root, abs).split(path.sep).join("/");
            if (entry.isDirectory()) {
                if (isExportableDir(rel)) walk(abs);
            } else if (entry.isFile() && isExportable(rel)) {
                files.set(rel, fs.readFileSync(abs, "utf8"));
            }
        }
    };
    walk(root);
    return files;
}

/**
 * Locate the vault, preferring an explicit flag over the environment.
 *
 * @param {string[]} argv
 * @returns {string} Absolute path to the vault root.
 * @throws {Error} When no vault is configured, or the path is not a vault.
 */
function resolveVault(argv) {
    const flag = argv.find((a) => a.startsWith("--vault="));
    const configured =
        flag ? flag.slice("--vault=".length) : process.env.HEROICLANDS_VAULT;

    if (!configured) {
        throw new Error(
            `No vault configured. Set HEROICLANDS_VAULT in .env.local to your ` +
                `HeroicLands vault checkout, or pass --vault=<path>.\n\n` +
                `Only the maintainer needs this: assets/content/ is committed, so ` +
                `building this repository never requires the vault.`,
        );
    }

    const vaultRoot = path.resolve(configured);
    const contentRoot = path.join(vaultRoot, VAULT_CONTENT_DIR);
    if (!fs.existsSync(contentRoot)) {
        throw new Error(
            `${vaultRoot} has no ${VAULT_CONTENT_DIR}/ directory, so it is not a ` +
                `HeroicLands vault (or points at the wrong place).`,
        );
    }
    return vaultRoot;
}

/**
 * Apply a plan to `assets/content/`, writing and retiring files.
 *
 * @param {ReturnType<typeof planExport>} plan
 * @param {Map<string, string>} source
 * @param {string} contentRoot - Absolute path to `assets/content/`.
 */
function applyPlan(plan, source, contentRoot) {
    for (const rel of [...plan.create, ...plan.update]) {
        const abs = path.join(contentRoot, ...rel.split("/"));
        fs.mkdirSync(path.dirname(abs), { recursive: true });
        fs.writeFileSync(abs, /** @type {string} */ (source.get(rel)), "utf8");
    }
    for (const rel of plan.remove) {
        fs.rmSync(path.join(contentRoot, ...rel.split("/")), { force: true });
    }
    // Retiring the last note in a directory leaves it empty; prune upward so
    // the export cannot accumulate empty scaffolding over time.
    for (const rel of plan.remove) {
        let dir = path.dirname(path.join(contentRoot, ...rel.split("/")));
        while (
            dir.startsWith(contentRoot) &&
            dir !== contentRoot &&
            fs.existsSync(dir) &&
            fs.readdirSync(dir).length === 0
        ) {
            fs.rmdirSync(dir);
            dir = path.dirname(dir);
        }
    }
}

/**
 * List a plan's paths under a heading, capped so a first export stays readable.
 *
 * @param {string} label
 * @param {string[]} paths
 * @param {boolean} verbose
 */
function report(label, paths, verbose) {
    if (paths.length === 0) return;
    console.log(`\n  ${label} (${paths.length}):`);
    const shown = verbose ? paths : paths.slice(0, 20);
    for (const p of shown) console.log(`    ${p}`);
    if (shown.length < paths.length) {
        console.log(
            `    … and ${paths.length - shown.length} more (--verbose to list)`,
        );
    }
}

function main() {
    const argv = process.argv.slice(2);
    const check = argv.includes("--check") || argv.includes("--dry-run");
    const verbose = argv.includes("--verbose");

    const vaultRoot = resolveVault(argv);
    const vaultContent = path.join(vaultRoot, VAULT_CONTENT_DIR);
    const contentRoot = path.join(repoRoot, CONTENT_REL);

    const source = readTree(vaultContent);
    const target = readTree(contentRoot);
    const plan = planExport(source, target);

    // Throws when the vault produced nothing, before any file is touched.
    const tally = summarize(plan);

    console.log(`export-vault-content: ${vaultContent} → ${CONTENT_REL}`);
    console.log(`  ${source.size} exportable file(s) in the vault`);

    if (!plan.drifted) {
        console.log(`\n✓ assets/content/ matches the vault (${tally}).`);
        return;
    }

    report("create", plan.create, verbose);
    report("update", plan.update, verbose);
    report("retire", plan.remove, verbose);

    if (check) {
        console.error(
            `\ncheck: assets/content/ has drifted from the vault — ${tally}.\n\n` +
                `assets/content/ is generated. Re-run "npm run content:export" and ` +
                `commit the result; do not hand-edit the tree, since the next ` +
                `export reverts it.`,
        );
        process.exitCode = 1;
        return;
    }

    applyPlan(plan, source, contentRoot);
    console.log(`\n✓ exported: ${tally}.`);
    console.log(
        `  Commit assets/content/ — it is generated output, tracked so that ` +
            `builders without the vault can build.`,
    );
}

try {
    main();
} catch (err) {
    console.error(`export-vault-content: ${err.message}`);
    process.exitCode = 1;
}
