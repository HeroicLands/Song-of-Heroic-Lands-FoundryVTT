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

import { Renderer } from "typedoc";

/**
 * TypeDoc plugin: render the flat, slash-encoded category labels
 * (`Documents/Actor`, `Domain/Modifier`, …) as a real nested navigation tree
 * (`Documents ▸ Actor`). The API is documented from a single module (so
 * cross-module `{@link}`s resolve), and the architecture hierarchy is carried
 * in the category names; this restores the collapsible folder feel without
 * splitting the API into multiple entry-point modules.
 *
 * Implemented by wrapping the active theme's `buildNavigation` at render
 * start, so it works with any DefaultTheme-derived theme without subclassing.
 *
 * Not invoked directly — loaded by TypeDoc via the `plugin` array in
 * typedoc-html.json / typedoc-markdown.json.
 *
 * @param {import("typedoc").Application} app
 */
export function load(app) {
    app.renderer.on(Renderer.EVENT_BEGIN, () => {
        const theme = app.renderer.theme;
        if (!theme || typeof theme.buildNavigation !== "function") return;
        if (theme.__nestedNavPatched) return;
        theme.__nestedNavPatched = true;

        const original = theme.buildNavigation.bind(theme);
        theme.buildNavigation = (project) => nestSlashed(original(project));
    });
}

/**
 * Re-nest navigation elements whose `text` contains `/` into a tree, grouping
 * by each successive path segment. `Documents/Actor` and `Documents/Item`
 * become an `Actor` and `Item` child under a shared `Documents` node.
 *
 * @param nodes - The navigation elements to transform.
 * @returns The re-nested navigation elements.
 */
function nestSlashed(nodes) {
    if (!Array.isArray(nodes)) return nodes;

    const tops = [];
    const groups = new Map();

    for (const node of nodes) {
        if (node.children) node.children = nestSlashed(node.children);

        const slash =
            typeof node.text === "string" ? node.text.indexOf("/") : -1;
        if (slash === -1) {
            tops.push(node);
            continue;
        }

        const prefix = node.text.slice(0, slash);
        node.text = node.text.slice(slash + 1);

        let parent = groups.get(prefix);
        if (!parent) {
            parent = { text: prefix, children: [] };
            groups.set(prefix, parent);
            tops.push(parent);
        }
        parent.children.push(node);
    }

    // Recurse so deeper paths (e.g. `A/B/C`) keep nesting beyond one level.
    for (const parent of groups.values()) {
        parent.children = nestSlashed(parent.children);
    }
    return tops;
}
