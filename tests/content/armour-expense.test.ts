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
import { readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { coverageOf } from "./armour-coverage-helper";
import { FIXTURE_SETTING } from "./fixture-setting";

const rates: Record<string, [number, number, number]> = {
    Cloth: [100, 0.45, 3],
    Padded: [200, 0.45, 3],
    Quilted: [400, 0.45, 3],
    Gambeson: [800, 0.45, 3],
    Leather: [400, 0.4, 4],
    Kûrbúl: [500, 0.15, 5],
    Scale: [1000, 0.15, 5],
    Mail: [1500, 0.15, 5],
    Ring: [1350, 0.15, 5],
    Plate: [2000, 0.15, 5],
};

function expense(price: number, coverage: number, material: string) {
    const [rate, share, daily] = rates[material];
    const labor = (1 - share) * Math.min(price, coverage * rate);
    return [
        Math.round((price - labor) * 100 + 1e-9) / 100,
        Math.round((labor / daily) * 10 + 1e-9),
    ];
}

describe("Armor crafting expenses", () => {
    it.each([
        ["Mail_Hauberk.md", 144, 1632],
        ["Plate_Cuirass.md", 72, 816],
        ["Gambeson_Coat.md", 239.6, 968],
        ["Quilted_Tunic.md", 81, 330],
        ["Leather_Vest.md", 137.4, 144],
        ["Cloth_Tunic.md", 20.25, 83],
        ["Silk_Tunic.md", 380.25, 83],
    ])("calculates the fixture %s", (file, materials, hours) => {
        const { data } = matter(readFileSync(path.join(FIXTURE_SETTING, "Armor", file), "utf8"));
        const item = data.sohl.system;
        const locations = item.locations;
        const coverage = coverageOf(
            locations.flexible ?? [],
            locations.rigid ?? [],
            locations.facing ?? [],
        );
        expect(expense(item.valueBase, coverage, item.material)).toEqual([materials, hours]);
    });

    it.each([
        ["Cloth", 9945, 183],
        ["Padded", 9890, 367],
        ["Quilted", 9780, 733],
        ["Gambeson", 9560, 1467],
        ["Leather", 9760, 600],
        ["Kûrbúl", 9575, 850],
        ["Scale", 9150, 1700],
        ["Mail", 8725, 2550],
        ["Ring", 8852.5, 2295],
        ["Plate", 8300, 3400],
    ])("applies the rate and craft share for %s", (material, materials, hours) => {
        expect(expense(10000, 1, material)).toEqual([materials, hours]);
    });

    it("caps labor at the sale price and rounds the result", () => {
        expect(expense(10, 1, "Mail")).toEqual([1.5, 17]);
        expect(expense(2000, 1, "Mail")).toEqual([725, 2550]);
        expect(expense(1, 0.01, "Cloth")).toEqual([0.45, 2]);
    });
});
