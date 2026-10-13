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
import * as yaml from "js-yaml";
import {
    findSqlBlocks,
    openNotesDatabase,
    runSqlQuery,
    renderSqlTable,
} from "@heroiclands/package-build/engine/sql-tables";
import { coverageOf } from "./armour-coverage-helper";

const root = "assets/content/Armor";
const records = fs
    .readdirSync(root, { recursive: true })
    .filter((f) => String(f).endsWith(".md"))
    .map((f) => {
        const file = String(f);
        const text = fs.readFileSync(path.join(root, file), "utf8");
        const fm = yaml.load(text.split("\n---")[0].slice(3)) as any;
        return {
            ...fm,
            address: { slug: `${fm.type}-${fm.shortcode}` },
            package: "sohl",
            file: { path: file, name: file, folder: "Armor" },
        };
    });
const rates: Record<string, [number, string, number, number]> = {
    Cloth: [100, "Textilecraft", 0.45, 3],
    Padded: [200, "Textilecraft", 0.45, 3],
    Quilted: [400, "Textilecraft", 0.45, 3],
    Gambeson: [800, "Textilecraft", 0.45, 3],
    Leather: [400, "Hideworking", 0.4, 4],
    Kûrbúl: [500, "Weaponcraft", 0.15, 5],
    Scale: [1000, "Weaponcraft", 0.15, 5],
    Mail: [1500, "Weaponcraft", 0.15, 5],
    Ring: [1350, "Weaponcraft", 0.15, 5],
    Plate: [2000, "Weaponcraft", 0.15, 5],
};

interface ExpenseRow {
    _ref: { shortcode: string };
    Article: string;
    "Price (d)": number;
    "Materials (d)": number;
    Hours: number;
}

describe("build-generated armour expense tables", () => {
    it("covers every armour article once with the approved coverage, craft, labour cap and display rounding", async () => {
        const source = fs.readFileSync("assets/content/Rules/Crafting.md", "utf8");
        const blocks = findSqlBlocks(source);
        expect(blocks).toHaveLength(3);
        const sourceBefore = records.map((record) =>
            fs.readFileSync(path.join(root, record.file.path), "utf8"),
        );
        const db = await openNotesDatabase(records);
        try {
            const seen = new Set<string>();
            const byName: Record<string, ExpenseRow> = {};
            for (const [index, block] of blocks.entries()) {
                const result = await runSqlQuery(db, block.query);
                const rows = result.rows as ExpenseRow[];
                const craft = ["Textilecraft", "Hideworking", "Weaponcraft"][index];
                expect(result.rows).toHaveLength(
                    records.filter(
                        (record) =>
                            record.type === "armorgear" &&
                            rates[record.sohl.system.material]?.[1] === craft,
                    ).length,
                );
                for (const row of rows) {
                    const record = records.find((r) => r.shortcode === row._ref.shortcode);
                    expect(record).toBeDefined();
                    expect(seen.has(record.shortcode)).toBe(false);
                    seen.add(record.shortcode);
                    const system = record.sohl.system;
                    const [rate, expectedCraft, share, daily] = rates[system.material];
                    expect(craft).toBe(expectedCraft);
                    const locations = system.locations;
                    const coverage = coverageOf(
                        locations.flexible ?? [],
                        locations.rigid ?? [],
                        locations.facing ?? [],
                    );
                    const labour = (1 - share) * Math.min(system.valueBase, coverage * rate);
                    expect(row["Materials (d)"]).toBeCloseTo(
                        Math.round((system.valueBase - labour) * 100 + 1e-9) / 100,
                        8,
                    );
                    expect(row.Hours).toBe(
                        Math.round(Math.round((labour / daily) * 10 * 1e8) / 1e8),
                    );
                    expect(Number(row["Price (d)"])).toBe(system.valueBase);
                }
                const rendered = renderSqlTable(result);
                expect(rendered).toContain("[[sohl-note-armorgear-");
                expect(rendered).not.toContain("```sql");
                Object.assign(byName, Object.fromEntries(rows.map((row) => [row.Article, row])));
            }
            const examples: Record<string, [number, number]> = {
                "Mail Hauberk": [144, 1632],
                "Plate Cuirass": [72, 816],
                "Gambeson Coat": [239.6, 968],
                "Quilted Tunic": [81, 330],
                "Leather Vest": [137.4, 144],
                "Cloth Tunic": [20.25, 83],
                "Silk Tunic": [380.25, 83],
            };
            for (const [name, [materials, hours]] of Object.entries(examples)) {
                expect(byName[name], name).toBeDefined();
                expect(byName[name]["Materials (d)"]).toBeCloseTo(materials, 8);
                expect(byName[name].Hours).toBe(hours);
            }
            expect(seen.size).toBe(records.filter((r) => r.type === "armorgear").length);
            expect(
                records.map((record) => fs.readFileSync(path.join(root, record.file.path), "utf8")),
            ).toEqual(sourceBefore);
        } finally {
            await db.close();
        }
    });
});
