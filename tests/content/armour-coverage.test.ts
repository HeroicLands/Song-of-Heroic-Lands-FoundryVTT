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
for (const f of ["jawloc", "lcheekloc", "rcheekloc", "learloc", "rearloc", "mouthloc", "noseloc"])
    WEIGHT[f] = 0.03 / 7;

/**
 * The articles the source table actually lists. Anything SoHL adds beyond it is
 * not held to the table's encumbrance and perception columns, having never been
 * taken from them.
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
            ["Quilted", "Cap Cowl Mantle Vest Shirt Tunic|Sleeved Tunic|Coat Surcoat|Cuisse"],
            ["Gambeson", "Vest Shirt|Long Vest|Tunic|Sleeved Tunic|Coat"],
            [
                "Kûrbúl",
                "Helm|3/4-Helm|Spaulders Rerebraces Coudes Vambraces Cuirass Breastplate Kneecops Greaves",
            ],
            [
                "Scale",
                "Cowl Gauntlets Vest Byrnie|Sleeved Byrnie|Habergeon Hauberk|Cuisse|Leggings",
            ],
            ["Mail", "Cowl Mittens Vest Byrnie|Sleeved Byrnie|Habergeon Hauberk|Cuisse|Leggings"],
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

/**
 * The table's ENC column, for the articles that carry a number. Everything else
 * is 0 — including the pieces marked (A), which impose nothing on their own and
 * only cost ENC 5 once three or more arm articles are worn together.
 */
const ENCUMBRANCE: Record<string, number> = {
    "Leather/Long Vest": 5,
    "Quilted/Sleeved Tunic": 5,
    "Quilted/Coat": 5,
    "Gambeson/Shirt": 5,
    "Gambeson/Long Vest": 5,
    "Gambeson/Tunic": 5,
    "Gambeson/Sleeved Tunic": 10,
    "Gambeson/Coat": 10,
    "Kûrbúl/Cuirass": 5,
    "Kûrbúl/Breastplate": 5,
    "Kûrbúl/Greaves": 5,
    "Scale/Vest": 5,
    "Scale/Byrnie": 10,
    "Scale/Sleeved Byrnie": 15,
    "Scale/Habergeon": 15,
    "Scale/Hauberk": 20,
    "Scale/Cuisse": 5,
    "Scale/Leggings": 10,
    "Mail/Byrnie": 5,
    "Mail/Sleeved Byrnie": 10,
    "Mail/Habergeon": 10,
    "Mail/Hauberk": 15,
    "Mail/Cuisse": 5,
    "Mail/Leggings": 10,
    "Plate/Cuirass": 5,
    "Plate/Breastplate": 5,
    "Plate/Greaves": 5,
    // Ring is absent from the table and follows mail.
    "Ring/Byrnie": 5,
    "Ring/Hauberk": 15,
    "Ring/Leggings": 10,
};

/**
 * The articles the table marks (A): they carry no encumbrance of their own, and
 * instead cost ENC 5 between them once three or more are worn together. The
 * marker is separate from the ENC column precisely because the two differ —
 * ENC is always on, (A) applies only above a threshold.
 */
const ARM_ARTICLES = new Set([
    "Kûrbúl/Spaulders",
    "Kûrbúl/Rerebraces",
    "Kûrbúl/Coudes",
    "Kûrbúl/Vambraces",
    "Kûrbúl/Ailettes",
    "Plate/Spaulders",
    "Plate/Rerebraces",
    "Plate/Coudes",
    "Plate/Vambraces",
    "Plate/Ailettes",
    "Scale/Gauntlets",
    "Mail/Mittens",
    "Ring/Gauntlets",
]);

/** The perception penalty each marked article imposes: −5 black, −10 red. */
const PERCEPTION: Record<string, number> = {
    "Padded/Cowl": -5,
    "Quilted/Cowl": -5,
    "Kûrbúl/3/4-Helm": -5,
    "Scale/Cowl": -5,
    "Mail/Cowl": -5,
    "Plate/3/4-Helm": -5,
    "Plate/Great Helm": -10,
};

interface Article {
    file: string;
    material: string;
    detailMaterial: string;
    armorType: string;
    flexible: string[];
    rigid: string[];
    facing: { location: string; side: string }[];
    encumbrance: number;
    encumbranceGroup: string | null;
    perception: number;
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
        encumbrance: d.sohl.encumbrance ?? 0,
        encumbranceGroup: d.sohl.encumbranceGroup ?? null,
        perception: d.sohl.perceptionPenaltyBase ?? 0,
    }));

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
                expect(a.flexible, `${a.file} (${a.material} is rigid)`).toEqual([]);
            } else if (ALL_FLEXIBLE.has(a.material)) {
                expect(a.rigid, `${a.file} (${a.material} is flexible)`).toEqual([]);
            } else if (a.material === "Gambeson") {
                for (const l of a.rigid) expect(TORSO.has(l), `${a.file}: ${l}`).toBe(true);
                for (const l of a.flexible) expect(TORSO.has(l), `${a.file}: ${l}`).toBe(false);
            }
        }
    });

    it("gives each table article the encumbrance and perception the table does", () => {
        for (const a of ARTICLES) {
            const key = `${a.material}/${a.armorType}`;
            if (!TABLE_ARTICLES.has(key)) continue;
            expect(a.encumbrance, `${a.file} encumbrance`).toBe(ENCUMBRANCE[key] ?? 0);
            expect(a.perception, `${a.file} perception`).toBe(PERCEPTION[key] ?? 0);
        }
    });

    it("marks the arm articles, and only those", () => {
        for (const a of ARTICLES) {
            const expected = ARM_ARTICLES.has(`${a.material}/${a.armorType}`) ? "arm" : null;
            expect(a.encumbranceGroup, a.file).toBe(expected);
            // An article in a group carries no encumbrance of its own.
            if (expected) expect(a.encumbrance, a.file).toBe(0);
        }
    });

    /*
     * Price is deliberately **not** asserted here.
     *
     * It used to be: an article cost its covered fraction of the body times the
     * material's base rate, which made price a checksum for coverage. That is
     * the wrong thing to freeze. **Price is authorial** — an initial value may
     * be derived that way, but the final figure is a design decision, and it
     * has to be free to be set arbitrarily, including rounding to whole pence
     * or to a shop-friendly band.
     *
     * **Weight is the honest checksum**, because it follows from how much
     * material the article is made of, which is exactly what coverage measures.
     * Asserting it needs the per-grade weights reconciled first — four grades
     * hold ratios varying by a factor of three — so until #1716 lands, nothing
     * in this file verifies an article's coverage, and a mis-authored
     * `flexloc`/`facing` list will pass.
     */
});
