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

interface Facing {
    location: string;
    side: string;
}
interface ArmorNote {
    name: string;
    armorType: string;
    covered: string[];
    facing: Facing[];
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

const NOTES: ArmorNote[] = walk(ARMOR_ROOT)
    .map((f) => matter(fs.readFileSync(f, "utf8")).data)
    .filter((d) => d.type === "armorgear")
    .map((d) => ({
        name: d.name.full,
        armorType: d.sohl.armorType,
        covered: [...(d.sohl.flexloc ?? []), ...(d.sohl.rigidloc ?? [])],
        facing: (d.sohl.facing ?? []) as Facing[],
    }));

const byType = (t: string) => NOTES.filter((n) => n.armorType === t);

/**
 * Directional coverage is the exception, not the rule. These are the only
 * articles that protect a location from one side alone; every other article
 * wraps what it covers. Adding a new one-sided article — a backplate, say —
 * means adding it here first.
 */
describe("armour facing", () => {
    it("finds cloaks and breastplates to check", () => {
        expect(byType("Cloak").length).toBeGreaterThan(0);
        expect(byType("Breastplate").length).toBeGreaterThan(0);
    });

    it("marks every cloak's torso and legs as rear-facing", () => {
        const rear = [
            "thrxloc",
            "abdmnloc",
            "plvisloc",
            "lthghloc",
            "rthghloc",
            "lkneeloc",
            "rkneeloc",
            "lcalfloc",
            "rcalfloc",
        ];
        for (const cloak of byType("Cloak")) {
            const back = cloak.facing
                .filter((f) => f.side === "back")
                .map((f) => f.location)
                .sort();
            expect(back, cloak.name).toEqual([...rear].sort());
            // Everything marked rear-facing must actually be covered.
            for (const loc of back)
                expect(cloak.covered, cloak.name).toContain(loc);
        }
    });

    // A cloak hangs from the shoulders alone — the arms are outside it, which
    // is why the table gives Cloak the shoulders and no upper-arm coverage.
    it("leaves a cloak's shoulders protected from all sides", () => {
        for (const cloak of byType("Cloak")) {
            const directional = cloak.facing.map((f) => f.location);
            for (const loc of ["lshldloc", "rshldloc"]) {
                expect(cloak.covered, cloak.name).toContain(loc);
                expect(directional, cloak.name).not.toContain(loc);
            }
        }
    });

    // A cuirass wraps the torso and is not directional; only the breastplate,
    // which is a front plate alone, carries the front-facing mark.
    it("marks breastplates as front-facing, and leaves cuirasses alone", () => {
        for (const art of byType("Cuirass"))
            expect(art.facing, art.name).toEqual([]);
        for (const art of byType("Breastplate")) {
            const front = art.facing
                .filter((f) => f.side === "front")
                .map((f) => f.location)
                .sort();
            expect(front, art.name).toEqual(["abdmnloc", "thrxloc"]);
        }
    });

    it("leaves every other article protected from all sides", () => {
        const oneSided = new Set(["Cloak", "Breastplate"]);
        for (const note of NOTES) {
            if (oneSided.has(note.armorType)) continue;
            expect(note.facing, note.name).toEqual([]);
        }
    });

    it("only ever names a covered location, and only front or back", () => {
        for (const note of NOTES) {
            for (const f of note.facing) {
                expect(note.covered, `${note.name}/${f.location}`).toContain(
                    f.location,
                );
                expect(["front", "back"]).toContain(f.side);
            }
        }
    });
});
