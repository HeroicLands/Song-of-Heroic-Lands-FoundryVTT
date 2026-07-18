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

import { Converter, ReflectionKind } from "typedoc";

/**
 * TypeDoc plugin: root qualified type-reference paths at `sohl`.
 *
 * When TypeDoc disambiguates a colliding reference name (e.g. the many nested
 * `Data` types) it renders the target's namespace path — but the default theme's
 * `getNamespacedPath` walks only `Namespace`-kind ancestors and stops at the
 * entry-point **module**. Because `src/index.ts` is tagged `@module sohl`, the
 * root `sohl` segment is dropped, so a signature reads
 * `entity.action.SohlAction.Data` instead of the honest, `sohl`-rooted path
 * `sohl.entity.action.SohlAction.Data` that matches the breadcrumb, the sidebar,
 * and the runtime `sohl.*` global.
 *
 * Retagging the single entry-point module as a `Namespace` at resolve-time makes
 * that walk include it, so every rendered path is rooted at `sohl`. The change is
 * cosmetic beyond the path fix: the root page heading reads "Namespace sohl"
 * (consistent with every child namespace, which this barrel is), and page URLs,
 * navigation, and breadcrumbs are unchanged.
 *
 * Not invoked directly — loaded by TypeDoc via the `plugin` array in
 * typedoc-html.json / typedoc-markdown.json.
 *
 * @param {import("typedoc").Application} app
 */
export function load(app) {
    app.converter.on(Converter.EVENT_RESOLVE_END, (context) => {
        // Retag each entry-point module (there is exactly one, `sohl`) as a
        // namespace so the theme's path walk includes it as the root segment.
        for (const child of context.project.children ?? []) {
            if (child.kindOf(ReflectionKind.Module)) {
                child.kind = ReflectionKind.Namespace;
            }
        }
    });
}
