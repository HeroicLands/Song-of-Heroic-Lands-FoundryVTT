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

import path from "path";
import { Converter, ReflectionKind, Comment, CommentTag } from "typedoc";
import { displayForFile } from "./docs-grouping.mjs";

/**
 * TypeDoc plugin: auto-assign each top-level reflection a `@category` derived
 * from its `src/` architecture group, so the API can be documented from a
 * SINGLE flat entry module (which is required for cross-module `{@link}`
 * resolution to work) while the sidebar still groups by Core / Documents /
 * Domain / Utility.
 *
 * An explicit, hand-written `@category` tag always wins — this plugin only
 * fills in a category when the author has not provided one.
 *
 * @param {import("typedoc").Application} app
 */
export function load(app) {
    // Top-level documentable kinds that belong directly under the module and
    // therefore drive the category navigation.
    const TOP_LEVEL =
        ReflectionKind.Class |
        ReflectionKind.Interface |
        ReflectionKind.TypeAlias |
        ReflectionKind.Enum |
        ReflectionKind.Function |
        ReflectionKind.Variable |
        ReflectionKind.Namespace;

    const srcRoot = path.resolve("src");

    // Re-exported symbols (the flat barrel uses `export *`) reach
    // EVENT_CREATE_DECLARATION without a declaration node, so derive the
    // category from `reflection.sources` once those are populated, just
    // before TypeDoc builds its category groups.
    app.converter.on(Converter.EVENT_RESOLVE_BEGIN, (context) => {
        let assigned = 0;
        let skippedNoSource = 0;

        for (const reflection of context.project.getReflectionsByKind(
            TOP_LEVEL,
        )) {
            // Only categorize symbols directly under the module — members
            // nested in a namespace/class would create spurious sub-category
            // nodes in the navigation tree.
            const parentKind = reflection.parent?.kind ?? 0;
            if (
                (parentKind &
                    (ReflectionKind.Module | ReflectionKind.Project)) ===
                0
            ) {
                continue;
            }

            // Respect an explicit @category tag — it always takes precedence.
            if (reflection.comment?.getTag("@category")) continue;

            const fileName = reflection.sources?.[0]?.fileName;
            if (!fileName) {
                skippedNoSource += 1;
                continue;
            }
            const srcRel = path
                .relative(srcRoot, path.resolve(fileName))
                .replace(/\\/g, "/");
            if (srcRel.startsWith("..")) continue;

            const category = displayForFile(srcRel);
            if (!category) continue;

            reflection.comment ??= new Comment();
            reflection.comment.blockTags.push(
                new CommentTag("@category", [{ kind: "text", text: category }]),
            );
            assigned += 1;
        }

        app.logger.info(
            `[source-category] assigned ${assigned} categories ` +
                `(${skippedNoSource} reflections had no source).`,
        );
    });
}
