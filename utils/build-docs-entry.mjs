/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
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
 * Generates the TypeDoc entry-point bundle.
 *
 * Rather than emit a single flat barrel (which collapses the whole public API
 * into one alphabetical list), this writes a small TREE of barrel modules under
 * `build/docbundle/` that mirrors the `src/` architecture:
 *
 *   Core, Applications, Documents/{Actor,Item,...}, Domain/{Modifier,Result,...},
 *   Utility/{AI,Collection,Helpers}
 *
 * Each barrel is a TypeDoc `@module`. TypeDoc's folder-aware navigation
 * (`navigation.includeFolders`) then nests the leaf modules under their parent
 * folder, so the API sidebar reflects Core / Documents / Domain / Utility
 * instead of one long flat list.
 *
 * This file is run by `npm run docs:prepare`. The generated tree is consumed by
 * both the HTML (`typedoc-html.json`) and Markdown (`typedoc-markdown.json`)
 * builds via an `expand` entry-point strategy pointed at `build/docbundle`.
 */

import fs from "fs";
import path from "path";
import { globSync } from "glob";

const bundleDir = path.resolve(
    process.env.SOHL_DOCBUNDLE_DIR || "build/docbundle",
);

/**
 * Maps a `src` group key (first level, or first/second level when the second
 * level is a folder) to its display path in the generated bundle tree. The last
 * segment becomes the leaf module's `@module` name; any preceding segment
 * becomes a parent folder in the navigation. Keep this in sync with `src/`.
 */
const GROUP_DISPLAY = {
    apps: "Applications",
    core: "Core",
    "document/actor": "Documents/Actor",
    "document/item": "Documents/Item",
    "document/chat": "Documents/Chat",
    "document/combat": "Documents/Combat",
    "document/combatant": "Documents/Combatant",
    "document/effect": "Documents/Effect",
    "document/scene": "Documents/Scene",
    "document/token": "Documents/Token",
    "domain/action": "Domain/Action",
    "domain/body": "Domain/Body",
    "domain/modifier": "Domain/Modifier",
    "domain/movement": "Domain/Movement",
    "domain/result": "Domain/Result",
    "domain/strikemode": "Domain/StrikeMode",
    // Loose files directly under src/domain (e.g. SkillBase) — kept inside the
    // Domain folder so they don't collide with the Domain/ subgroup nodes.
    domain: "Domain/General",
    utils: "Utility/Helpers",
    "utils/ai": "Utility/AI",
    "utils/collection": "Utility/Collection",
};

/**
 * Per-file overrides keyed by the file's `src`-relative path. These take
 * precedence over the folder-based grouping and let a single oversized or
 * standalone file get its own navigation module. Keep in sync with `src/`.
 */
const FILE_DISPLAY = {
    // constants.ts alone is ~400 symbols (every enum/code/type-guard/label);
    // give it a dedicated module so Utility/Helpers stays browsable.
    "utils/constants.ts": "Utility/Constants",
    // SkillBase is the lone loose file under src/domain; surface it directly
    // under the Domain folder rather than in a generic catch-all module.
    "domain/SkillBase.ts": "Domain/SkillBase",
};

/** Title-case a path segment as a fallback when a group is not mapped above. */
function titleCase(segment) {
    return segment
        .split(/[-_]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

/** Derive a display path for an unmapped group so new folders still render. */
function displayFor(group) {
    if (GROUP_DISPLAY[group]) return GROUP_DISPLAY[group];
    const parts = group.split("/").map(titleCase);
    return parts.join("/");
}

const files = globSync("src/**/*.ts", {
    ignore: ["**/*.test.ts", "**/*.d.ts", "**/index.ts"],
});

// Bucket every source file under its final display path (the module name).
// Per-file overrides win; otherwise fall back to folder-based grouping.
const byDisplay = {};
for (const file of files) {
    const relative = path.relative("src", file).replace(/\\/g, "/");
    let display = FILE_DISPLAY[relative];
    if (!display) {
        const parts = relative.split("/");
        let groupName;
        if (parts.length === 1) {
            // Top-level entry files (e.g. src/sohl.ts) belong with Core wiring.
            groupName = "core";
        } else if (parts[1].endsWith(".ts")) {
            // A file directly inside a first-level folder (e.g. src/core/*.ts).
            groupName = parts[0];
        } else {
            // A file inside a second-level folder (e.g. src/document/actor/*).
            groupName = `${parts[0]}/${parts[1]}`;
        }
        display = displayFor(groupName);
    }
    (byDisplay[display] ??= []).push(file);
}

// Fresh tree each run so renamed/removed groups don't leave stale barrels.
fs.rmSync(bundleDir, { recursive: true, force: true });
fs.mkdirSync(bundleDir, { recursive: true });

const sortedGroups = Object.entries(byDisplay).sort(([a], [b]) =>
    a.localeCompare(b),
);

let barrelCount = 0;
for (const [display, groupFiles] of sortedGroups) {
    // Use the FULL slashed path as the module name: TypeDoc's sidebar groups
    // modules into folders by splitting the name on "/", so "Documents/Actor"
    // nests "Actor" under a "Documents" node. A bare leaf name renders flat.
    const moduleName = display;
    const barrelPath = path.join(bundleDir, `${display}.ts`);
    const barrelDir = path.dirname(barrelPath);
    fs.mkdirSync(barrelDir, { recursive: true });

    const header = `/**
 * @module ${moduleName}
 * @summary Public API: ${moduleName}.
 * @remarks Auto-generated by utils/build-docs-entry.mjs. Do not edit by hand.
 */
`;

    const lines = [header, ""];
    for (const file of groupFiles.sort()) {
        let specifier = path
            .relative(barrelDir, path.resolve(file))
            .replace(/\\/g, "/")
            .replace(/\.ts$/, "");
        if (!specifier.startsWith(".")) specifier = `./${specifier}`;
        lines.push(`export * from "${specifier}";`);
    }

    fs.writeFileSync(barrelPath, `${lines.join("\n")}\n`);
    barrelCount += 1;
}

console.log(
    `✅ Generated ${barrelCount} barrel module(s) under ${bundleDir} ` +
        `from ${files.length} source files, grouped by architecture.`,
);
