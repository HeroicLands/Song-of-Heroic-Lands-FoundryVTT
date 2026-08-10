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
 * The Domesticated Animal Abilities and Wild Animal Abilities reference
 * tables, as an executable specification.
 *
 * The tables below are the authority; the markdown under
 * `assets/content/Creatures/Animal/` is the copy. An animal whose ability
 * scores, weight, body scale, movement, skill values, natural weapons, natural
 * armour or hit-location table drift from the printed row fails here rather
 * than shipping wrong numbers to a GM.
 */

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { parse as parseYaml } from "yaml";
import { BodyStructure } from "@src/entity/body/BodyStructure";
import { bodyOptions } from "@tests/mocks/bodyFixture";

const CONTENT = path.resolve(
    __dirname,
    "../../assets/content/Creatures/Animal",
);

/* ------------------------------------------------------------------ */
/*  The printed tables                                                */
/* ------------------------------------------------------------------ */

/** `[STR, END, AGL, PER, SCENT, AUR, WIL, REA, CRE]`. */
type Scores = [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
];
/** `[AWARE, STEALTH, SPIRIT, INITIATIVE, DODGE, SHOCK]`. */
type Ratings = [number, number, number, number, number, number];
/** `[B, E, P, F]` — the natural-armour column group. */
type Armour = [number, number, number, number];
/**
 * One weapons-table row:
 * `[name, shortcode, RCH, ZD, ATK, impact die, impact modifier, aspect]`.
 * A zone die printed as "1/d6" uses the aimed value, 1.
 */
type Weapon = [string, string, number, number, number, number, number, string];

interface Row {
    /** Content file stem under `assets/content/Creatures/Animal/`. */
    file: string;
    /** Hit-location table letter (A–M). */
    table: string;
    scores: Scores;
    /** LBS column. */
    lb: number;
    /** MOVE column; `aerial` where the table prints FLY. */
    move: number;
    aerial?: boolean;
    ratings: Ratings;
    armour: Armour;
    weapons: Weapon[];
}

/** Zone-number runs each hit-location table claims, in persisted zone order. */
const ZONE_RUNS: Record<string, number[]> = {
    A: [2, 1, 4, 3],
    B: [3, 2, 7, 4],
    C: [4, 2, 8, 6],
    D: [1, 1, 1],
    E: [2, 2, 2],
    F: [2, 2, 4, 2],
    G: [3, 3, 6, 4],
    H: [4, 4, 8, 4],
    I: [1, 1, 1],
    J: [7, 3, 6, 18, 6],
    K: [1, 1, 2, 1, 1],
    L: [1, 3, 2],
    M: [3, 11, 6],
};

const ELEPHANT = {
    table: "J",
    scores: [56, 48, 7, 18, 7, 6, 16, 8, 8] as Scores,
    lb: 10000,
    move: 90,
    ratings: [85, 48, 33, 48, 36, 90] as Ratings,
    armour: [18, 17, 15, 17] as Armour,
    weapons: [
        ["Tusk", "tusk", 6, 12, 55, 6, 23, "piercing"],
        ["Kick", "kick", 5, 24, 44, 6, 20, "blunt"],
    ] as Weapon[],
};

