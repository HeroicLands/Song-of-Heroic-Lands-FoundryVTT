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

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { parse as parseYaml } from "yaml";
import {
    mergeSkillAptitudes,
    skillAptitudeFor,
    subTypeAptitudeKey,
} from "@src/document/item/logic/skill-aptitudes";

/**
 * The Astrokýklos birthsign matrix, as authored content.
 *
 * Only the **twelve principal signs** are authored. A cusp is not a thirteenth
 * kind of thing but a character born under two neighbouring signs at once: the
 * aptitude merge takes the greater value per selector, so the pair yields
 * exactly the cusp values the wheel has always had. Nothing here — and nothing
 * in `assets/content/` — states a cusp row, because none is authored.
 *
 * Each sign carries a modifier per **element**, and each element is a set of
 * skill `subType`s together with that element's own skill shortcodes. This file
 * is the executable copy of that specification: it drives the content in
 * `assets/content/Mysteries/Birthsigns/`, so a sign whose authored aptitudes
 * drift from the matrix fails here rather than silently applying the wrong
 * modifier in play.
 */

/** The six elements, each defined by its skill subtypes and skill shortcodes. */
const ELEMENTS = {
    earth: { subTypes: ["nature"], shortcodes: ["earth", "physera"] },
    metal: { subTypes: ["script", "craft"], shortcodes: ["metal", "sideros"] },
    fire: {
        subTypes: ["combattechnique", "combat"],
        shortcodes: ["fire", "pyrethos"],
    },
    air: { subTypes: ["physical"], shortcodes: ["air", "zepharis"] },
    spirit: {
        subTypes: ["mystical", "lore"],
        shortcodes: ["spirit", "pneumenos"],
    },
    water: {
        subTypes: ["language", "social"],
        shortcodes: ["water", "hydalis"],
    },
} as const;

type ElementName = keyof typeof ELEMENTS;

const ELEMENT_NAMES = Object.keys(ELEMENTS) as ElementName[];

/**
 * The modifier each principal sign confers, in `ELEMENT_NAMES` order, listed in
 * wheel order. The key is the sign's file basename.
 */
const MATRIX: Record<string, Record<ElementName, number>> = {
    Arnos: { earth: 15, metal: 5, fire: -5, air: -15, spirit: -5, water: 5 },
    Bourax: { earth: 10, metal: 10, fire: 0, air: -10, spirit: -10, water: 0 },
    Diplos: { earth: 5, metal: 15, fire: 5, air: -5, spirit: -15, water: -5 },
    Chelyx: { earth: 0, metal: 10, fire: 10, air: 0, spirit: -10, water: -10 },
    Thyron: { earth: -5, metal: 5, fire: 15, air: 5, spirit: -5, water: -15 },
    Korith: { earth: -10, metal: 0, fire: 10, air: 10, spirit: 0, water: -10 },
    Stathmos: { earth: -15, metal: -5, fire: 5, air: 15, spirit: 5, water: -5 },
    Kentros: { earth: -10, metal: -10, fire: 0, air: 10, spirit: 10, water: 0 },
    Belos: { earth: -5, metal: -15, fire: -5, air: 5, spirit: 15, water: 5 },
    Tragyx: { earth: 0, metal: -10, fire: -10, air: 0, spirit: 10, water: 10 },
    Nalos: { earth: 5, metal: -5, fire: -15, air: -5, spirit: 5, water: 15 },
    Opsar: { earth: 10, metal: 0, fire: -10, air: -10, spirit: 0, water: 10 },
};

/** The wheel, in order; the last sign neighbours the first. */
const WHEEL = Object.keys(MATRIX);

/** Every adjacent pair on the wheel — the twelve births that fall on a cusp. */
const ADJACENT_PAIRS = WHEEL.map(
    (sign, i) => [sign, WHEEL[(i + 1) % WHEEL.length]] as const,
);

const BIRTHSIGN_DIR = path.resolve(
    __dirname,
    "../../assets/content/Mysteries/Birthsigns",
);

/** A birthsign content file's parsed frontmatter. */
interface Birthsign {
    id: string;
    shortcode: string;
    effects?: unknown[];
    sohl: { skillAptitudes?: Record<string, number> };
}

