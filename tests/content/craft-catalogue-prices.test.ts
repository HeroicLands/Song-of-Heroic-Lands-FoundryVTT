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
 * A craft catalogue's Price column is a hand-copied second source for a value
 * whose canonical home is the gear item's `valueBase`. This derives both
 * sides from the notes themselves — the catalogue rows from the craft note's
 * table, the figure to check them against from the matching gear note — and
 * fails on any row where they disagree.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import matter from "gray-matter";

const CONTENT = path.resolve(__dirname, "../../assets/content");
const CRAFT_DIR = path.join(CONTENT, "Skills/Craft");

const GEAR_TYPES = new Set([
    "miscgear",
    "armorgear",
    "containergear",
    "weapongear",
    "projectilegear",
]);

function walk(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(dir, e.name);
        return (
            e.isDirectory() ? walk(p)
            : p.endsWith(".md") ? [p]
            : []
        );
    });
}

/** Gear items by their full name, as the catalogue tables name them. */
const ITEMS_BY_NAME = new Map<string, { valueBase: number; file: string }>();
for (const file of walk(CONTENT)) {
    const { data } = matter(readFileSync(file, "utf8"));
    if (!GEAR_TYPES.has(data.type)) continue;
    const full = data.name?.full;
    const valueBase = data.sohl?.system?.valueBase;
    if (full == null || valueBase == null) continue;
    ITEMS_BY_NAME.set(full, { valueBase, file: path.relative(CONTENT, file) });
}

interface CatalogueRow {
    craftFile: string;
    line: number;
    article: string;
    price: string;
}

/**
 * The craft note's primary price table: two side-by-side `Item | lb | Price`
 * groups. A table laid out any other way (a per-unit material price, a
 * vehicle or structure table) is not this table and is left alone.
 */
function parseCatalogueRows(file: string): CatalogueRow[] {
    const text = readFileSync(file, "utf8");
    const lines = text.split("\n");
    const rows: CatalogueRow[] = [];
    const craftFile = path.basename(file);
    for (let i = 0; i < lines.length; i++) {
        if (!/^\|.*\bItem\b.*\blb\b.*\bPrice\b.*\bItem\b.*\blb\b.*\bPrice\b/.test(lines[i]))
            continue;
        for (let j = i + 2; j < lines.length && lines[j].startsWith("|"); j++) {
            const cells = lines[j]
                .split("|")
                .slice(1, -1)
                .map((c) => c.trim());
            if (cells.length < 6) continue;
            const [item1, , price1, item2, , price2] = cells;
            if (item1) rows.push({ craftFile, line: j + 1, article: item1, price: price1 });
            if (item2) rows.push({ craftFile, line: j + 1, article: item2, price: price2 });
        }
        break; // only the note's primary catalogue table
    }
    return rows;
}

const ROWS: CatalogueRow[] = readdirSync(CRAFT_DIR)
    .filter((f) => f.endsWith(".md"))
    .flatMap((f) => parseCatalogueRows(path.join(CRAFT_DIR, f)));

describe("craft catalogue prices", () => {
    it("has catalogue rows to check", () => {
        expect(ROWS.length).toBeGreaterThan(0);
    });

    it("matches at least one gear item", () => {
        const matched = ROWS.filter((r) =>
            ITEMS_BY_NAME.has(r.article.replace(/\s*\[[a-z]\]\s*$/i, "").trim()),
        );
        expect(matched.length).toBeGreaterThan(0);
    });

    it("prices every article the same as its gear item", () => {
        const disagreements: string[] = [];
        for (const row of ROWS) {
            const name = row.article.replace(/\s*\[[a-z]\]\s*$/i, "").trim();
            const item = ITEMS_BY_NAME.get(name);
            if (!item) continue;
            const m = row.price.match(/^(\d+(?:\.\d+)?)d$/);
            if (!m) {
                disagreements.push(
                    `${row.craftFile}:${row.line}: "${row.article}" price "${row.price}" is not in Nd form`,
                );
                continue;
            }
            const catalogueValue = Number(m[1]);
            if (catalogueValue !== item.valueBase) {
                disagreements.push(
                    `${row.craftFile}:${row.line}: "${row.article}" catalogue ${catalogueValue}d` +
                        ` disagrees with ${item.file} valueBase ${item.valueBase}`,
                );
            }
        }
        expect(disagreements).toEqual([]);
    });
});