const ROWS: Row[] = [
    /* ---- Domesticated Animal Abilities ---- */
    {
        file: "Bovine",
        table: "C",
        scores: [32, 18, 8, 14, 3, 3, 10, 3, 2],
        lb: 1500,
        move: 80,
        ratings: [60, 33, 18, 21, 33, 51],
        armour: [6, 5, 3, 5],
        weapons: [["Kick", "kick", 2, 8, 45, 6, 6, "blunt"]],
    },
    {
        file: "Dromedary_Camel",
        table: "C",
        scores: [28, 14, 8, 18, 5, 4, 14, 5, 6],
        lb: 1100,
        move: 120,
        ratings: [80, 52, 27, 30, 39, 42],
        armour: [5, 4, 2, 4],
        weapons: [
            ["Kick", "kick", 3, 8, 55, 6, 6, "blunt"],
            ["Bite", "bite", 2, 4, 44, 4, 4, "piercing"],
        ],
    },
    {
        file: "Cat",
        table: "D",
        scores: [3, 8, 18, 16, 3, 4, 18, 5, 5],
        lb: 10,
        move: 70,
        ratings: [85, 85, 33, 36, 68, 15],
        armour: [-3, -4, -5, -3],
        weapons: [
            ["Claw", "claw", 0, 1, 72, 8, -7, "edged"],
            ["Bite", "bite", 0, 1, 54, 6, -5, "piercing"],
        ],
    },
    {
        file: "Ratter",
        table: "D",
        scores: [4, 7, 13, 18, 5, 4, 13, 6, 7],
        lb: 20,
        move: 90,
        ratings: [80, 60, 24, 50, 60, 25],
        armour: [-1, -2, -3, -1],
        weapons: [["Bite", "bite", 0, 1, 60, 6, -4, "piercing"]],
    },
    {
        file: "Hunting_Dog",
        table: "E",
        scores: [8, 9, 13, 20, 6, 4, 12, 6, 7],
        lb: 60,
        move: 110,
        ratings: [80, 64, 24, 45, 64, 40],
        armour: [2, 1, 0, 2],
        weapons: [["Bite", "bite", 1, 1, 65, 6, -1, "piercing"]],
    },
    {
        file: "Guard_Dog",
        table: "E",
        scores: [11, 10, 13, 17, 5, 4, 14, 6, 7],
        lb: 110,
        move: 120,
        ratings: [80, 60, 27, 50, 60, 55],
        armour: [3, 2, 1, 3],
        weapons: [["Bite", "bite", 1, 1, 65, 6, 0, "piercing"]],
    },
    {
        file: "Donkey",
        table: "B",
        scores: [24, 13, 12, 18, 3, 4, 12, 4, 5],
        lb: 600,
        move: 110,
        ratings: [75, 60, 24, 24, 60, 39],
        armour: [4, 3, 1, 3],
        weapons: [
            ["Kick", "kick", 3, 6, 60, 6, 4, "blunt"],
            ["Bite", "bite", 2, 3, 48, 4, 3, "piercing"],
        ],
    },
    {
        file: "Pony",
        table: "B",
        scores: [24, 10, 12, 17, 3, 4, 11, 4, 4],
        lb: 700,
        move: 130,
        ratings: [70, 56, 21, 24, 56, 36],
        armour: [4, 3, 1, 3],
        weapons: [
            ["Kick", "kick", 3, 6, 60, 6, 4, "blunt"],
            ["Bite", "bite", 2, 3, 48, 4, 3, "piercing"],
        ],
    },
    {
        file: "Mule",
        table: "C",
        scores: [25, 12, 12, 17, 3, 4, 12, 5, 6],
        lb: 900,
        move: 120,
        ratings: [75, 56, 24, 27, 62, 39],
        armour: [4, 3, 1, 3],
        weapons: [
            ["Kick", "kick", 3, 8, 60, 6, 4, "blunt"],
            ["Bite", "bite", 2, 4, 48, 4, 3, "piercing"],
        ],
    },
    {
        file: "Palfrey",
        table: "C",
        scores: [26, 10, 11, 17, 4, 4, 10, 4, 4],
        lb: 1000,
        move: 130,
        ratings: [70, 56, 21, 21, 56, 36],
        armour: [5, 4, 2, 4],
        weapons: [
            ["Kick", "kick", 3, 8, 55, 6, 5, "blunt"],
            ["Bite", "bite", 2, 4, 44, 4, 4, "piercing"],
        ],
    },
    {
        file: "Courser",
        table: "C",
        scores: [27, 10, 12, 17, 4, 4, 11, 4, 4],
        lb: 1100,
        move: 150,
        ratings: [70, 56, 21, 32, 60, 52],
        armour: [5, 4, 2, 4],
        weapons: [
            ["Kick", "kick", 3, 8, 60, 6, 5, "blunt"],
            ["Bite", "bite", 2, 4, 48, 4, 4, "piercing"],
        ],
    },
    {
        file: "Charger",
        table: "C",
        scores: [28, 11, 11, 17, 4, 4, 11, 4, 4],
        lb: 1200,
        move: 140,
        ratings: [70, 56, 21, 40, 56, 65],
        armour: [5, 4, 2, 4],
        weapons: [
            ["Kick", "kick", 3, 8, 62, 6, 6, "blunt"],
            ["Bite", "bite", 2, 4, 55, 4, 4, "piercing"],
        ],
    },
    {
        file: "Destrier",
        table: "C",
        scores: [30, 12, 10, 17, 4, 4, 12, 5, 5],
        lb: 1400,
        move: 120,
        ratings: [70, 52, 24, 53, 59, 75],
        armour: [6, 5, 3, 5],
        weapons: [
            ["Kick", "kick", 3, 8, 68, 6, 7, "blunt"],
            ["Bite", "bite", 2, 4, 62, 4, 5, "piercing"],
        ],
    },
    {
        file: "Ram",
        table: "A",
        scores: [16, 14, 14, 17, 4, 3, 15, 3, 3],
        lb: 300,
        move: 120,
        ratings: [80, 60, 27, 27, 60, 45],
        armour: [3, 2, 1, 3],
        weapons: [
            ["Gore", "gore", 0, 2, 70, 6, 5, "blunt"],
            ["Kick", "kick", 2, 4, 56, 6, 1, "blunt"],
        ],
    },

    /* ---- Wild Animal Abilities ---- */
    // The smaller bear row.
    {
        file: "Black_Bear",
        table: "F",
        scores: [16, 12, 13, 14, 6, 4, 12, 5, 5],
        lb: 300,
        move: 100,
        ratings: [65, 65, 24, 36, 52, 56],
        armour: [4, 3, 2, 4],
        weapons: [
            ["Bite", "bite", 1, 2, 65, 6, 3, "piercing"],
            ["Claw", "claw", 2, 4, 52, 8, 2, "edged"],
        ],
    },
    // The middle bear row.
    {
        file: "Brown_Bear",
        table: "G",
        scores: [24, 18, 12, 14, 6, 5, 13, 4, 4],
        lb: 700,
        move: 120,
        ratings: [70, 65, 27, 36, 52, 76],
        armour: [8, 7, 6, 8],
        weapons: [
            ["Bite", "bite", 2, 3, 60, 6, 7, "piercing"],
            ["Claw", "claw", 3, 6, 48, 8, 6, "edged"],
        ],
    },
    // The largest bear row, shared by the cave and polar bears.
    {
        file: "Cave_Bear",
        table: "H",
        scores: [28, 21, 10, 14, 7, 5, 15, 5, 5],
        lb: 1000,
        move: 90,
        ratings: [70, 60, 30, 40, 48, 84],
        armour: [10, 9, 8, 10],
        weapons: [
            ["Bite", "bite", 3, 4, 60, 6, 9, "piercing"],
            ["Claw", "claw", 4, 8, 48, 8, 8, "edged"],
        ],
    },
    {
        file: "Polar_Bear",
        table: "H",
        scores: [28, 21, 10, 14, 7, 5, 15, 5, 5],
        lb: 1000,
        move: 90,
        ratings: [70, 60, 30, 40, 48, 84],
        armour: [10, 9, 8, 10],
        weapons: [
            ["Bite", "bite", 3, 4, 60, 6, 9, "piercing"],
            ["Claw", "claw", 4, 8, 48, 8, 8, "edged"],
        ],
    },
    {
        file: "Boar",
        table: "F",
        scores: [14, 16, 9, 10, 4, 4, 15, 6, 7],
        lb: 200,
        move: 110,
        ratings: [60, 45, 27, 55, 36, 75],
        armour: [3, 2, 1, 3],
        weapons: [
            ["Tusk", "tusk", 0, 4, 60, 6, 2, "piercing"],
            ["Kick", "kick", 1, 6, 48, 6, -1, "blunt"],
        ],
    },
    {
        file: "Crow",
        table: "I",
        scores: [2, 8, 10, 22, 3, 6, 10, 8, 10],
        lb: 3,
        move: 200,
        aerial: true,
        ratings: [80, 64, 32, 27, 64, 15],
        armour: [-6, -7, -8, -6],
        weapons: [
            ["Talon", "talon", 0, 1, 40, 8, -9, "edged"],
            ["Beak", "beak", 0, 1, 44, 6, -8, "piercing"],
        ],
    },
    {
        file: "Eagle",
        table: "K",
        scores: [4, 10, 10, 26, 3, 5, 10, 8, 8],
        lb: 20,
        move: 300,
        aerial: true,
        ratings: [90, 72, 21, 36, 72, 28],
        armour: [-2, -3, -4, -2],
        weapons: [
            ["Talon", "talon", 0, 2, 50, 10, -5, "edged"],
            ["Beak", "beak", 0, 1, 40, 6, -4, "piercing"],
        ],
    },
    {
        file: "Fox",
        table: "D",
        scores: [3, 10, 15, 16, 4, 4, 14, 7, 8],
        lb: 15,
        move: 100,
        ratings: [75, 60, 27, 44, 60, 24],
        armour: [-3, -4, -5, -3],
        weapons: [
            ["Bite", "bite", 0, 1, 75, 6, -6, "piercing"],
            ["Claw", "claw", 0, 1, 60, 8, -7, "edged"],
        ],
    },
    {
        file: "Falcon",
        table: "I",
        scores: [2, 8, 13, 24, 3, 4, 8, 7, 7],
        lb: 2,
        move: 400,
        aerial: true,
        ratings: [80, 72, 18, 32, 72, 20],
        armour: [-6, -7, -8, -6],
        weapons: [
            ["Talon", "talon", 0, 1, 55, 10, -9, "edged"],
            ["Beak", "beak", 0, 1, 44, 6, -8, "piercing"],
        ],
    },
    {
        file: "Lion",
        table: "F",
        scores: [12, 13, 18, 16, 4, 5, 16, 5, 5],
        lb: 130,
        move: 160,
        ratings: [85, 90, 30, 44, 72, 60],
        armour: [3, 2, 1, 3],
        weapons: [
            ["Claw", "claw", 0, 2, 85, 8, 0, "edged"],
            ["Bite", "bite", 1, 1, 68, 6, 1, "piercing"],
        ],
    },
    {
        file: "Poisonous_Snake",
        table: "L",
        scores: [4, 10, 14, 10, 4, 2, 8, 2, 2],
        lb: 10,
        move: 40,
        ratings: [45, 48, 15, 20, 44, 28],
        armour: [-2, 0, -1, -2],
        weapons: [["Bite", "bite", 1, 1, 62, 8, -2, "piercing"]],
    },
    {
        file: "Constrictor_Snake",
        table: "M",
        scores: [14, 12, 9, 13, 3, 2, 8, 2, 2],
        lb: 150,
        move: 30,
        ratings: [55, 44, 15, 20, 48, 52],
        armour: [4, 6, 5, 4],
        weapons: [
            ["Bite", "bite", 3, 2, 53, 8, 2, "piercing"],
            ["Grab", "grab", 0, 6, 73, 6, 14, "blunt"],
        ],
    },
    {
        file: "Stag",
        table: "A",
        scores: [18, 13, 10, 18, 3, 5, 12, 5, 5],
        lb: 400,
        move: 140,
        ratings: [75, 56, 24, 27, 56, 48],
        armour: [3, 2, 1, 3],
        weapons: [["Gore", "gore", 1, 4, 60, 6, 4, "piercing"]],
    },
    {
        file: "Gray_Wolf",
        table: "E",
        scores: [10, 10, 14, 17, 5, 4, 13, 5, 5],
        lb: 80,
        move: 130,
        ratings: [75, 60, 24, 36, 60, 40],
        armour: [3, 2, 1, 3],
        weapons: [["Bite", "bite", 0, 1, 70, 6, 0, "piercing"]],
    },
    // The single ELEPHANT row covers all three setting elephants.
    { file: "Tanvuran_Elephant", ...ELEPHANT },
    { file: "Xerathian_Forest_Elephant", ...ELEPHANT },
    { file: "Xerathian_Savanna_Elephant", ...ELEPHANT },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const ATTR_ORDER = [
    "str",
    "end",
    "agl",
    "per",
    "snt",
    "aur",
    "wil",
    "rea",
    "cre",
] as const;
const RATING_CODES = ["awar", "stlth", "sprt", "init", "dge", "shok"] as const;
const ASPECTS = ["blunt", "edged", "piercing", "fire"] as const;

/** Read one animal's `sohl` frontmatter block. */
function readSohl(file: string): any {
    return readSohlAt(path.join(CONTENT, `${file}.md`));
}

/** Read the `sohl` frontmatter block of a creature file by full path. */
function readSohlAt(full: string): any {
    const text = readFileSync(full, "utf8");
    const close = text.indexOf("\n---\n", 4);
    return parseYaml(text.slice(4, close + 1))?.sohl;
}

/**
 * Body scale, seeded from Strength on a compressive curve so the bestiary
 * centres near human and the extremes stay rare. Strength 11 maps to exactly
 * 1.0; the largest dragon reaches 3.01 and nothing else comes near it.
 */
function bodyScale(str: number): number {
    return Math.pow(str / 11, 0.65);
}

/** `1d6 + (score − 3)` at 10 and above, `1d4 + (score − 2)` below it. */
function rollFormula(score: number): string {
    const die = score >= 10 ? 6 : 4;
    const bonus = score - (score >= 10 ? 3 : 2);
    return bonus > 0 ? `1d${die}+${bonus}` : `1d${die}`;
}

/**
 * Shortcodes of every combat-technique skill in the content tree. A creature
 * may carry a technique inline or reference a shared one by shortcode, and both
 * count as being armed.
 */
const SHARED_TECHNIQUES = (() => {
    const root = path.resolve(__dirname, "../../assets/content/Skills");
    const found = new Set<string>();
    const walk = (dir: string): void => {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(full);
            } else if (entry.name.endsWith(".md")) {
                const text = readFileSync(full, "utf8");
                const close = text.indexOf("\n---\n", 4);
                const fm = parseYaml(text.slice(4, close + 1));
                if (fm?.sohl?.subType === "combattechnique" && fm.shortcode) {
                    found.add(fm.shortcode);
                }
            }
        }
    };
    walk(root);
    return found;
})();

