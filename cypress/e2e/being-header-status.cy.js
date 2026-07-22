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
 * Being sheet header — status-effect toggles + affliction indicators (#306).
 *
 * Six pills are toggleable ActiveEffect statuses (Sleep/Prone/Stun/Incapacitated/
 * Unconscious/Dead); Aural-Shock and Fatigue are read-only indicators lit from an
 * active affliction of that subtype (matching the prototype). The health bar and
 * body-part grid are split out to #463 / #464 and not exercised here.
 */
describe("Being sheet header: status toggles + affliction indicators (#306)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => {
        cy.closeAllSheets();
        cy.cleanupWorld();
    });
    Cypress.on("uncaught:exception", () => false);

    it("toggles a status-effect pill (Prone) on click and reflects active state", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.openSheet(actor);

            const prone = '.sheet-header__status[data-status-id="prone"]';
            cy.get(prone).should("exist").and("not.have.class", "active");
            cy.get(prone).click();
            cy.get(prone).should("have.class", "active");
            cy.get(prone).click();
            cy.get(prone).should("not.have.class", "active");
        });
    });

    it("lights the Fatigue indicator from an active trauma, read-only (no toggle action)", () => {
        cy.importActor().then((actor) => {
            // Fatigue (and Aural-Shock) are modeled as TRAUMA subtypes (#565/#306);
            // the header indicator lights from an active trauma of that subtype.
            cy.createItemOn(actor, "trauma", {
                name: "Weariness",
                system: { subType: "fatigue", levelBase: 2 },
            });
            cy.prepare(actor);
            cy.openSheet(actor);

            // Exactly one indicator lights (Fatigue), and it is read-only — a
            // <span> with no toggle action or status id.
            cy.get(".sheet-header__status--indicator.active").should(
                "have.length",
                1,
            );
            cy.contains(
                ".sheet-header__status--indicator.active",
                "FTG",
            ).should("exist");
            cy.get(".sheet-header__status--indicator.active").should(
                "not.have.attr",
                "data-action",
            );
        });
    });

    it("leaves the Fatigue/Aural-Shock indicators unlit with no matching affliction", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.openSheet(actor);
            cy.get(".sheet-header__status--indicator").should("have.length", 2);
            cy.get(".sheet-header__status--indicator.active").should(
                "not.exist",
            );
        });
    });
});