/**
 * Read and parse one birthsign's YAML frontmatter.
 * @param sign - The sign name (and file basename).
 * @returns The parsed frontmatter.
 */
function readBirthsign(sign: string): Birthsign {
    const raw = readFileSync(path.join(BIRTHSIGN_DIR, `${sign}.md`), "utf8");
    const match = /^---\n([\s\S]*?)\n---/.exec(raw);
    if (!match) throw new Error(`${sign}.md has no YAML frontmatter`);
    return parseYaml(match[1]) as Birthsign;
}

/**
 * Read one birthsign's prose body — everything after the frontmatter.
 * @param sign - The sign name (and file basename).
 * @returns The Markdown body.
 */
function readBody(sign: string): string {
    const raw = readFileSync(path.join(BIRTHSIGN_DIR, `${sign}.md`), "utf8");
    const body = raw.replace(/^---\n[\s\S]*?\n---\n/, "");
    if (body === raw) throw new Error(`${sign}.md has no YAML frontmatter`);
    return body;
}

/**
 * Parse the modifier a note's authored table states for each element.
 *
 * The table is the reader's only sight of the numbers — the aptitude map that
 * carries them is not rendered anywhere a player reads — so it is authored, and
 * this parse is what keeps it honest against {@link MATRIX}.
 * @param body - The note's Markdown body.
 * @returns The stated modifier per element, in table order.
 */
function parseModifierTable(body: string): [string, number][] {
    // The header row cannot match: its last cell is not a modifier.
    const rows = body.matchAll(
        /^\|\s*([A-Za-z]+)\s*\|[^|]*\|\s*([+−-]?\d+|—)\s*\|$/gm,
    );
    return [...rows].map(([, element, modifier]) => [
        element.toLowerCase(),
        // An em dash is how the table spells "this element is untouched".
        modifier === "—" ? 0 : Number(modifier.replace("−", "-")),
    ]);
}

/** Expand a matrix row into the selector → modifier map it should be authored as. */
function expandRow(row: Record<ElementName, number>): Record<string, number> {
    const out: Record<string, number> = {};
    for (const element of ELEMENT_NAMES) {
        for (const subType of ELEMENTS[element].subTypes) {
            out[subTypeAptitudeKey(subType)] = row[element];
        }
        for (const shortcode of ELEMENTS[element].shortcodes) {
            out[shortcode] = row[element];
        }
    }
    return out;
}

/**
 * Read a merged accumulator back as one modifier per element, asserting that
 * every selector belonging to an element agrees.
 * @param merged - The merged aptitude map.
 * @returns The modifier per element.
 */
function perElement(merged: Map<string, number>): Record<ElementName, number> {
    const out = {} as Record<ElementName, number>;
    for (const element of ELEMENT_NAMES) {
        const selectors = [
            ...ELEMENTS[element].subTypes.map(subTypeAptitudeKey),
            ...ELEMENTS[element].shortcodes,
        ];
        const values = selectors.map((s) => merged.get(s));
        expect(new Set(values).size, `${element} selectors disagree`).toBe(1);
        out[element] = values[0] as number;
    }
    return out;
}

/** Merge the authored aptitudes of any number of signs, as an actor would. */
function born(...signs: string[]): Map<string, number> {
    const acc = new Map<string, number>();
    for (const sign of signs) {
        mergeSkillAptitudes(acc, readBirthsign(sign).sohl.skillAptitudes);
    }
    return acc;
}

const sum = (row: Record<ElementName, number>): number =>
    ELEMENT_NAMES.reduce((total, el) => total + row[el], 0);

describe("the Astrokýklos is twelve signs, and only twelve", () => {
    it("authors a content file for every principal sign and nothing else", () => {
        const files = readdirSync(BIRTHSIGN_DIR)
            .filter((f) => f.endsWith(".md"))
            .map((f) => f.replace(/\.md$/, ""))
            .sort();
        expect(files).toEqual([...WHEEL].sort());
    });

    it("authors no cusp sign — a cusp is a birth under two signs, not a file", () => {
        const files = readdirSync(BIRTHSIGN_DIR);
        expect(files.filter((f) => f.includes("-"))).toEqual([]);
    });
});

