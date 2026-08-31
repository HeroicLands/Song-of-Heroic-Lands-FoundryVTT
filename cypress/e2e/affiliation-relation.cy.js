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

import { toRealm } from "../support/resolve.js";

/**
 * The Affiliation sheet's standing-toward-others table (#1404) and the subtype
 * it now declares (#1405).
 *
 * The generic `itemSheetSuite` already proves the subtype `<select>` round-trips
 * like any other choice field; what only a live client can prove is the relation
 * editor — a keyed map with its own add prompt and per-row control, which is not
 * a plain schema field the suite discovers.
 */
describe("affiliation — standing toward other affiliations (#1404)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => {
        cy.closeAllSheets();
        cy.cleanupWorld();
    });

    /** An actor holding two affiliations; the first one's sheet is opened. */
    function twoAffiliations() {
        cy.createActor("being").as("actor");
        cy.then(function () {
            cy.createItemOn(this.actor, "affiliation", {
                name: "Church of Larani",
                system: { shortcode: "larani", subType: "divine" },
            }).as("larani");
            cy.createItemOn(this.actor, "affiliation", {
                name: "Church of Peoni",
                system: { shortcode: "peoni", subType: "divine" },
            });
        });
        cy.then(function () {
            cy.openSheet(this.larani);
        });
    }

    /** The persisted relation table of the item under test. */
    function relationOf(item) {
        return cy.foundry(
            (win) => win.game.actors.get(item.actor.id).items.get(item.id).system.relation,
        );
    }

    /**
     * Record a standing directly on the document (fixture setup, not the flow
     * under test). The payload is cloned into the game realm first — a spec-realm
     * object literal is rejected by Foundry outright.
     */
    function recordStanding(item, code, standing) {
        return cy.foundry(async (win) => {
            const doc = win.game.actors.get(item.actor.id).items.get(item.id);
            await doc.update(toRealm(win, { [`system.relation.${code}`]: standing }));
            return null;
        });
    }

    it("starts neutral toward everyone — an empty table", () => {
        twoAffiliations();
        cy.then(function () {
            relationOf(this.larani).should("deep.eq", {});
        });
        cy.get('section.tab[data-tab="properties"] .array-list__empty').should("exist");
    });

    it("records a standing chosen in the Add Relation prompt", () => {
        twoAffiliations();
        cy.get('button[data-action="addRelation"]').click();
        // The other affiliation on the actor is offered; take the standing the
        // prompt opens on and confirm, exactly as a user would.
        cy.submitDialog("ok");
        cy.then(function () {
            const { actor, id } = this.larani;
            cy.window({ log: false }).should((win) => {
                const relation = win.game.actors.get(actor.id).items.get(id).system.relation;
                expect(relation).to.have.property("peoni", "aligned");
            });
        });
    });

    it("persists a standing changed on the row's select", () => {
        twoAffiliations();
        cy.then(function () {
            recordStanding(this.larani, "peoni", "aligned");
        });
        cy.then(function () {
            cy.openSheet(this.larani);
        });
        cy.then(function () {
            // The row's <select> is an ordinary form field, so the sheet's own
            // submitOnChange saves it — no separate flow, no save button.
            cy.editSheetField(this.larani, "system.relation.peoni", "nemesis");
        });
        cy.then(function () {
            relationOf(this.larani).should("deep.eq", { peoni: "nemesis" });
        });
    });

    it("returns a pair to neutral when its row is deleted", () => {
        twoAffiliations();
        cy.then(function () {
            recordStanding(this.larani, "peoni", "rival");
        });
        cy.then(function () {
            cy.openSheet(this.larani);
        });
        cy.get('[data-action="deleteRelation"][data-code="peoni"]').click();
        cy.then(function () {
            const { actor, id } = this.larani;
            cy.window({ log: false }).should((win) => {
                const relation = win.game.actors.get(actor.id).items.get(id).system.relation;
                expect(relation).to.not.have.property("peoni");
            });
        });
    });

    it("shows a recorded shortcode that resolves to nothing, flagged rather than dropped", () => {
        twoAffiliations();
        cy.then(function () {
            recordStanding(this.larani, "agrik", "nemesis");
        });
        cy.then(function () {
            cy.openSheet(this.larani);
        });
        cy.get('section.tab[data-tab="properties"] .array-list__row')
            .contains("agrik")
            .should("have.class", "unresolved");
        cy.then(function () {
            relationOf(this.larani).should("deep.eq", { agrik: "nemesis" });
        });
    });
});
