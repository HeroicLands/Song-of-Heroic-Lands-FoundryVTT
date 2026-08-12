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

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ARMOR_ROOT = path.resolve(__dirname, "../../assets/content/Armor");

/**
 * Fraction of the body each location accounts for. The full set sums to 1.0,
 * and an article's coverage is the sum of the locations it protects.
 */
const WEIGHT: Record<string, number> = {
    skullloc: 0.04,
    neckloc: 0.02,
    lshldloc: 0.015,
    rshldloc: 0.015,
    lupaloc: 0.03,
    rupaloc: 0.03,
    lelbloc: 0.01,
    relbloc: 0.01,
    lfraloc: 0.025,
    rfraloc: 0.025,
    lhandloc: 0.025,
    rhandloc: 0.025,
    thrxloc: 0.12,
    abdmnloc: 0.12,
    plvisloc: 0.1,
    lthghloc: 0.07,
    rthghloc: 0.07,
    lkneeloc: 0.015,
    rkneeloc: 0.015,
    lcalfloc: 0.06,
    rcalfloc: 0.06,
    lfootloc: 0.035,
    rfootloc: 0.035,
};
for (const f of [
    "jawloc",
    "lcheekloc",
    "rcheekloc",
    "learloc",
    "rearloc",
    "mouthloc",
    "noseloc",
])
    WEIGHT[f] = 0.03 / 7;

/** Base price per unit of coverage, by material. */
const BASE_PRICE: Record<string, number> = {
    Cloth: 100,
    Leather: 400,
    Padded: 200,
    Quilted: 400,
    Gambeson: 800,
    Kûrbúl: 500,
    Scale: 1000,
    Mail: 1500,
    Plate: 2000,
};

/**
 * The plain grade of each material — the one the table prices. It is the
 * material's own name everywhere except leather, where rawhide is the plain
 * grade and "Leather" is a better one costing twice as much.
 */
const BASE_GRADE: Record<string, string> = { Leather: "Rawhide" };

/**
 * The articles the table actually prices. Anything SoHL adds beyond it is not
 * held to the checksum, since those prices were never derived from it.
 */
const TABLE_ARTICLES = new Set<string>(
    (
        [
            [
                "Cloth",
                "Cap Cowl Mantle Gauntlets Vest Shirt Tunic|Sleeved Tunic|Coat Surcoat Cloak Robe Breeches Trousers Leggings Swaddle",
            ],
            ["Leather", "Cap Bracers Gauntlets Vest|Long Vest|Boots Shoes"],
            [
                "Padded",
                "Cap Cowl Mantle Mittens Vest Shirt Tunic|Sleeved Tunic|Coat Surcoat Cloak|Cuisse|Trousers Leggings",
            ],
            [
                "Quilted",
                "Cap Cowl Mantle Vest Shirt Tunic|Sleeved Tunic|Coat Surcoat|Cuisse",
            ],
            ["Gambeson", "Vest Shirt|Long Vest|Tunic|Sleeved Tunic|Coat"],
            [
                "Kûrbúl",
                "Helm|3/4-Helm|Spaulders Rerebraces Coudes Vambraces Cuirass Breastplate Kneecops Greaves",
            ],
            [
                "Scale",
                "Cowl Gauntlets Vest Byrnie|Sleeved Byrnie|Habergeon Hauberk|Cuisse|Leggings",
            ],
            [
                "Mail",
                "Cowl Mittens Vest Byrnie|Sleeved Byrnie|Habergeon Hauberk|Cuisse|Leggings",
            ],
            [
                "Plate",
                "Helm|3/4-Helm|Great Helm|Spaulders Rerebraces Coudes Vambraces Cuirass Breastplate Kneecops Greaves",
            ],
        ] as [string, string][]
    ).flatMap(([mat, list]) =>
        list
            .split("|")
            .flatMap((chunk) =>
                chunk.includes(" ") && !chunk.includes("-") ?
                    chunk.split(" ").map((a) => `${mat}/${a}`)
                :   [`${mat}/${chunk}`],
            ),
    ),
);