/** Every embedded item of the given `(type, subType)`. */
function items(sohl: any, type: string, subType?: string): any[] {
    return (sohl.items ?? []).filter(
        (i: any) =>
            i.type === type &&
            (subType === undefined || i.system?.subType === subType),
    );
}

/* ------------------------------------------------------------------ */
/*  Specification                                                     */
/* ------------------------------------------------------------------ */

describe.each(ROWS)("$file", (row) => {
    const sohl = readSohl(row.file);

    it("carries the table's ability scores", () => {
        const expected = Object.fromEntries(
            ATTR_ORDER.map((code, i) => [code, row.scores[i]]),
        );
        expect(sohl.attributes).toEqual(expected);
    });

    it("derives each roll formula from its score", () => {
        const expected = Object.fromEntries(
            ATTR_ORDER.map((code, i) => [code, rollFormula(row.scores[i])]),
        );
        expect(sohl.attrRollFormula).toEqual(expected);
    });

    it("carries the table's weight and the body scale it implies", () => {
        expect(sohl.body.weight.base).toBe(row.lb);
        expect(sohl.body.weight.calc).toBe(String(row.lb));
        expect(sohl.body.bodyScaleBase).toBeCloseTo(
            bodyScale(row.scores[0]),
            2,
        );
    });

    it("moves at the table's rate, in the medium the table prints", () => {
        const medium = row.aerial ? "aerial" : "terrestrial";
        expect(sohl.currentMoveMedium).toBe(medium);
        const profile = sohl.movementProfiles.find(
            (p: any) => p.medium === medium,
        );
        expect(profile?.feetPerRound).toBe(row.move);
    });

    it("carries the AWARE / STEALTH / SPIRIT / INITIATIVE / DODGE / SHOCK values", () => {
        for (const [i, code] of RATING_CODES.entries()) {
            const entry = (sohl.items ?? []).find(
                (x: any) => x.shortcode === code,
            );
            expect(entry, `missing "${code}"`).toBeDefined();
            expect(entry.system.masteryLevelBase, code).toBe(row.ratings[i]);
        }
    });

    it("has one combat technique per weapons-table row", () => {
        const techniques = items(sohl, "skill", "combattechnique");
        expect(techniques.map((t) => t.name)).toEqual(
            row.weapons.map(([name]) => name),
        );

        for (const [i, w] of row.weapons.entries()) {
            const [name, code, reach, zoneDie, atk, die, mod, aspect] = w;
            const tech = techniques[i];
            const sm = tech.system.strikeMode;
            expect(tech.system.shortcode, name).toBe(code);
            // The technique and its strike mode carry the same attack value.
            expect(tech.system.masteryLevelBase, name).toBe(atk);
            expect(sm.attack.modifier, name).toBe(0);
            expect(sm.assocSkillCode, name).toBeNull();
            expect(sm.type, name).toBe("melee");
            expect(sm.lengthBase, `${name} RCH`).toBe(reach);
            // The Zone Die is the strike mode's spread.
            expect(sm.attack.spread, `${name} ZD`).toBe(zoneDie);
            expect(sm.impactBase, `${name} impact`).toMatchObject({
                numDice: 1,
                die,
                modifier: mod,
                aspect,
            });
            // No natural weapon can block — the DEF column prints "·".
            expect(sm.traits.noBlock, name).toBe(true);
            expect(sm.defense.block.disabled, name).toBe(true);
        }
    });

    it("reproduces its hit-location table's zone-number runs", () => {
        const runs = ZONE_RUNS[row.table];
        expect(runs, `unknown table ${row.table}`).toBeDefined();

        const data = sohl.body.structure as BodyStructure.Data;
        expect(data.zones.map((z) => z.probWeight)).toEqual(runs);

        const structure = new BodyStructure(data, bodyOptions(data));
        const total = runs.reduce((a, b) => a + b, 0);
        expect(structure.maxZoneNumber).toBe(total);

        // Zone numbers are contiguous, gap-free and in persisted order.
        let next = 1;
        for (const [i, zone] of structure.zones.entries()) {
            const width = runs[i];
            const expected = Array.from({ length: width }, (_, n) => next + n);
            expect(zone.zoneNumbers, zone.shortcode).toEqual(expected);
            next += width;
        }
    });

    it("hangs every part and location off a real parent, with no orphans", () => {
        const data = sohl.body.structure as BodyStructure.Data;
        const structure = new BodyStructure(data, bodyOptions(data));
        expect(structure.orphanedParts).toHaveLength(0);
        expect(structure.orphanedLocations).toHaveLength(0);
        // Every zone owns at least one part, so no zone number is a dead end.
        for (const zone of structure.getAllZones()) {
            expect(zone.parts.length, zone.shortcode).toBeGreaterThan(0);
        }
        // Every part owns at least one hit location.
        for (const part of structure.getAllParts()) {
            expect(part.locations.length, part.shortcode).toBeGreaterThan(0);
        }
    });

    it("carries the table's natural armour at every hit location", () => {
        const expected = Object.fromEntries(
            ASPECTS.map((a, i) => [a, row.armour[i]]),
        );
        for (const location of sohl.body.structure.locations) {
            expect(location.protectionBase, location.shortcode).toEqual(
                expected,
            );
        }
    });

    it("tags each part with the body roles its impairment depends on", () => {
        const parts = sohl.body.structure.parts as {
            shortcode: string;
            roles: string[];
        }[];
        // Exactly one vital part (the head), and at least one core part.
        expect(parts.filter((p) => p.roles.includes("vital"))).toHaveLength(1);
        expect(
            parts.filter((p) => p.roles.includes("core")).length,
        ).toBeGreaterThan(0);
        // Every technique's impairing role is one some part actually has.
        const roles = new Set(parts.flatMap((p) => p.roles));
        for (const tech of items(sohl, "skill", "combattechnique")) {
            for (const role of tech.system.impairedByRoles) {
                expect(roles.has(role), `${tech.name} → ${role}`).toBe(true);
            }
        }
    });
});

