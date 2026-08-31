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
 * Zone Die presentation on the Combat tab (#828).
 *
 * A melee strike mode's `spread.effective` is always presented as a Zone Die
 * (`d{n}`, column "ZD"). The former "Use Zone Die" toggle was removed — zone-die
 * presentation is now unconditional.
 */
describe("Zone Die presentation", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());
    Cypress.on("uncaught:exception", () => false);

    /** A melee weapon whose single strike mode has a spread of 6. */
    function spearWeapon() {
        return {
            name: "Spear",
            system: {
                strikeModes: [
                    {
                        shortcode: "strike",
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
                ],
            },
        };
    }

    /** Import Basic Folk with a held spear, open its Combat tab. Yields the actor. */
    function beingWithSpear() {
        return cy.importActor().then((actor) => {
            // Basic Folk already owns `melee`; raise its ML instead of adding a
            // colliding duplicate (the `(type, shortcode)` key is unique).
            cy.ensureSkillML(actor, "melee", 50);
            cy.createItemOn(actor, "weapongear", spearWeapon()).then((weapon) => {
                cy.holdItem(weapon);
                cy.prepare(actor);
                cy.openSheet(actor);
                cy.switchTab("combat", "primary");
            });
            return cy.wrap(actor);
        });
    }

    /** The spread header text and the strike-mode row's spread cell text. */
    function spreadCells(win, actorId) {
        const el = win.game.actors.get(actorId).sheet.element;
        const header = [
            ...el.querySelectorAll(
                // Column labels live in the strike-mode ledger's `.ledger__head`
                // row (one <div> per column) after the Manuscript redesign.
                'section[data-tab="combat"] .ledger__head > div',
            ),
        ].find((d) => /^ZD$/.test(d.textContent.trim()));
        const row = el.querySelector(
            'section[data-tab="combat"] .ledger__row[data-sm-id="strike"]',
        );
        // Row cells in column order: HFT, RCH, [spread], … (the name lives in a
        // separate `.ledger__name`, so spread is the third `.ledger__cell`).
        const cell = row?.querySelectorAll(".ledger__cell")[2];
        return {
            header: header?.textContent.trim(),
            cell: cell?.textContent.trim(),
        };
    }

    it("always shows ZD / d-notation on the Combat tab", () => {
        beingWithSpear().then((actor) => {
            cy.foundry((win) => spreadCells(win, actor.id)).should((r) => {
                expect(r.header).to.equal("ZD");
                expect(r.cell).to.equal("d6");
            });
        });
    });
});
