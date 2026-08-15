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
 * Vault → `assets/content/` export: what may leave the vault, and what the
 * export would change.
 *
 * SoHL reference content is **authored in the HeroicLands vault** and exported
 * into this repository, where `assets/content/` is a *generated artifact that
 * is committed* — the same arrangement as
 * `kb/dev-docs/reference/type-catalog.md`. The tree is committed rather than
 * generated at build time for one reason: only the maintainer has the vault, so
 * a build that reached for it would work on exactly one machine. Every other
 * contributor, and CI, builds from the committed tree and never needs the vault
 * at all.
 *
 * The direct consequence: **a content edit made in this repository is reverted
 * by the next export, without a word.** Content fixes belong in the vault, and
 * pipeline fixes in the exporter.
 *
 * This module holds the decisions worth testing — which vault paths are
 * exportable, and what a given export would create, rewrite, or retire. The IO
 * lives in `utils/export-vault-content.mjs`.
 *
 * @see https://kb.heroiclands.org/dev/how-to/build-and-deployment/
 */

/**
 * The one vault directory the export reads.
 *
 * The vault also carries `Setting/` — campaign and world material, including
 * creature and birthsign notes that once lived in this repository. It is
 * deliberately **not** exported: `Setting/` is the website's material, and
 * mirroring it here would restore the two-sources drift that authoring in the
 * vault exists to end.
 */
export const VAULT_CONTENT_DIR = "SoHL";

/**
 * Per-pack folder manifests, which sit at the content root beside the notes.
 *
 * These are the only non-Markdown files the export carries, so the filter can
 * name them rather than admitting `*.yaml` generally.
 */
const FOLDER_MANIFESTS = new Set([
    "item-folders.yaml",
    "actor-folders.yaml",
    "journal-folders.yaml",
    "macro-folders.yaml",
]);

/**
 * Obsidian templater scaffolding. Not content, and its unresolved `<% %>`
 * placeholders are not valid frontmatter, so the pack walker already skips it.
 */
const SCAFFOLDING = "Templates";

/**
 * Whether a path below the vault's content directory belongs in the export.
 *
 * Accepts Markdown notes at any depth and the four root folder manifests;
 * rejects dot-prefixed paths at every level (`.DS_Store`, `.obsidian/`),
 * templater scaffolding, and everything else. Rejecting by allow-list rather
 * than by a noise blocklist means a new kind of vault sidecar cannot silently
 * arrive in the compiled packs.
 *
 * @param {string} relPath - Path relative to the vault's content directory,
 *   with `/` separators (e.g. `Armor/Armor/Buckram_Cap.md`).
 * @returns {boolean}
 */
export function isExportable(relPath) {
    const segments = relPath.split("/");
    if (segments.some((s) => s.startsWith("."))) return false;
    if (segments[0] === SCAFFOLDING) return false;
    if (relPath.endsWith(".md")) return true;
    return segments.length === 1 && FOLDER_MANIFESTS.has(segments[0]);
}

/**
 * Whether a directory below the vault's content root is worth descending.
 *
 * Prunes the trees that can hold no exportable file — dot directories and
 * templater scaffolding — so a walk never opens `.obsidian/`.
 *
 * @param {string} relPath - Directory path relative to the content root.
 * @returns {boolean}
 */
export function isExportableDir(relPath) {
    const segments = relPath.split("/");
    if (segments.some((s) => s.startsWith("."))) return false;
    return segments[0] !== SCAFFOLDING;
}

/**
 * Compare an export's output against the committed tree.
 *
 * The export is **authoritative and destructive**: a file the committed tree
 * holds and the export does not produce is stale, and is retired. That is what
 * makes "the export reproduces the tree" a claim a check can actually verify —
 * without it, a note deleted in the vault would linger here forever and keep
 * compiling into the packs.
 *
 * @param {Map<string, string>} source - Exportable vault files, keyed by their
 *   path relative to the content root, valued by their content.
 * @param {Map<string, string>} target - The committed `assets/content/` tree,
 *   in the same shape.
 * @returns {{create: string[], update: string[], remove: string[],
 *   unchanged: string[], drifted: boolean, sourceCount: number}}
 *   Every list sorted, so a report is stable across runs.
 */
export function planExport(source, target) {
    const create = [];
    const update = [];
    const unchanged = [];
    const remove = [];

    for (const [relPath, content] of source) {
        if (!target.has(relPath)) create.push(relPath);
        else if (target.get(relPath) !== content) update.push(relPath);
        else unchanged.push(relPath);
    }
    for (const relPath of target.keys()) {
        if (!source.has(relPath)) remove.push(relPath);
    }

    const asc = (a, b) =>
        a < b ? -1
        : a > b ? 1
        : 0;
    create.sort(asc);
    update.sort(asc);
    unchanged.sort(asc);
    remove.sort(asc);

    return {
        create,
        update,
        remove,
        unchanged,
        drifted: create.length + update.length + remove.length > 0,
        sourceCount: source.size,
    };
}

/**
 * Render a one-line tally of a plan, refusing a plan that exported nothing.
 *
 * An export that produced no files is always a fault — a mistyped vault path,
 * or the wrong directory — never a legitimately empty content tree. Left
 * unchecked it is the worst possible outcome: the mirror would retire all of
 * `assets/content/`, and the pack build would then compile zero documents and
 * *succeed*, shipping empty compendiums with nothing in the log to say so.
 *
 * @param {ReturnType<typeof planExport>} plan
 * @returns {string}
 * @throws {Error} When the plan's source side is empty.
 */
export function summarize(plan) {
    if (plan.sourceCount === 0) {
        throw new Error(
            `The vault exported no files. Refusing to mirror an empty tree over ` +
                `assets/content/, which would retire all of it and leave the pack ` +
                `build compiling zero documents. Check the vault path and that its ` +
                `${VAULT_CONTENT_DIR}/ directory holds the content notes.`,
        );
    }
    return (
        `${plan.create.length} created, ${plan.update.length} updated, ` +
        `${plan.remove.length} retired, ${plan.unchanged.length} unchanged`
    );
}
