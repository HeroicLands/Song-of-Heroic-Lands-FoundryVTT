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
import { describe, it, expect } from "vitest";
import { parse as parseYaml } from "yaml";
import { SafeExpression } from "@src/entity/expr/SafeExpression";
import { expressionScopes } from "@src/entity/expr/ExpressionScopeRegistry";

/**
 * The Astrokýklos birthsign modifier matrix, as authored content.
 *
 * Each of the twenty-four signs — twelve principal signs and the twelve cusps
 * between them — carries a modifier per **element**, and each element is a set
 * of skill `subType`s together with that element's own skill shortcodes. This
 * file is the executable copy of that specification: it drives the content in
 * `assets/content/Mysteries/Birthsigns/`, so a sign whose Active Effects drift
 * from the matrix — or whose `test` expression stops parsing — fails here
 * rather than silently applying nothing in play.
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
 * The modifier each sign confers, in `ELEMENT_NAMES` order.
 *
 * Listed in wheel order, so each principal sign is followed by the cusp that
 * carries the wheel into the next one. The key is the sign's file basename.
 */
const MATRIX: Record<string, Record<ElementName, number>> = {
    Arnos: { earth: 15, metal: 5, fire: -5, air: -15, spirit: -5, water: 5 },
    "Arnos-Bourax": {
        earth: 15,
        metal: 10,
        fire: 0,
        air: -10,
        spirit: -5,
        water: 5,
    },
    Bourax: { earth: 10, metal: 10, fire: 0, air: -10, spirit: -10, water: 0 },
    "Bourax-Diplos": {
        earth: 10,
        metal: 15,
        fire: 5,
        air: -5,
        spirit: -10,
        water: 0,
    },
    Diplos: { earth: 5, metal: 15, fire: 5, air: -5, spirit: -15, water: -5 },
    "Diplos-Chelyx": {
        earth: 5,
        metal: 15,
        fire: 10,
        air: 0,
        spirit: -10,
        water: -5,
    },
    Chelyx: { earth: 0, metal: 10, fire: 10, air: 0, spirit: -10, water: -10 },
    "Chelyx-Thyron": {
        earth: 0,
        metal: 10,
        fire: 15,
        air: 5,
        spirit: -5,
        water: -10,
    },
    Thyron: { earth: -5, metal: 5, fire: 15, air: 5, spirit: -5, water: -15 },
    "Thyron-Korith": {
        earth: -5,
        metal: 5,
        fire: 15,
        air: 10,
        spirit: 0,
        water: -10,
    },
    Korith: { earth: -10, metal: 0, fire: 10, air: 10, spirit: 0, water: -10 },
    "Korith-Stathmos": {
        earth: -10,
        metal: 0,
        fire: 10,
        air: 15,
        spirit: 5,
        water: -5,
    },
    Stathmos: { earth: -15, metal: -5, fire: 5, air: 15, spirit: 5, water: -5 },
    "Stathmos-Kentros": {
        earth: -10,
        metal: -5,
        fire: 5,
        air: 15,
        spirit: 10,
        water: 0,
    },
    Kentros: { earth: -10, metal: -10, fire: 0, air: 10, spirit: 10, water: 0 },
    "Kentros-Belos": {
        earth: -5,
        metal: -10,
        fire: 0,
        air: 10,
        spirit: 15,
        water: 5,
    },
    Belos: { earth: -5, metal: -15, fire: -5, air: 5, spirit: 15, water: 5 },
    "Belos-Tragyx": {
        earth: 0,
        metal: -10,
        fire: -5,
        air: 5,
        spirit: 15,
        water: 10,
    },
    Tragyx: { earth: 0, metal: -10, fire: -10, air: 0, spirit: 10, water: 10 },
    "Tragyx-Nalos": {
        earth: 5,
        metal: -5,
        fire: -10,
        air: 0,
        spirit: 10,
        water: 15,
    },
    Nalos: { earth: 5, metal: -5, fire: -15, air: -5, spirit: 5, water: 15 },
    "Nalos-Opsar": {
        earth: 10,
        metal: 0,
        fire: -10,
        air: -5,
        spirit: 5,
        water: 15,
    },
    Opsar: { earth: 10, metal: 0, fire: -10, air: -10, spirit: 0, water: 10 },
    "Opsar-Arnos": {
        earth: 15,
        metal: 5,
        fire: -5,
        air: -10,
        spirit: 0,
        water: 10,
    },
};

