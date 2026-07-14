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
 * site (api.heroiclands.org) without itself running TypeDoc.
 *
 * Using TypeDoc's own `reflection.url` (rather than scanning HTML filenames)
 * captures disambiguation suffixes (e.g. `SafeExpression-1.html`) and member
 * anchors correctly.
 *
 * @param {import("typedoc").Application} app
 */
export function load(app) {
    app.renderer.on(RendererEvent.END, (event) => {
        const project = event.project;
        if (!project) return;

        const map = {};
        const visit = (refl) => {
            if (refl.url && typeof refl.getFullName === "function") {
                map[refl.getFullName(".")] = refl.url;
            }
            refl.children?.forEach(visit);
        };
        project.children?.forEach(visit);

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
