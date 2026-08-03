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
 * Boon / Boost skill-affecting Mysteries (#975).
 *
 * A `boon` Mystery contributes a flat ±N delta to its associated skill's EML; a
 * `boost` Mystery contributes the Mastery-Boost-table delta. Both are
 * live-derived — recomputed every prepare cycle and pushed onto the real skill's
 * `masteryLevel` — so the effect applies only while the Mystery is present and
 * reverts automatically when it lapses. Driven through the live `.logic`.
 */
describe("mystery boon/boost skill contribution (#975)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    /** Read the prepared EML (effective mastery level) of a skill by shortcode. */
    function eml(actor, shortcode) {
        return cy.foundry((win) => {
            const logic = win.game.actors
                .get(actor.id)
                .logic.getItemLogic(shortcode, "skill");
            return logic.masteryLevel.effective;
        });
    }

    it("a Boon adds a flat +N delta to the associated skill's EML, and reverts when removed", () => {
        cy.createActor("being", { name: "Boon Being" }).then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Sword",
                system: {
                    subType: "combat",
                    shortcode: "sword",
                    masteryLevelBase: 50,
                },
            });
            cy.prepare(actor);
            eml(actor, "sword").should("equal", 50);

            cy.createItemOn(actor, "mystery", {
                name: "Blade Boon",
                system: {
                    subType: "boon",
                    assocSkillCode: "sword",
                    levelBase: 5,
                },
            }).then((boon) => {
                cy.prepare(actor);
                eml(actor, "sword").should("equal", 55); // 50 + 5

                // Removing the Mystery reverts the delta — no persisted state.
                cy.foundry((win) =>
                    win
                        .fromUuidSync(boon.uuid)
                        .delete()
                        .then(() => null),
                );
                cy.prepare(actor);
                eml(actor, "sword").should("equal", 50);
            });
        });
    });

    it("a Boost adds the Mastery-Boost-table delta to the associated skill's EML", () => {
        // seed 52, N=3 → 52(+7)59(+7)66(+6)72 ⇒ +20 EML.
        cy.createActor("being", { name: "Boost Being" }).then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Sword",
                system: {
                    subType: "combat",
                    shortcode: "sword",
                    masteryLevelBase: 52,
                },
            });
            cy.createItemOn(actor, "mystery", {
                name: "Blade Boost",
                system: {
                    subType: "boost",
                    assocSkillCode: "sword",
                    levelBase: 3,
                },
            });
            cy.prepare(actor);
            eml(actor, "sword").should("equal", 72); // 52 + 20
        });
    });

    it("contributes nothing when the Mystery names no resolvable skill", () => {
        cy.createActor("being", { name: "No-Skill Being" }).then((actor) => {
            cy.createItemOn(actor, "skill", {
                name: "Sword",
                system: {
                    subType: "combat",
                    shortcode: "sword",
                    masteryLevelBase: 50,
                },
            });
            cy.createItemOn(actor, "mystery", {
                name: "Orphan Boon",
                system: {
                    subType: "boon",
                    assocSkillCode: "missing",
                    levelBase: 5,
                },
            });
            cy.prepare(actor);
            eml(actor, "sword").should("equal", 50);
        });
    });
});
