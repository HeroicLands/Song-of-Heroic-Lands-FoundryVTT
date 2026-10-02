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
 * The Folk Roster table on the **Unarmed Combat** rules page against the
 * combat-technique notes it describes.
 *
 * The page prints one row per technique a person carries, with that technique's
 * impact, zone die and reach. Those four facts live twice — once as prose a
 * player reads, once as the strike mode the engine rolls — so they drift, and a
 * reader has no way to tell which copy is stale.
 *
 * Both sides are derived at runtime rather than written down here:
 *
 * - **The roster** — every `.md` under `Skills/Combat_Techniques/`, parsed for
 *   its name and its strike mode's `impactBase`, `attack.spread` and
 *   `lengthBase`.
 * - **The table** — the rows under the page's Folk Roster heading, parsed from
 *   the markdown pipe table.
 *
 * So the pair is checked both ways: a technique with no row fails, a row with no
 * technique fails, and a row whose printed values disagree with the note fails.
 * Adding or splitting a technique therefore makes the page's table a build
 * failure until it is rewritten, which is the only way a nine-technique roster
 * stops printing eight rows.
 *
 * This guard answers completeness and the three printed values. It says nothing
 * about whether the prose around the table is true; the per-mechanic unit tests
 * carry that.
 */

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { parse as parseYaml } from "yaml";

const ROOT = path.resolve(__dirname, "../..");
const TECHNIQUES = path.join(ROOT, "assets/content/Skills/Combat_Techniques");
const RULES_PAGE = path.join(ROOT, "assets/content/Rules/Combat/Unarmed_Combat.md");

/** The heading whose table carries the roster. */
const ROSTER_HEADING = "## The Folk Roster";

/** What the table prints in a cell that has no value. */
const NONE = "—";

/**
 * A technique's printed values, as the page states them and as the note states
 * them. Both sides are reduced to this shape so the comparison is one object
 * against another and a failure names the field.
 */
interface Printed {
    /** Impact, as `"1d6−3 blunt"`, `"1d4 piercing"`, or {@link NONE}. */
    impact: string;
    /** Zone die, as `"d4"` or {@link NONE}. */
    zoneDie: string;
    /** Reach, as `"1 ft"` or {@link NONE}. */
    reach: string;
}

/** Strip the bold markers and surrounding space a table cell carries. */
function cell(text: string): string {
    return text.replaceAll("**", "").trim();
}

/**
 * Normalize a minus sign to the typographic one the tables use, so a note's
 * `-3` and a page's `−3` compare equal.
 *
 * @param text - The text to normalize.
 * @returns The text with ASCII hyphen-minus replaced.
 */
function minus(text: string): string {
    return text.replaceAll("-", "−");
}

/** The parsed frontmatter of every technique note, keyed by its file name. */
function techniqueNotes(): Map<string, any> {
    const found = new Map<string, any>();
    for (const file of readdirSync(TECHNIQUES).filter((f) => f.endsWith(".md"))) {
        const text = readFileSync(path.join(TECHNIQUES, file), "utf8");
        const close = text.indexOf("\n---\n", 4);
        found.set(file, parseYaml(text.slice(4, close + 1)));
    }
    return found;
}

/**
 * The name the roster table prints for a technique — its own name with the
 * `Folk` qualifier dropped, since the page's whole table is the folk roster and
 * repeating the word in every other row says nothing.
 *
 * @param fullName - The note's `name.full`.
 * @returns The name as the table prints it.
 */
function rosterName(fullName: string): string {
    return fullName.startsWith("Folk ") ? fullName.slice("Folk ".length) : fullName;
}

/**
 * What a technique note's strike mode says its printed values are.
 *
 * @param fm - The note's parsed frontmatter.
 * @returns The three printed values the table should carry for it.
 */
function printedFromNote(fm: any): Printed {
    const sm = fm.sohl.strikeMode;
    const { numDice, die, modifier, aspect } = sm.impactBase;
    let impact = NONE;
    if (numDice > 0 && die) {
        const mod = modifier ? minus(`${modifier > 0 ? "+" : ""}${modifier}`) : "";
        impact = `${numDice}d${die}${mod} ${aspect}`;
    }
    const spread = sm.attack?.spread ?? 0;
    const length = sm.lengthBase ?? 0;
    return {
        impact,
        zoneDie: spread ? `d${spread}` : NONE,
        reach: length ? `${length} ft` : NONE,
    };
}

/**
 * The roster table's rows, keyed by the technique name each prints.
 *
 * @returns A map from printed name to printed values.
 * @throws If the page carries no roster table, which would make every case
 *   below vacuously pass.
 */
function rosterTable(): Map<string, Printed> {
    const page = readFileSync(RULES_PAGE, "utf8");
    const start = page.indexOf(ROSTER_HEADING);
    if (start < 0) throw new Error(`${ROSTER_HEADING} not found in ${RULES_PAGE}`);
    const section = page.slice(start, page.indexOf("\n## ", start + 1));

    const rows = new Map<string, Printed>();
    for (const line of section.split("\n")) {
        if (!line.startsWith("|")) continue;
        const cells = line.split("|").slice(1, -1).map(cell);
        // The header row and the dashed separator beneath it are not data.
        if (cells[0] === "Technique" || /^-+$/.test(cells[0] ?? "")) continue;
        const [name, impact, zoneDie, reach] = cells;
        if (!name) continue;
        rows.set(name, {
            impact: impact ?? "",
            zoneDie: zoneDie ?? "",
            reach: reach ?? "",
        });
    }
    if (rows.size === 0) throw new Error(`no roster rows parsed from ${RULES_PAGE}`);
    return rows;
}

describe("the Folk Roster table matches the techniques it describes", () => {
    const notes = techniqueNotes();
    const table = rosterTable();

    it("finds the techniques and the table it is guarding", () => {
        expect(notes.size).toBeGreaterThan(0);
        expect(table.size).toBeGreaterThan(0);
    });

    it("prints one row per combat technique, and no row for anything else", () => {
        const expected = [...notes.values()].map((fm) => rosterName(fm.name.full)).sort();
        expect([...table.keys()].sort()).toEqual(expected);
    });

    it("prints each technique's own impact, zone die and reach", () => {
        const wrong: string[] = [];
        for (const fm of notes.values()) {
            const name = rosterName(fm.name.full);
            const row = table.get(name);
            if (!row) continue; // The missing-row case is the test above.
            const expected = printedFromNote(fm);
            for (const field of ["impact", "zoneDie", "reach"] as const) {
                if (row[field] !== expected[field]) {
                    wrong.push(
                        `${name} ${field}: the page prints "${row[field]}", ` +
                            `the technique says "${expected[field]}"`,
                    );
                }
            }
        }
        expect(wrong.sort()).toEqual([]);
    });
});