const BIRTHSIGN_DIR = path.resolve(
    __dirname,
    "../../assets/content/Mysteries/Birthsigns",
);

/** One Active Effect as authored in a birthsign's frontmatter. */
interface AuthoredEffect {
    name: string;
    _id: string;
    _key: string;
    system: { scope: string; test: string };
    changes: { key: string; type: string; value: string }[];
}

/** A birthsign content file's parsed frontmatter. */
interface Birthsign {
    id: string;
    shortcode: string;
    effects: AuthoredEffect[];
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
 * The table is the reader's only sight of the numbers — the Active Effects that
 * carry them are not rendered anywhere a player reads — so it is authored, and
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

/**
 * Build the evaluable form of an effect's `test`, under the scope the effect is
 * actually evaluated in.
 * @param test - The authored expression source.
 * @returns The constructed expression.
 */
function compile(test: string): SafeExpression {
    return new SafeExpression(
        { source: test },
        {
            parent: { id: "t", name: "t" } as never,
            scope: expressionScopes.require("effect.itemTest"),
        },
    );
}

/**
 * Evaluate an effect's `test` against a candidate skill.
 * @param expr - The compiled expression.
 * @param subType - The candidate skill's subtype.
 * @param shortcode - The candidate skill's shortcode.
 * @returns Whether the effect targets that skill.
 */
function matches(
    expr: SafeExpression,
    subType: string,
    shortcode: string,
): boolean {
    return !!expr.evaluate({ itemLogic: { data: { subType, shortcode } } });
}

describe("birthsign Active Effects", () => {
    for (const [sign, row] of Object.entries(MATRIX)) {
        describe(sign, () => {
            const data = readBirthsign(sign);
            const expected = ELEMENT_NAMES.filter((el) => row[el] !== 0);

            it("carries one effect per non-zero element", () => {
                expect(data.effects).toHaveLength(expected.length);
            });

            it("every test expression parses under the effect.itemTest scope", () => {
                for (const effect of data.effects) {
                    expect(
                        SafeExpression.validateSource(
                            effect.system.test,
                            expressionScopes.require("effect.itemTest"),
                        ),
                        `${effect.name}: ${effect.system.test}`,
                    ).toBeUndefined();
                }
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

            it("keys every effect to the owning item", () => {
                for (const effect of data.effects) {
                    expect(effect._key).toBe(
                        `!items.effects!${data.id}.${effect._id}`,
                    );
                    expect(effect.system.scope).toBe("skill");
                }
            });

            for (const [index, element] of expected.entries()) {
                describe(`${element} (${row[element] > 0 ? "+" : ""}${row[element]} EML)`, () => {
                    // Effects are authored in element order, skipping the
                    // columns whose modifier is zero.
                    const effect = data.effects[index];

                    it("adds the matrix modifier to the mastery level", () => {
                        expect(effect.changes).toHaveLength(1);
                        expect(effect.changes[0].key).toBe(
                            "mod:logic.masteryLevel",
                        );
                        expect(effect.changes[0].type).toBe("add");
                        expect(Number(effect.changes[0].value)).toBe(
                            row[element],
                        );
                    });

                    it("targets every subtype and shortcode of the element", () => {
                        const expr = compile(effect.system.test);
                        for (const subType of ELEMENTS[element].subTypes) {
                            expect(
                                matches(expr, subType, "unrelated"),
                                `subType ${subType}`,
                            ).toBe(true);
                        }
                        for (const shortcode of ELEMENTS[element].shortcodes) {
                            expect(
                                matches(expr, "unrelated", shortcode),
                                `shortcode ${shortcode}`,
                            ).toBe(true);
                        }
                    });

                    it("targets nothing belonging to another element", () => {
                        const expr = compile(effect.system.test);
                        for (const other of ELEMENT_NAMES) {
                            if (other === element) continue;
                            for (const subType of ELEMENTS[other].subTypes) {
                                expect(
                                    matches(expr, subType, "unrelated"),
                                    `subType ${subType}`,
                                ).toBe(false);
                            }
                            for (const code of ELEMENTS[other].shortcodes) {
                                expect(
                                    matches(expr, "unrelated", code),
                                    `shortcode ${code}`,
                                ).toBe(false);
                            }
                        }
                    });
                });
            }
        });
    }
});