describe("animal roster", () => {
    it("gives every hit-location table a zone-run definition", () => {
        for (const row of ROWS) {
            expect(ZONE_RUNS[row.table], row.file).toBeDefined();
        }
    });

    it("names each content file exactly once", () => {
        const files = ROWS.map((r) => r.file);
        expect(new Set(files).size).toBe(files.length);
    });
});

/* ------------------------------------------------------------------ */
/*  Every creature, printed or derived                                */
/* ------------------------------------------------------------------ */

const CREATURES = path.resolve(__dirname, "../../assets/content/Creatures");

/**
 * Creature files that still have no anatomy, and so are exempt from the
 * invariants below. Every entry is a real gap, not a permanent exemption:
 * shrink this list, never grow it.
 *
 * `Golem`, `Goblin`, `Grukar` and `Helspawn` carry no `sohl` block at all —
 * they are family overviews rather than statted creatures.
 */
const NO_ANATOMY_YET = new Set([
    "Constructs/Aegiron_Sentinel",
    "Constructs/Golem",
    "Constructs/Rockhide_Golem",
    "Constructs/Terrakith_Sentinel",
    "Folk/Goblin",
    "Folk/Grukar",
    "Helspawn/Helspawn",
]);

/** Creatures with an anatomy but, as yet, no natural weapon of their own. */
const NO_WEAPON_YET = new Set<string>([]);

