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
 * here may copy a value the manifest owns. The same rule governs the version
 * stamped in `_stats.systemVersion`: it is read from `package.json`, the file
 * that owns it, rather than transcribed — a transcribed one froze at `0.6.0`
 * for four releases (#1548).
 *
 * @module
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// The shared toolchain is a devDependency resolved from the registry, exactly
// as `sohl-thalorna` and `sohl-kethira-basic` resolve it. This repository used
// to consume it by workspace path, which meant the example a module author read
// here was not one they could reproduce (#1589).
//
// Both specifiers name the *leaf* contract module, never the package root
// barrel: the barrel pulls in the compilers, the compilers read the resolved
// configuration, and resolving it loads this file — so importing the barrel here
// would close a cycle around this file's own evaluation. The leaf imports
// nothing but `node:path` and the id helpers, so it cannot.
import { defineConfig } from "@heroiclands/content-build/config";

// The item-type registry: every content `type` that compiles into an Item,
// paired with the builder producing its `system` block. It is SoHL data-model
// knowledge, so it lives in the toolchain's `sohl` half and is handed to the
// engine as configuration — which is how the engine composes the one
// doc-carrying-type set without holding any package's data model (#1512).
//
// Imported from its own entry point rather than the `sohl` barrel, for the same
// cycle reason: the barrel carries the item and actor compilers, which read the
// resolved configuration.
import { ITEM_BUILDERS } from "@heroiclands/content-build/sohl/item-builders";

/** This repository's root — the directory this configuration file sits in. */
const rootDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * The system version this repository ships, read from the file that owns it.
 *
 * `package.json` is the single source Changesets bumps and
 * `utils/build-system-json.mjs` stamps into the shipped manifest's `version`,
 * so reading it here is what keeps a compiled document's
 * `_stats.systemVersion` equal to the version of the system that compiled it
 * (#1548) — the same "follow the source, don't copy it" rule
 * `_stats.coreVersion` follows against the manifest's `compatibility.minimum`
 * (#1533).
 *
 * Read *here* rather than by the toolchain, because the stamp is not the
 * building package's version in general: a module repository shipping SoHL
 * content (`sohl-thalorna`) declares `systemId: "sohl"`, and the version that
 * belongs beside it is the SoHL system's, not that module's own. Which version
 * a repository ships content *for* is a per-repository fact, so it stays in the
 * per-repository file.
 */
const shippedSystemVersion = JSON.parse(
    fs.readFileSync(path.join(rootDir, "package.json"), "utf8"),
).version;

export default defineConfig({
    // Anchors every configured path, so the build reads the same files whatever
    // directory it was launched from — the property the pack helpers used to get
    // by resolving the manifest relative to their own module, which breaks the
    // moment the toolchain is installed under `node_modules/` (#1508).
    rootDir,

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
    // `systemVersion` is the version the packs claim to have been built by, and
    // it follows `package.json` rather than a literal maintained here: a
    // document that under-reports its version is eligible for migrations it does
    // not need (#1548).
    stats: {
        systemId: "sohl",
        systemVersion: shippedSystemVersion,
        lastModifiedBy: "sohlbuilder00000",
    },

    // Which content types compile into Items, and what builds each one's
    // `system` block. `itemTypes` and the doc-carrying-type set are derived from
    // these keys, so a type cannot be accepted without a builder behind it
    // (#1504).
    itemBuilders: ITEM_BUILDERS,

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
