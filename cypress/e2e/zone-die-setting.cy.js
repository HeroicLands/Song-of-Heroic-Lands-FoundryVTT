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
 * "Use Zone Die" world setting (#327, HMK compatibility).
 *
 * The setting toggles how a melee strike mode's `spread.effective` is presented
 * on the Combat tab — the same value shown as a Spread radius (`{n}`, column
 * "Spr") or a Zone Die (`d{n}`, column "ZD").
 */
describe("Use Zone Die setting", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());
    Cypress.on("uncaught:exception", () => false);

    /** A melee weapon whose single strike mode has a spread of 6. */
    function spearWeapon() {
        return {
            name: "Spear",
            system: {
                strikeModes: {
                    strike: {
                        type: "melee",
                        name: "Thrust",
                        assocSkillCode: "melee",
                        minParts: 1,
                        attack: { spread: 6, modifier: 0 },
                        impactBase: {
                            numDice: 1,
                            die: 6,
                            modifier: 0,
                            aspect: "piercing",
                        },
                        traits: {},
                        lengthBase: 6,
                        defense: {
                            block: { modifier: 0 },
                            counterstrike: { modifier: 0 },
                        },
                    },
                },
            },
        };
    }

    /** Import Basic Folk with a held spear, open its Combat tab. Yields the actor. */
    function beingWithSpear() {
        return cy.importActor().then((actor) => {
            // Basic Folk already owns `melee`; raise its ML instead of adding a
            // colliding duplicate (the `(type, shortcode)` key is unique).
            cy.ensureSkillML(actor, "melee", 50);
            cy.createItemOn(actor, "weapongear", spearWeapon()).then(
                (weapon) => {
                    cy.runAction(weapon, "holdItem");
                    cy.prepare(actor);
                    cy.openSheet(actor);
                    cy.switchTab("combat", "primary");
                },
            );
            return cy.wrap(actor);
        });
    }

    /** The spread header text and the strike-mode row's spread cell text. */
    function spreadCells(win, actorId) {
        const el = win.game.actors.get(actorId).sheet.element;
        const header = [
            ...el.querySelectorAll(
                'section[data-tab="combat"] li.list__header .list__detail',
            ),
        ].find((d) => /^(Spr|ZD)$/.test(d.textContent.trim()));
        const row = el.querySelector(
            'section[data-tab="combat"] li[data-sm-id="strike"]',
        );
        const cell = row?.querySelectorAll(".list__detail")[2]; // HFT, RCH, [spread]
        return {
            header: header?.textContent.trim(),
            cell: cell?.textContent.trim(),
        };
    }

    it("shows Spr / plain radius when the setting is off (default)", () => {
        cy.foundry((win) =>
            Cypress.Promise.resolve(
                win.game.settings.set("sohl", "useZoneDie", false),
            ).then(() => null),
        );
        beingWithSpear().then((actor) => {
            cy.foundry((win) => spreadCells(win, actor.id)).should((r) => {
                expect(r.header).to.equal("Spr");
                expect(r.cell).to.equal("6");
            });
        });
    });

    it("shows ZD / d-notation when the setting is on", () => {
        cy.foundry((win) =>
            Cypress.Promise.resolve(
                win.game.settings.set("sohl", "useZoneDie", true),
            ).then(() => null),
        );
        beingWithSpear().then((actor) => {
            cy.foundry((win) => spreadCells(win, actor.id)).should((r) => {
                expect(r.header).to.equal("ZD");
                expect(r.cell).to.equal("d6");
            });
        });
        // restore default so world state doesn't leak to other specs
        cy.foundry((win) =>
            Cypress.Promise.resolve(
                win.game.settings.set("sohl", "useZoneDie", false),
            ).then(() => null),
        );
    });
});