describe("each principal sign's authored aptitudes", () => {
    for (const [sign, row] of Object.entries(MATRIX)) {
        describe(sign, () => {
            const data = readBirthsign(sign);

            it("carries the matrix row, expanded to every selector its elements claim", () => {
                expect(data.sohl.skillAptitudes).toEqual(expandRow(row));
            });

            it("carries no Active Effects — the aptitude map replaced them", () => {
                expect(data.effects ?? []).toEqual([]);
            });

            it("states every element, in element order, in its table", () => {
                const stated = parseModifierTable(readBody(sign));
                expect(stated.map(([element]) => element)).toEqual(
                    ELEMENT_NAMES,
                );
            });

            it("states the matrix modifier for every element", () => {
                const stated = Object.fromEntries(
                    parseModifierTable(readBody(sign)),
                );
                for (const element of ELEMENT_NAMES) {
                    expect(stated[element], element).toBe(row[element]);
                }
            });

            it("favours exactly as much as it hinders", () => {
                expect(sum(row)).toBe(0);
            });

            it("peaks and troughs at ±15 or ±10", () => {
                const values = ELEMENT_NAMES.map((el) => row[el]);
                expect([15, 10]).toContain(Math.max(...values));
                expect([-15, -10]).toContain(Math.min(...values));
            });

            it("resolves each element's subtypes and shortcodes to its modifier", () => {
                const aptitudes = born(sign);
                for (const element of ELEMENT_NAMES) {
                    for (const subType of ELEMENTS[element].subTypes) {
                        expect(
                            skillAptitudeFor(aptitudes, "unrelated", subType),
                            `subType ${subType}`,
                        ).toBe(row[element]);
                    }
                    for (const shortcode of ELEMENTS[element].shortcodes) {
                        expect(
                            skillAptitudeFor(aptitudes, shortcode, "unrelated"),
                            `shortcode ${shortcode}`,
                        ).toBe(row[element]);
                    }
                }
            });

            it("claims no skill outside its six elements", () => {
                expect(
                    skillAptitudeFor(born(sign), "unrelated", "unrelated"),
                ).toBeUndefined();
            });
        });
    }
});

describe("a birth under two neighbouring signs is a cusp", () => {
    for (const [first, second] of ADJACENT_PAIRS) {
        describe(`${first}–${second}`, () => {
            const merged = () => perElement(born(first, second));

            it("takes the better of the two in every element, never the sum", () => {
                const row = merged();
                for (const element of ELEMENT_NAMES) {
                    expect(row[element], element).toBe(
                        Math.max(
                            MATRIX[first][element],
                            MATRIX[second][element],
                        ),
                    );
                }
            });

            it("is worth +15 across the wheel — the cusp's standing surplus", () => {
                expect(sum(merged())).toBe(15);
            });

            it("peaks at +15 and troughs no lower than −10", () => {
                const values = ELEMENT_NAMES.map((el) => merged()[el]);
                expect(Math.max(...values)).toBe(15);
                expect(Math.min(...values)).toBe(-10);
            });

            it("orders the signs indifferently", () => {
                expect(perElement(born(first, second))).toEqual(
                    perElement(born(second, first)),
                );
            });
        });
    }
});

describe("a birth under more than two signs", () => {
    it("keeps climbing — each further sign can only raise an element", () => {
        const two = perElement(born("Arnos", "Bourax"));
        const three = perElement(born("Arnos", "Bourax", "Diplos"));
        for (const element of ELEMENT_NAMES) {
            expect(three[element]).toBeGreaterThanOrEqual(two[element]);
        }
        expect(sum(three)).toBeGreaterThan(sum(two));
    });

    it("reaches +15 everywhere under the whole wheel", () => {
        const all = perElement(born(...WHEEL));
        for (const element of ELEMENT_NAMES) {
            expect(all[element], element).toBe(15);
        }
    });

    it("is idempotent — the same sign twice is the same sign once", () => {
        expect(perElement(born("Arnos", "Arnos"))).toEqual(
            perElement(born("Arnos")),
        );
    });
});