/** Materials whose coverage is wholly rigid, and wholly flexible. */
const ALL_RIGID = new Set(["Kûrbúl", "Scale", "Mail", "Plate", "Ring"]);
const ALL_FLEXIBLE = new Set(["Cloth", "Leather", "Padded", "Quilted"]);
/** Gambeson alone is mixed: rigid over the torso, flexible everywhere else. */
const TORSO = new Set(["thrxloc", "abdmnloc", "plvisloc"]);

interface Article {
    file: string;
    material: string;
    detailMaterial: string;
    armorType: string;
    flexible: string[];
    rigid: string[];
    facing: { location: string; side: string }[];
    value: number;
}

function walk(dir: string): string[] {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(dir, e.name);
        return (
            e.isDirectory() ? walk(p)
            : p.endsWith(".md") ? [p]
            : []
        );
    });
}

const ARTICLES: Article[] = walk(ARMOR_ROOT)
    .map((f) => ({ f, d: matter(fs.readFileSync(f, "utf8")).data }))
    .filter(({ d }) => d.type === "armorgear")
    .map(({ f, d }) => ({
        file: path.basename(f, ".md"),
        material: d.sohl.material,
        detailMaterial: d.sohl.detailMaterial,
        armorType: d.sohl.armorType,
        flexible: d.sohl.flexloc ?? [],
        rigid: d.sohl.rigidloc ?? [],
        facing: d.sohl.facing ?? [],
        value: d.sohl.value,
    }));

const coverage = (a: Article) =>
    [...new Set([...a.flexible, ...a.rigid])].reduce(
        (t, l) => t + (WEIGHT[l] ?? 0),
        0,
    );

describe("armour coverage", () => {
    it("has articles to check", () => {
        expect(ARTICLES.length).toBeGreaterThan(300);
    });

    /**
     * The two lists partition an article's coverage. A location in both is
     * counted twice by the aggregation and flagged rigid regardless.
     */
    it("never lists a location as both flexible and rigid", () => {
        for (const a of ARTICLES) {
            const both = a.flexible.filter((l) => a.rigid.includes(l));
            expect(both, a.file).toEqual([]);
        }
    });

    /**
     * Rigidity follows the material, with gambeson the sole exception —
     * quilting stiff enough to count as rigid over the torso, but not on the
     * arms or neck.
     */
    it("makes coverage rigid or flexible according to the material", () => {
        for (const a of ARTICLES) {
            if (ALL_RIGID.has(a.material)) {
                expect(
                    a.flexible,
                    `${a.file} (${a.material} is rigid)`,
                ).toEqual([]);
            } else if (ALL_FLEXIBLE.has(a.material)) {
                expect(
                    a.rigid,
                    `${a.file} (${a.material} is flexible)`,
                ).toEqual([]);
            } else if (a.material === "Gambeson") {
                for (const l of a.rigid)
                    expect(TORSO.has(l), `${a.file}: ${l}`).toBe(true);
                for (const l of a.flexible)
                    expect(TORSO.has(l), `${a.file}: ${l}`).toBe(false);
            }
        }
    });

    /**
     * Price is a checksum for coverage: an article costs its covered fraction
     * of the body times the material's base price, with one-sided coverage
     * counted at half because it is half the material. Checked on the articles
     * whose detail material is the plain grade, since the others scale by the
     * wearer's means. Articles SoHL adds beyond the table are excluded: their
     * prices were set independently and have never been reconciled.
     */
    it("prices each base article at its coverage times the material rate", () => {
        const checked: string[] = [];
        for (const a of ARTICLES) {
            if (a.detailMaterial !== (BASE_GRADE[a.material] ?? a.material))
                continue;
            if (!TABLE_ARTICLES.has(`${a.material}/${a.armorType}`)) continue;
            const rate = BASE_PRICE[a.material];
            if (!rate) continue;
            const oneSided = a.facing.length > 0;
            const cov = oneSided ? coverage(a) / 2 : coverage(a);
            expect(
                a.value,
                `${a.file} (coverage ${cov.toFixed(3)})`,
            ).toBeCloseTo(cov * rate, 0);
            checked.push(a.file);
        }
        expect(checked.length).toBeGreaterThan(20);
    });
});
