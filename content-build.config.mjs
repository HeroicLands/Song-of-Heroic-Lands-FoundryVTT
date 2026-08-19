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
 * This repository's content-build configuration — everything about the pack
 * pipeline that is *this* repository's rather than any consumer's (#1508).
 *
 * Every value the pack compilers used to carry as a module-level constant is
 * declared here: which content package they select, which Foundry package ships
 * the result, where the content tree and the build outputs live, what each
 * compiled document's `_stats` block says, and which packs exist. A different
 * repository — `sohl-thalorna`, `sohl-kethira-basic`, an adventure module —
 * ships the same toolchain with its own copy of this file and nothing else.
 *
 * **Paths, not captured values.** `paths.packageManifest` says *where* the
 * shipped Foundry manifest is; the package id guard and the compiled packs'
 * `_stats.coreVersion` both read it from there, so moving
 * `compatibility.minimum` moves the stamp without touching this file. Nothing
 * here may copy a value the manifest owns.
 *
 * @module
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

// The shared toolchain is a workspace package, consumed by path from within
// this repository. A downstream consumer writes
// `import { defineConfig } from "@heroiclands/content-build";` instead.
import { defineConfig } from "./packages/content-build/index.mjs";

export default defineConfig({
    // Anchors every configured path, so the build reads the same files whatever
    // directory it was launched from — the property the pack helpers used to get
    // by resolving the manifest relative to their own module, which breaks the
    // moment the toolchain is installed under `node_modules/` (#1508).
    rootDir: path.dirname(fileURLToPath(import.meta.url)),

    // The distribution unit a note declares in its `package:` frontmatter. The
    // pack compilers select their entries by it, and it is stable across
    // compilation targets.
    contentPackage: "sohl",

    // The Foundry package the packs ship in — the `id` in
    // `assets/templates/system.template.json`, and the first segment of every
    // compendium UUID the compilers emit. Equal to `contentPackage` here only by
    // coincidence: in `sohl-thalorna` the two differ (#1498).
    foundryPackage: "sohl",
    packageKind: "systems",

    // Stamped into every compiled document's `_stats`. `systemId` names the game
    // system the content is *for*, which a module shipping SoHL content still
    // declares as "sohl". `coreVersion` is deliberately absent — it is read from
    // the manifest's `compatibility.minimum`.
    //
    // `systemVersion` is the version the packs claim to have been built against.
    // It has lagged `package.json` since 0.6.0; correcting it rewrites the
    // `_stats` of every shipped document, so it is tracked separately (#1548)
    // rather than changed in passing here.
    stats: {
        systemId: "sohl",
        systemVersion: "0.6.0",
        lastModifiedBy: "sohlbuilder00000",
    },

    // `assets/content/` is opened as an Obsidian vault, whose templater
    // scaffolding lives in `Templates/` and is never compendium content.
    skipDirectories: ["Templates"],

    // The one pack list. Order is load-bearing: the actors pass resolves each
    // being's embedded items against the items pass's output, so items compile
    // first. `packDirectories` — what `build:compiledb` turns into LevelDB — is
    // derived from this, so the compile list and the compiler list cannot drift
    // apart the way `SOURCE_PACKS` and `PACK_CONFIGS` did.
    packs: [
        { name: "items", type: "Item", folders: "item-folders.yaml" },
        {
            name: "journals",
            type: "JournalEntry",
            folders: "journal-folders.yaml",
        },
        { name: "actors", type: "Actor", folders: "actor-folders.yaml" },
        { name: "macros", type: "Macro", folders: "macro-folders.yaml" },
        {
            name: "scenes",
            type: "Scene",
            folders: "scene-folders.yaml",
            // One pass, two packs: every map note's Scene, and the Adventure
            // bundling the pinned ones with their journals so a `keepId: true`
            // import makes the pins resolve (#1525).
            companions: [{ name: "adventures", type: "Adventure" }],
        },
    ],

    // This repository publishes a knowledgebase and a link manifest, and
    // consumes the manifests of the packages it links into (#1385/#1446). The
    // switches are declared here; the build steps that read them are moved onto
    // the shared toolchain by #1512.
    publish: {
        site: true,
        manifests: { publish: true, consume: true },
    },
});
