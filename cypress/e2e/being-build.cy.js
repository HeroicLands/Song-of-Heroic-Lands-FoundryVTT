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
 * Manual character-build chain.
 *
 * Verifies that each category of embedded item (attributes, traits,
 * affiliations, skills) produces the expected logic-layer values when added
 * to a freshly created being, without importing any pre-built compendium
 * character. Each test is independent (afterEach cleanup) so failures are
 * isolated.
 *
 * A being's body no longer lives on an embedded item — it is inline actor data
 * at `system.body` and surfaces on the being's logic as `actor.logic.body`. A
 * freshly created bare being has an empty body (incorporeal, no movement); the
 * "Basic Folk" compendium being carries a populated inline body, so the body
 * test imports it and reads `actor.logic.body` / `actor.logic.feetPerRound`
 * directly rather than embedding an item.
 */
describe("being build — manual character-build chain", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    // ------------------------------------------------------------------ tests

    it("empty being — BeingLogic constructs without throwing", () => {
        cy.createActor("being", { name: "Empty Being" }).then((actor) => {
            cy.foundry((win) => {
                const a = win.game.actors.get(actor.id);
                return {
                    hasLogic: !!a.logic,
                    items: a.items.size,
                };
            }).should((r) => {
                expect(r.hasLogic, "being .logic exists").to.be.true;
                expect(r.items, "no embedded items").to.eq(0);
            });
        });
    });

    it("14 attributes — score.effective equals scoreBase; masteryLevel.effective = score × 5", () => {
        cy.createActor("being", { name: "Attr Being" }).then((actor) => {
            const attrs = Array.from({ length: 14 }, (_, i) => ({
                kind: "attribute",
                name: `Attr${i + 1}`,
                system: { scoreBase: 10 + i },
            }));
            cy.createItemsOn(actor, attrs).then(() => {
                cy.prepare(actor);
                cy.foundry((win) => {
                    const a = win.game.actors.get(actor.id);
                    return a.items
                        .filter((i) => i.type === "attribute")
                        .map((i) => ({
                            base: i.system.scoreBase,
                            score: i.logic.score.effective,
                            ml: i.logic.masteryLevel.effective,
                        }));
                }).should((rows) => {
                    expect(rows, "14 attributes created").to.have.length(14);
                    rows.forEach((r) => {
                        expect(
                            r.score,
                            `score.effective (${r.score}) == scoreBase (${r.base})`,
                        ).to.eq(r.base);
                        expect(
                            r.ml,
                            `masteryLevel.effective (${r.ml}) == score × 5 (${r.base * 5})`,
                        ).to.eq(r.base * 5);
                    });
                });
            });
        });
    });

    it("bare being — empty body is incorporeal with no movement", () => {
        cy.createActor("being", { name: "No Body Being" }).then((actor) => {
            cy.prepare(actor);
            cy.foundry((win) => {
                const a = win.game.actors.get(actor.id);
                return {
                    hasBody: !!a.logic.body,
                    parts: a.logic.body.structure.parts.length,
                    isIncorporeal: a.logic.body.isIncorporeal,
                    feetPerRound: a.logic.feetPerRound.effective,
                };
            }).should((r) => {
                expect(r.hasBody, "being always has a body").to.be.true;
                expect(r.parts, "empty structure (no anatomy)").to.eq(0);
                expect(r.isIncorporeal, "incorporeal").to.be.true;
                expect(r.feetPerRound, "no movement").to.eq(0);
            });
        });
    });

    it("Basic Folk body — structure present, move and reach are numeric", () => {
        // Basic Folk carries its body inline at `system.body` (6 parts) and
        // terrestrial movement; the being's logic surfaces both as
        // `actor.logic.body` and `actor.logic.feetPerRound`.
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.foundry((win) => {
                const a = win.game.actors.get(actor.id);
                return {
                    reach: a.logic.body.reach.effective,
                    hasBod: !!a.logic.body.structure,
                    parts: a.logic.body.structure.parts.length,
                    // Move lives on the being's active movement profile.
                    terrestrial: a.logic.feetPerRound.effective,
                };
            }).should((r) => {
                expect(r.reach, "reach is numeric").to.be.a("number");
                expect(r.hasBod, "structure present").to.be.true;
                expect(r.parts, "body has anatomy").to.be.greaterThan(0);
                expect(r.terrestrial, "terrestrial move is numeric").to.be.a(
                    "number",
                );
            });
        });
    });

    it("measured trait — score.effective equals the stored value", () => {
        cy.createActor("being", { name: "Measured Trait Being" }).then(
            (actor) => {
                cy.createItemOn(actor, "trait", {
                    name: "Measured Trait",
                    system: { subType: "measured", score: { value: 7 } },
                }).then(() => {
                    cy.prepare(actor);
                    cy.foundry((win) => {
                        const a = win.game.actors.get(actor.id);
                        const t = a.items.find((i) => i.type === "trait");
                        return {
                            subType: t.system.subType,
                            score: t.logic.score.effective,
                        };
                    }).should((r) => {
                        expect(r.subType, "measured subtype persisted").to.eq(
                            "measured",
                        );
                        expect(r.score, "measured score.effective = 7").to.eq(7);
                    });
                });
            },
        );
    });

    it("descriptive trait — score.effective is 0 (disabled)", () => {
        cy.createActor("being", { name: "Descriptive Trait Being" }).then(
            (actor) => {
                cy.createItemOn(actor, "trait", {
                    name: "Descriptive Trait",
                    system: { subType: "physique" },
                }).then(() => {
                    cy.prepare(actor);
                    cy.foundry((win) => {
                        const a = win.game.actors.get(actor.id);
                        const t = a.items.find((i) => i.type === "trait");
                        return t.logic.score.effective;
                    }).should("eq", 0);
                });
            },
        );
    });

    it("affiliation — name field persists after inline create (no compendium lookup)", () => {
        cy.createActor("being", { name: "Affil Being" }).then((actor) => {
            cy.createItemOn(actor, "affiliation", {
                name: "Guild of Smiths",
            }).then(() => {
                cy.foundry((win) => {
                    const a = win.game.actors.get(actor.id);
                    const af = a.items.find((i) => i.type === "affiliation");
                    return { name: af?.name };
                }).should((r) => {
                    expect(r.name).to.eq("Guild of Smiths");
                });
            });
        });
    });

    it("skill — masteryLevel.effective equals masteryLevelBase when no skillbase modifiers are attached", () => {
        cy.createActor("being", { name: "Skill Being" }).then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Sword",
                system: { masteryLevelBase: 45 },
            }).then(() => {
                cy.prepare(actor);
                cy.foundry((win) => {
                    const a = win.game.actors.get(actor.id);
                    const sk = a.items.find((i) => i.type === "skill");
                    return sk.logic.masteryLevel.effective;
                }).should("eq", 45);
            });
        });
    });

    // ------------------------------------------------------------------ RED

    it.skip("body-template import — orchestration brings body parts, attributes, and traits from a body template", () => {
        // RED — blocked by #181: body-template import/apply orchestration not
        // implemented; there is no flow to populate a being's inline body
        // (`system.body`), attributes, or traits from a template source
        // document.
    });

    it.skip("initSkillMult — opening mastery level is masteryLevelBase × multiplier at char init", () => {
        // RED — blocked by #182: initSkillMult field exists on SkillData but
        // has no consumer; masteryLevelBase is not scaled by a multiplier
        // during character initialization.
    });
});
