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
 * Skillbase calculation contract — `calcSkillBase` (`SkillLogic.ts`).
 *
 * Tests the full surface of `calcSkillBase`: two-attribute averaging with the
 * round-up/down tiebreak rule, 3+-attribute Math.round, flat numeric modifiers,
 * birthsign (buff-mystery) bonuses, and the dependency contract when a referenced
 * attribute is absent. Uses a mix of the Basic Folk compendium actor (for the
 * "all real skills at once" case) and synthetic actors (for isolated formula
 * variants).
 */
describe("skillbase calculation contract", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    // ------------------------------------------------------------------ helpers

    /**
     * Create a minimal being with named attribute shortcodes and a single skill
     * whose formula references them. Returns { actor, skill } ids after prepare.
     * Items order: attributes first (so initialize() ordering is safe).
     */
    function makeActorWithSkill(attrDefs, skillFormula) {
        return cy
            .createActor("being", { name: "Formula Being" })
            .then((actor) => {
                const attrItems = attrDefs.map(({ code, score }) => ({
                    kind: "attribute",
                    name: code.toUpperCase(),
                    system: { shortcode: code, scoreBase: score },
                }));
                return cy.createItemsOn(actor, attrItems).then(() =>
                    cy
                        .createItemOn(actor, "skill", {
                            name: "Test Skill",
                            system: { skillBaseFormula: skillFormula },
                        })
                        .then((skill) => {
                            cy.prepare(actor);
                            return cy.foundry((win) => {
                                const a = win.game.actors.get(actor.id);
                                const sk = a.items.find(
                                    (i) => i.type === "skill",
                                );
                                return sk.logic.skillBase;
                            });
                        }),
                );
            });
    }

    // ------------------------------------------------------------------ tests

    it("Basic Folk — 25 two-attribute skills with all attrs=10 → every skillBase = 10", () => {
        cy.importActor().then((actor) => {
            cy.foundry((win) => {
                const a = win.game.actors.get(actor.id);
                return a.items
                    .filter((i) => i.type === "skill")
                    .map((i) => ({
                        name: i.name,
                        formula: i.system.skillBaseFormula,
                        skillBase: i.logic.skillBase,
                    }));
            }).should((rows) => {
                expect(rows, "25 skills").to.have.length(25);
                rows.forEach((r) => {
                    expect(
                        r.skillBase,
                        `${r.name} (formula "${r.formula}") skillBase`,
                    ).to.eq(10);
                });
            });
        });
    });

    it("two-attribute rounding — ceil when primary > secondary (11+10 → 11)", () => {
        makeActorWithSkill(
            [
                { code: "prim", score: 11 },
                { code: "sec", score: 10 },
            ],
            "@prim, @sec",
        ).should("eq", 11); // ceil((11+10)/2) = ceil(10.5) = 11
    });

    it("two-attribute rounding — floor when primary < secondary (10+11 → 10)", () => {
        makeActorWithSkill(
            [
                { code: "prim", score: 10 },
                { code: "sec", score: 11 },
            ],
            "@prim, @sec",
        ).should("eq", 10); // floor((10+11)/2) = floor(10.5) = 10
    });

    it("two-attribute rounding — floor when primary = secondary (10+10 → 10)", () => {
        makeActorWithSkill(
            [
                { code: "a", score: 10 },
                { code: "b", score: 10 },
            ],
            "@a, @b",
        ).should("eq", 10); // floor((10+10)/2) = 10
    });

    it("3-attribute formula — Math.round (10+10+11 → 10)", () => {
        makeActorWithSkill(
            [
                { code: "a", score: 10 },
                { code: "b", score: 10 },
                { code: "c", score: 11 },
            ],
            "@a, @b, @c",
        ).should("eq", 10); // round(31/3) = round(10.33) = 10
    });

    it("3-attribute formula — Math.round rounds to nearest (10+10+12 → 11)", () => {
        makeActorWithSkill(
            [
                { code: "a", score: 10 },
                { code: "b", score: 10 },
                { code: "c", score: 12 },
            ],
            "@a, @b, @c",
        ).should("eq", 11); // round(32/3) = round(10.67) = 11
    });

    it("flat numeric modifier — +5 adds to the computed average (10+10+5 → 15)", () => {
        makeActorWithSkill(
            [
                { code: "a", score: 10 },
                { code: "b", score: 10 },
            ],
            "@a, @b, +5",
        ).should("eq", 15); // floor(10) + 5 = 15
    });

    it("flat numeric modifier — negative modifier subtracts (10+10−3 → 7)", () => {
        makeActorWithSkill(
            [
                { code: "a", score: 10 },
                { code: "b", score: 10 },
            ],
            "@a, @b, -3",
        ).should("eq", 7); // floor(10) - 3 = 7
    });

    it("birthsign term — single buff mystery whose shortcode matches adds 1", () => {
        cy.createActor("being", { name: "Birthsign Being" }).then((actor) => {
            // Create attributes first so they initialize before the skill.
            cy.createItemsOn(actor, [
                {
                    kind: "attribute",
                    name: "A",
                    system: { shortcode: "a", scoreBase: 10 },
                },
                {
                    kind: "attribute",
                    name: "B",
                    system: { shortcode: "b", scoreBase: 10 },
                },
            ]).then(() =>
                cy
                    .createItemOn(actor, "mystery", {
                        name: "Heron Birthsign",
                        system: { shortcode: "heron", subType: "buff" },
                    })
                    .then(() =>
                        cy
                            .createItemOn(actor, "skill", {
                                name: "Born Skill",
                                system: {
                                    skillBaseFormula: "@a, @b, heron",
                                },
                            })
                            .then(() => {
                                cy.prepare(actor);
                                cy.foundry((win) => {
                                    const a = win.game.actors.get(actor.id);
                                    const sk = a.items.find(
                                        (i) => i.type === "skill",
                                    );
                                    return sk.logic.skillBase;
                                }).should("eq", 11); // floor(10) + 1 = 11
                            }),
                    ),
            );
        });
    });

    it("birthsign term — two matching buff mysteries, only the largest bonus applies", () => {
        cy.createActor("being", { name: "Multi-Sign Being" }).then((actor) => {
            // Create attributes first so they initialize before the skill.
            cy.createItemsOn(actor, [
                {
                    kind: "attribute",
                    name: "A",
                    system: { shortcode: "a", scoreBase: 10 },
                },
                {
                    kind: "attribute",
                    name: "B",
                    system: { shortcode: "b", scoreBase: 10 },
                },
            ]).then(() =>
                cy
                    .createItemsOn(actor, [
                        {
                            kind: "mystery",
                            name: "Heron Birthsign",
                            system: { shortcode: "heron", subType: "buff" },
                        },
                        {
                            kind: "mystery",
                            name: "Dragon Birthsign",
                            system: { shortcode: "dragon", subType: "buff" },
                        },
                    ])
                    .then(() =>
                        cy
                            .createItemOn(actor, "skill", {
                                name: "Dual-Sign Skill",
                                // heron:2 and dragon:3 → max(2,3) = 3
                                system: {
                                    skillBaseFormula:
                                        "@a, @b, heron:2, dragon:3",
                                },
                            })
                            .then(() => {
                                cy.prepare(actor);
                                cy.foundry((win) => {
                                    const a = win.game.actors.get(actor.id);
                                    const sk = a.items.find(
                                        (i) => i.type === "skill",
                                    );
                                    return sk.logic.skillBase;
                                }).should("eq", 13); // floor(10) + max(2,3) = 13
                            }),
                    ),
            );
        });
    });

    it("missing attribute — absent attr contributes 0, lowering skillBase", () => {
        cy.createActor("being", { name: "Dep Being" }).then((actor) => {
            cy.createItemsOn(actor, [
                {
                    kind: "attribute",
                    name: "Prim",
                    system: { shortcode: "prim", scoreBase: 10 },
                },
                {
                    kind: "attribute",
                    name: "Sec",
                    system: { shortcode: "sec", scoreBase: 10 },
                },
            ])
                .then(() =>
                    cy.createItemOn(actor, "skill", {
                        name: "Dep Skill",
                        system: { skillBaseFormula: "@prim, @sec" },
                    }),
                )
                .then(() => {
                    cy.prepare(actor);
                    cy.foundry((win) => {
                        const a = win.game.actors.get(actor.id);
                        const sk = a.items.find((i) => i.type === "skill");
                        return sk.logic.skillBase;
                    }).should("eq", 10); // both 10 → floor(10) = 10

                    // Delete the primary attribute and re-prepare.
                    cy.foundry(async (win) => {
                        const a = win.game.actors.get(actor.id);
                        const prim = a.items.find(
                            (i) => i.system.shortcode === "prim",
                        );
                        await prim.delete();
                    });
                    cy.prepare(actor);
                    cy.foundry((win) => {
                        const a = win.game.actors.get(actor.id);
                        const sk = a.items.find((i) => i.type === "skill");
                        return sk.logic.skillBase;
                    }).should("eq", 5); // prim missing → 0; floor((0+10)/2) = 5
                });
        });
    });
});