/** Every creature file under `assets/content/Creatures/`, as `Folder/Name`. */
function creatureFiles(): string[] {
    const out: string[] = [];
    for (const dir of readdirSync(CREATURES, { withFileTypes: true })) {
        if (!dir.isDirectory()) continue;
        for (const f of readdirSync(path.join(CREATURES, dir.name))) {
            if (f.endsWith(".md")) out.push(`${dir.name}/${f.slice(0, -3)}`);
        }
    }
    return out.sort();
}

/**
 * The invariants that hold for *every* creature, including the many whose body
 * plan and natural weapons are extrapolated from a description rather than
 * printed. These are the properties the combat and injury pipelines rely on: a
 * creature that fails one cannot be hit, cannot attack, or resolves a wound
 * against nothing.
 */
const ALL_CREATURES = creatureFiles().filter((f) => !NO_ANATOMY_YET.has(f));

describe.each(ALL_CREATURES)("%s (every creature)", (file) => {
    const sohl = readSohlAt(path.join(CREATURES, `${file}.md`));

    it("has a body a blow can land on", () => {
        const data = sohl.body?.structure as BodyStructure.Data | undefined;
        expect(data, "no body structure").toBeDefined();
        const structure = new BodyStructure(data!, bodyOptions(data!));

        expect(structure.maxZoneNumber).toBeGreaterThan(0);
        expect(structure.orphanedParts).toHaveLength(0);
        expect(structure.orphanedLocations).toHaveLength(0);

        // Zone numbers run 1..N with no gaps, so aimZone can resolve any of
        // them; a zone with no part would be a hole in that range.
        let next = 1;
        for (const zone of structure.getAllZones()) {
            expect(zone.zoneNumbers[0], zone.shortcode).toBe(next);
            expect(zone.parts.length, zone.shortcode).toBeGreaterThan(0);
            next += zone.zoneNumbers.length;
        }
        expect(next - 1).toBe(structure.maxZoneNumber);

        for (const part of structure.getAllParts()) {
            expect(part.locations.length, part.shortcode).toBeGreaterThan(0);
        }
    });

    it("scales injuries to its own Strength", () => {
        const str = sohl.attributes?.str;
        expect(str, "no Strength").toBeGreaterThan(0);
        expect(sohl.body.bodyScaleBase).toBeCloseTo(bodyScale(str), 2);
    });

    it("can attack with at least one combat technique", () => {
        const techniques = items(sohl, "skill", "combattechnique");
        const referenced = (sohl.items ?? []).filter((i: any) =>
            SHARED_TECHNIQUES.has(i.shortcode),
        );
        if (!NO_WEAPON_YET.has(file)) {
            expect(
                techniques.length + referenced.length,
                "no combat technique",
            ).toBeGreaterThan(0);
        }

        const roles = new Set(
            (sohl.body.structure.parts as { roles: string[] }[]).flatMap(
                (p) => p.roles,
            ),
        );
        for (const tech of techniques) {
            const sm = tech.system.strikeMode;
            expect(sm, `${tech.name} has no strike mode`).toBeDefined();
            expect(["melee", "missile"], tech.name).toContain(sm.type);
            expect(tech.system.masteryLevelBase, tech.name).toBeGreaterThan(0);
            expect(
                sm.impactBase.die,
                `${tech.name} impact die`,
            ).toBeGreaterThan(0);
            expect(ASPECTS).toContain(sm.impactBase.aspect);
            if (sm.type === "melee") {
                // Only a melee strike scatters across zone numbers.
                expect(
                    sm.attack.spread,
                    `${tech.name} zone die`,
                ).toBeGreaterThan(0);
            } else {
                // A ranged natural weapon carries a range instead.
                expect(sm.baseRangeBase, `${tech.name} range`).toBeGreaterThan(
                    0,
                );
            }
            // The technique is impaired by a role its body actually has.
            for (const role of tech.system.impairedByRoles) {
                expect(roles.has(role), `${tech.name} → ${role}`).toBe(true);
            }
        }
    });

    it("gives every hit location a unique shortcode", () => {
        const codes = sohl.body.structure.locations.map(
            (l: { shortcode: string }) => l.shortcode,
        );
        expect(new Set(codes).size).toBe(codes.length);
    });
});
