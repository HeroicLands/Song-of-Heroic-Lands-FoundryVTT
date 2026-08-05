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
 * Skillbase calculation contract — the Skill-Base `SafeExpression` pipeline
 * (`SkillLogic.computeSkillBase`, #972).
 *
 * Tests the full surface: `sb(attr.a, attr.b)` two-attribute averaging with the
 * round-up/down tiebreak rule, 3+-attribute nearest rounding, flat numeric
 * modifiers written into the expression, and the dependency contract when a
 * referenced attribute is absent (→ 0). Uses a mix of the Basic Folk compendium
 * actor (for the "all real skills at once" case) and synthetic actors (for
 * isolated formula variants).
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
            "sb(attr.prim, attr.sec)",
        ).should("eq", 11); // ceil((11+10)/2) = ceil(10.5) = 11
    });

    it("two-attribute rounding — floor when primary < secondary (10+11 → 10)", () => {
        makeActorWithSkill(
            [
                { code: "prim", score: 10 },
                { code: "sec", score: 11 },
            ],
            "sb(attr.prim, attr.sec)",
        ).should("eq", 10); // floor((10+11)/2) = floor(10.5) = 10
    });

    it("two-attribute rounding — floor when primary = secondary (10+10 → 10)", () => {
        makeActorWithSkill(
            [
                { code: "a", score: 10 },
                { code: "b", score: 10 },
            ],
            "sb(attr.a, attr.b)",
        ).should("eq", 10); // floor((10+10)/2) = 10
    });

    it("3-attribute formula — Math.round (10+10+11 → 10)", () => {
        makeActorWithSkill(
            [
                { code: "a", score: 10 },
                { code: "b", score: 10 },
                { code: "c", score: 11 },
            ],
            "sb(attr.a, attr.b, attr.c)",
        ).should("eq", 10); // round(31/3) = round(10.33) = 10
    });

    it("3-attribute formula — Math.round rounds to nearest (10+10+12 → 11)", () => {
        makeActorWithSkill(
            [
                { code: "a", score: 10 },
                { code: "b", score: 10 },
                { code: "c", score: 12 },
            ],
            "sb(attr.a, attr.b, attr.c)",
        ).should("eq", 11); // round(32/3) = round(10.67) = 11
    });

    it("flat numeric modifier — +5 adds to the computed average (10+10+5 → 15)", () => {
        makeActorWithSkill(
            [
                { code: "a", score: 10 },
                { code: "b", score: 10 },
            ],
            "sb(attr.a, attr.b) + 5",
        ).should("eq", 15); // floor(10) + 5 = 15
    });

    it("flat numeric modifier — negative modifier subtracts (10+10−3 → 7)", () => {
        makeActorWithSkill(
            [
                { code: "a", score: 10 },
                { code: "b", score: 10 },
            ],
            "sb(attr.a, attr.b) - 3",
        ).should("eq", 7); // floor(10) - 3 = 7
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
                        system: { skillBaseFormula: "sb(attr.prim, attr.sec)" },
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

    it("affiliation rank scales the skill base — affiliation.<code>.level (#1000)", () => {
        // Affiliation is the capability credential: a mystical skill's base can
        // scale with the character's rank in a church / arcane school.
        cy.createActor("being", { name: "Credential Being" }).then((actor) => {
            cy.createItemsOn(actor, [
                {
                    kind: "attribute",
                    name: "AUR",
                    system: { shortcode: "aur", scoreBase: 10 },
                },
                {
                    kind: "affiliation",
                    name: "Church of Agrik",
                    system: { shortcode: "agrik", level: 3 },
                },
            ])
                .then(() =>
                    cy.createItemOn(actor, "skill", {
                        name: "Agrik Ritual",
                        system: {
                            subType: "lore",
                            skillBaseFormula:
                                "sb(attr.aur) + affiliation.agrik.level",
                        },
                    }),
                )
                .then(() => {
                    cy.prepare(actor);
                    cy.foundry((win) => {
                        const a = win.game.actors.get(actor.id);
                        const sk = a.items.find((i) => i.type === "skill");
                        return sk.logic.skillBase;
                    }).should("eq", 13); // sb(aur=10)=10 + affiliation.agrik.level(3)
                });
        });
    });

    it("absent affiliation contributes 0 to the skill base (#1000)", () => {
        cy.createActor("being", { name: "No Credential Being" }).then(
            (actor) => {
                cy.createItemsOn(actor, [
                    {
                        kind: "attribute",
                        name: "AUR",
                        system: { shortcode: "aur", scoreBase: 10 },
                    },
                ])
                    .then(() =>
                        cy.createItemOn(actor, "skill", {
                            name: "Unaffiliated Ritual",
                            system: {
                                subType: "lore",
                                skillBaseFormula:
                                    "sb(attr.aur) + affiliation.nemesis.level",
                            },
                        }),
                    )
                    .then(() => {
                        cy.prepare(actor);
                        cy.foundry((win) => {
                            const a = win.game.actors.get(actor.id);
                            const sk = a.items.find((i) => i.type === "skill");
                            return sk.logic.skillBase;
                        }).should("eq", 10); // unknown affiliation.*.level → 0
                    });
            },
        );
    });

    it("invalid formula — Being sheet SB cell shows ✕ (#972)", () => {
        cy.createActor("being", { name: "Invalid SB Being" }).then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Broken Skill",
                system: {
                    subType: "lore",
                    skillBaseFormula: "sb(attr.str,", // syntax error
                },
            }).then((skill) => {
                cy.openSheet(actor);
                cy.switchTab("skills", "primary");
                cy.get(
                    `section.tab[data-tab="skills"] .ledger__row[data-item-id="${skill.id}"] .ledger__cell`,
                )
                    .first()
                    .find("i.fa-xmark")
                    .should("exist");
            });
        });
    });

    it("invalid formula — Skill item sheet shows the 'Invalid expression' hint (#972)", () => {
        cy.createActor("being", { name: "Invalid SB Sheet Being" }).then(
            (actor) => {
                cy.createItemOn(actor, "skill", {
                    name: "Broken Skill",
                    system: { skillBaseFormula: "bogus(attr.str)" },
                }).then((skill) => {
                    cy.prepare(actor);
                    cy.openSheet(skill);
                    cy.switchTab("properties", "sheet");
                    cy.get('section.tab[data-tab="properties"] .hint--error')
                        .should("be.visible")
                        .and("contain.text", "Invalid expression");
                });
            },
        );
    });
});
