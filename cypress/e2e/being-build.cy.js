/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { BASIC_FOLK } from "../support/factories/basicFolk.js";

/**
 * Manual character-build chain.
 *
 * Verifies that each category of embedded item (attributes, lineage, traits,
 * affiliations, skills) produces the expected logic-layer values when added
 * to a freshly created being, without importing any pre-built compendium
 * character. Each test is independent (afterEach cleanup) so failures are
 * isolated.
 *
 * The "Human Folk" lineage data is loaded once from the Basic Folk compendium
 * actor (where it lives as an embedded item) so we can embed it on our own
 * test being without touching the pre-built actor's world state.
 */
describe("being build — manual character-build chain", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    // ------------------------------------------------------------------ helpers

    /**
     * Fetch the Human Folk lineage toObject() from inside the Basic Folk
     * compendium actor. Returns a Cypress-queued plain object (spec realm)
     * that must be toRealm()'d before handing to Foundry APIs.
     */
    function getHumanFolkLineageData() {
        return cy.foundry(async (win) => {
            const pack = win.game.packs.get("sohl.actors");
            const bf = await pack.getDocument(BASIC_FOLK.id);
            const ln = bf.items.find((i) => i.type === "lineage");
            return ln.toObject();
        });
    }

    // ------------------------------------------------------------------ tests

    it("empty being — no lineage — BeingLogic constructs without throwing", () => {
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

    it("without lineage — the being has no lineage pointer (no movement)", () => {
        cy.createActor("being", { name: "No Lineage Being" }).then((actor) => {
            cy.foundry((win) => {
                const a = win.game.actors.get(actor.id);
                return a.logic.lineage ?? null;
            }).should("eq", null);
        });
    });

    it("Human Folk lineage — bodyStructure present, move and reach are numeric", () => {
        cy.createActor("being", { name: "Lineage Being" }).then((actor) => {
            getHumanFolkLineageData().then((lineageData) => {
                cy.foundry(async (win) => {
                    const a = win.game.actors.get(actor.id);
                    await a.createEmbeddedDocuments("Item", [
                        win.JSON.parse(win.JSON.stringify(lineageData)),
                    ]);
                    a.prepareData();
                    const lineage = a.items.find((i) => i.type === "lineage");
                    return {
                        reach: lineage.logic.reach.effective,
                        hasBod: !!lineage.logic.bodyStructure,
                        // Move now lives on the lineage's active movement profile.
                        terrestrial: a.logic.lineage.feetPerRound.effective,
                    };
                }).should((r) => {
                    expect(r.reach, "reach is numeric").to.be.a("number");
                    expect(r.hasBod, "bodyStructure present").to.be.true;
                    expect(
                        r.terrestrial,
                        "terrestrial move is numeric",
                    ).to.be.a("number");
                });
            });
        });
    });

    it("numeric trait — score.effective equals the stored value", () => {
        cy.createActor("being", { name: "Numeric Trait Being" }).then(
            (actor) => {
                cy.createItemOn(actor, "trait", {
                    name: "Numeric Trait",
                    system: { isNumeric: true, score: { value: 7 } },
                }).then(() => {
                    cy.prepare(actor);
                    cy.foundry((win) => {
                        const a = win.game.actors.get(actor.id);
                        const t = a.items.find((i) => i.type === "trait");
                        return {
                            isNumeric: t.system.isNumeric,
                            score: t.logic.score.effective,
                        };
                    }).should((r) => {
                        expect(r.isNumeric, "isNumeric persisted").to.be.true;
                        expect(r.score, "numeric score.effective = 7").to.eq(7);
                    });
                });
            },
        );
    });

    it("non-numeric trait — score.effective is 0 (disabled)", () => {
        cy.createActor("being", { name: "NonNumeric Trait Being" }).then(
            (actor) => {
                cy.createItemOn(actor, "trait", {
                    name: "Non-Numeric Trait",
                    system: { isNumeric: false },
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

    it.skip("lineage import — orchestration brings body parts, attributes, and traits from lineage source", () => {
        // RED — blocked by #181: lineage import/apply orchestration not
        // implemented; today the lineage is a bare dragged item with no flow
        // to populate derived body parts, attributes, or traits from the
        // lineage source document.
    });

    it.skip("initSkillMult — opening mastery level is masteryLevelBase × multiplier at char init", () => {
        // RED — blocked by #182: initSkillMult field exists on SkillData but
        // has no consumer; masteryLevelBase is not scaled by a multiplier
        // during character initialization.
    });
});
