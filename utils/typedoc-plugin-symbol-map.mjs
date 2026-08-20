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

import { RendererEvent } from "typedoc";
import fs from "node:fs";
import path from "node:path";

/**
 * TypeDoc plugin: emit a `qualified name → API page URL` map.
 *
 * At render end, walks every reflection that has a rendered page (or member
 * anchor) and records its `sohl`-rooted full name against its `.url`. The map is
 * written to `kb/data/api-symbols.json` (a Hugo data file), so the knowledgebase
 * build can resolve `{@link sohl.*}` references in the developer docs to the API
 * site without itself running TypeDoc.
 *
 * URLs come from the renderer's {@link https://typedoc.org | Router} rather
 * than from scanning HTML filenames, so disambiguation suffixes (e.g.
 * `SafeExpression-1.html`) and member anchors are captured correctly.
 *
 * TypeDoc 0.28 moved URL ownership off the reflection and onto the router:
 * `reflection.url` is no longer populated, so asking the router is now the only
 * way to get a page address. Reading the old property silently produced an
 * empty map.
 *
 * @param {import("typedoc").Application} app
 */
export function load(app) {
    app.renderer.on(RendererEvent.END, (event) => {
        const project = event.project;
        if (!project) return;

        const router = app.renderer.router;
        if (!router) {
            throw new Error(
                "symbol-map: the renderer exposed no router, so no symbol URL " +
                    "can be resolved. Refusing to overwrite kb/data/api-symbols.json.",
            );
        }

        const map = {};
        const visit = (refl) => {
            if (typeof refl.getFullName === "function" && router.hasUrl(refl)) {
                map[refl.getFullName(".")] = router.getFullUrl(refl);
            }
            refl.children?.forEach(visit);
        };
        project.children?.forEach(visit);

        if (Object.keys(map).length === 0) {
            throw new Error(
                "symbol-map: resolved 0 symbols, which would blank " +
                    "kb/data/api-symbols.json and break every API link in the " +
                    "knowledgebase. Refusing to write.",
            );
        }

        const sorted = {};
        for (const key of Object.keys(map).sort()) sorted[key] = map[key];

        const out = path.resolve("kb/data/api-symbols.json");
        fs.mkdirSync(path.dirname(out), { recursive: true });
        fs.writeFileSync(out, JSON.stringify(sorted, null, 2) + "\n");
        app.logger.info(
            `symbol-map: wrote ${Object.keys(sorted).length} entries to ${out}`,
        );
    });
}
