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
 * Shared `src/` → documentation-group mapping.
 *
 * Used by both the TypeDoc entry-point generator
 * ({@link ../build-docs-entry.mjs}) and the source-category plugin
 * ({@link ../typedoc-plugin-source-category.mjs}) so the architecture grouping
 * is defined in exactly one place.
 *
 * Exports `GROUP_DISPLAY`, `FILE_DISPLAY`, `displayForFile()`, and
 * `CATEGORY_ORDER`. This is a pure helper module with no side effects or CLI
 * entry point — it is imported by the docs build / TypeDoc plugins, not run
 * directly.
 *
 * Usage:
 *   (no direct script) import { displayForFile } from "./docs-grouping.mjs";
 */

/**
 * Maps a `src` group key (first level, or first/second level when the second
 * level is a folder) to its display group. Keep in sync with `src/`.
 */
export const GROUP_DISPLAY = {
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
    domain: "Domain/General",
    utils: "Utility/Helpers",
    "utils/ai": "Utility/AI",
    "utils/collection": "Utility/Collection",
};

/**
 * Per-file overrides keyed by the file's `src`-relative path. These take
 * precedence over the folder-based grouping. Keep in sync with `src/`.
 */
export const FILE_DISPLAY = {
    "utils/constants.ts": "Utility/Constants",
    "domain/SkillBase.ts": "Domain/SkillBase",
};

/** Title-case a path segment as a fallback when a group is not mapped. */
function titleCase(segment) {
    return segment
        .split(/[-_]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

/** Derive a display group for an unmapped group so new folders still render. */
function displayForGroup(group) {
    if (GROUP_DISPLAY[group]) return GROUP_DISPLAY[group];
    return group.split("/").map(titleCase).join("/");
}

/**
 * Resolve the documentation group for a single source file.
 *
 * @param {string} srcRelativePath - The file path relative to `src/`, using
 *   forward slashes (e.g. `document/actor/foundry/SohlActor.ts`).
 * @returns {string} The display group (e.g. `Documents/Actor`).
 */
export function displayForFile(srcRelativePath) {
    const relative = srcRelativePath.replace(/\\/g, "/");
    if (FILE_DISPLAY[relative]) return FILE_DISPLAY[relative];
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
    return displayForGroup(groupName);
}

/**
 * The architecture order for category navigation — top-level concepts first,
 * then their sub-groups. Sub-groups not listed sort alphabetically after.
 */
export const CATEGORY_ORDER = [
    "Core",
    "Documents/Actor",
    "Documents/Item",
    "Documents/Chat",
    "Documents/Combat",
    "Documents/Combatant",
    "Documents/Effect",
    "Documents/Scene",
    "Documents/Token",
    "Domain/General",
    "Domain/SkillBase",
    "Domain/Action",
    "Domain/Body",
    "Domain/Modifier",
    "Domain/Movement",
    "Domain/Result",
    "Domain/StrikeMode",
    "Applications",
    "Utility/Helpers",
    "Utility/AI",
    "Utility/Collection",
    "Utility/Constants",
    "*",
];
