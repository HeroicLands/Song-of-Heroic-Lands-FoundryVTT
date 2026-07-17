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

/**
 * Derived Melee/Missile Strike Mode sections (#293). The Combat tab aggregates
 * strike modes from combat-technique skills (always available) and held weapons,
 * grouped by source, with clickable Atk/Blk/CX.
 */
describe("derived strike mode sections", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());
    Cypress.on("uncaught:exception", () => false);

    function meleeWeapon(name = "Sword") {
        return {
            name,
            system: {
                strikeModes: {
                    strike: {
                        type: "melee",
                        name: "Strike",
                        assocSkillCode: "melee",
                        minParts: 1,
                        attack: { spread: 0, modifier: 0 },
                        impactBase: {
                            numDice: 1,
                            die: 6,
                            modifier: 0,
                            aspect: "edged",
                        },
                        traits: {},
                        lengthBase: 3,
                        defense: {
                            block: { modifier: 0 },
                            counterstrike: { modifier: 0 },
                        },
                    },
                },
            },
        };
    }

    function meleeSection(win, actorId) {
        // Each held melee weapon (and combat-technique) renders as its own
        // `div.list` headed "Melee Strike Modes" — there is no enclosing
        // fieldset. Return the whole Combat section; these tests add only melee
        // sources, so the `h3.list__name.name` weapon-name queries below stay
        // melee-specific.
        return win.game.actors
            .get(actorId)
            .sheet.element.querySelector('section[data-tab="combat"]');
    }

    it("aggregates a combat-technique skill and a held weapon, both rollable", () => {
        cy.importActor().then((actor) => {
            // Combat-technique skill with a melee strike mode (ML drives Atk).
            cy.createItemOn(actor, "skill", {
                name: "Boxing",
                system: {
                    subType: "combattechnique",
                    masteryLevelBase: 40,
                    strikeMode: {
                        type: "melee",
                        name: "Jab",
                        lengthBase: 1,
                        attack: { modifier: 5 },
                        impactBase: {
                            numDice: 1,
                            die: 6,
                            modifier: 0,
                            aspect: "blunt",
                        },
                        defense: {
                            block: { modifier: 3 },
                            counterstrike: { modifier: -2 },
                        },
                    },
                },
            });
            // A weapon skill for the held weapon's assocSkillCode, and the weapon.
            // Basic Folk already owns `melee`; raise its ML instead of adding a
            // colliding duplicate (the `(type, shortcode)` key is unique).
            cy.ensureSkillML(actor, "melee", 50);
            cy.createItemOn(actor, "weapongear", meleeWeapon("Sword")).then(
                (w) => {
                    cy.runAction(w, "holdItem");
                    cy.prepare(actor);
                    cy.openSheet(actor);
                    cy.switchTab("combat", "primary");
                    cy.wait(500);
                    cy.foundry((win) => {
                        const fs = meleeSection(win, actor.id);
                        const sources = [
                            ...fs.querySelectorAll("h3.list__name.name"),
                        ].map((h) => h.textContent.trim());
                        const atkCells = fs.querySelectorAll(
                            '[data-action="rollStrikeModeTest"][data-test-kind="attack"]',
                        ).length;
                        const blkCells = fs.querySelectorAll(
                            '[data-action="rollStrikeModeTest"][data-test-kind="block"]',
                        ).length;
                        // The technique's Atk cell value.
                        const boxingGroup = [
                            ...fs.querySelectorAll("div.list"),
                        ].find(
                            (g) =>
                                g
                                    .querySelector("h3.list__name.name")
                                    ?.textContent?.trim() === "Boxing",
                        );
                        const atk = boxingGroup
                            ?.querySelector('[data-test-kind="attack"]')
                            ?.textContent?.trim();
                        return { sources, atkCells, blkCells, boxingAtk: atk };
                    }).should((r) => {
                        expect(
                            r.sources,
                            "grouped by source",
                        ).to.include.members(["Boxing", "Sword"]);
                        expect(
                            r.atkCells,
                            "attack cells rollable",
                        ).to.be.at.least(2);
                        expect(
                            r.blkCells,
                            "block cells rollable",
                        ).to.be.at.least(1);
                        expect(r.boxingAtk, "technique Atk = ML+mod").to.equal(
                            "45",
                        );
                    });
                },
            );
        });
    });

    it("drops a weapon's strike modes when it is no longer held", () => {
        cy.importActor().then((actor) => {
            // Basic Folk already owns `melee`; raise its ML instead of adding a
            // colliding duplicate (the `(type, shortcode)` key is unique).
            cy.ensureSkillML(actor, "melee", 50);
            cy.createItemOn(actor, "weapongear", meleeWeapon("Mace")).then(
                (w) => {
                    cy.runAction(w, "holdItem");
                    cy.prepare(actor);
                    cy.openSheet(actor);
                    cy.switchTab("combat", "primary");
                    cy.wait(400);
                    cy.foundry((win) => {
                        const fs = meleeSection(win, actor.id);
                        const has =
                            fs ?
                                [
                                    ...fs.querySelectorAll(
                                        "h3.list__name.name",
                                    ),
                                ].some((h) => h.textContent.trim() === "Mace")
                            :   false;
                        return { has };
                    }).should(
                        (r) => expect(r.has, "held weapon shown").to.be.true,
                    );
                    // Release it → its strike modes disappear.
                    cy.runAction(w, "releaseItem");
                    cy.prepare(actor);
                    cy.foundry((win) =>
                        win.game.actors.get(actor.id).sheet.render(true),
                    );
                    cy.wait(500);
                    cy.foundry((win) => {
                        const fs = meleeSection(win, actor.id);
                        const has =
                            fs ?
                                [
                                    ...fs.querySelectorAll(
                                        "h3.list__name.name",
                                    ),
                                ].some((h) => h.textContent.trim() === "Mace")
                            :   false;
                        return { has };
                    }).should(
                        (r) =>
                            expect(r.has, "unheld weapon removed").to.be.false,
                    );
                },
            );
        });
    });
});
