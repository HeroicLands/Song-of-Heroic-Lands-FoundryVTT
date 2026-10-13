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

import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// Independent owner-approved armour grade values.
// Expectations are not read from production notes or implementation helpers.
// Columns: Blunt, Edged, Piercing, Fire, Durability.
const GRADES: Record<string, readonly [number, number, number, number, number]> = {
    Straw: [0, 0, 0, 0, 5],
    Homespun: [0, 0, 0, 0, 5],
    Linen: [0, 0, 0, 0, 5],
    Serge: [0, 0, 0, 0, 7],
    Russet: [0, 0, 0, 0, 7],
    Silk: [0, 0, 0, 0, 7],
    Worsted: [0, 1, 0, 1, 9],
    Cloth: [0, 1, 0, 1, 10],
    Buckram: [0, 1, 0, 1, 10],
    Velvet: [0, 1, 0, 1, 10],
    Canvas: [0, 1, 0, 1, 11],
    "Waxed Canvas": [0, 1, 0, 0, 12],
    Rawhide: [1, 2, 1, 3, 11],
    Leather: [1, 1, 1, 1, 9],
    Beaver: [1, 1, 1, 1, 9],
    Ermine: [0, 1, 0, 1, 7],
    Sealskin: [1, 2, 1, 3, 11],
    Padded: [2, 2, 1, 2, 10],
    Quilted: [4, 3, 2, 3, 11],
    Gambeson: [6, 5, 4, 5, 11],
    Kûrbúl: [4, 6, 5, 4, 13],
    Scale: [4, 8, 5, 5, 14],
    Mail: [2, 8, 7, 3, 13],
    Ring: [3, 7, 5, 4, 13],
    Plate: [6, 11, 9, 5, 14],
};

function armourFiles(dir: string): string[] {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const file = path.join(dir, entry.name);
        return (
            entry.isDirectory() ? armourFiles(file)
            : file.endsWith(".md") ? [file]
            : []
        );
    });
}
const articles = armourFiles(path.resolve(__dirname, "../../assets/content/Armor"))
    .map((file) => ({
        file: path.basename(file),
        data: matter(fs.readFileSync(file, "utf8")).data,
    }))
    .filter(({ data }) => data.type === "armorgear");

describe("armour Legendary grade protection and durability", () => {
    it("covers every approved grade in the catalogue", () => {
        expect(articles.length).toBeGreaterThan(0);
        expect([...new Set(articles.map(({ data }) => data.sohl.detailMaterial))].sort()).toEqual(
            Object.keys(GRADES).sort(),
        );
    });
    for (const { file, data } of articles) {
        it(`${file} uses its grade rather than a uniform default`, () => {
            const grade = data.sohl.detailMaterial;
            const expected = GRADES[grade];
            expect(expected, `Unknown armour grade ${grade}`).toBeDefined();
            const [blunt, edged, piercing, fire, durability] = expected;
            expect(data.sohl.system.protectionBase).toEqual({ blunt, edged, piercing, fire });
            expect(data.sohl.system.durabilityBase).toBe(durability);
        });
    }
});
