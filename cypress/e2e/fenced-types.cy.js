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
 * Fence enforcement (issue #959): the experimental actor types (cohort /
 * structure / vehicle) are visibly marked so testers don't build campaigns on
 * schemas that may still change. Two surfaces, both driven from the single
 * `FENCED_TYPES` source of truth:
 *
 *   1. The create dialog suffixes fenced types with "(Experimental)" (labelled,
 *      not hidden — they stay selectable).
 *   2. Fenced actor sheets render a dismissible "Experimental — schema not final"
 *      banner above the header.
 */

/** Find the open (rendered) SoHL create dialog and return its root element. */
function openCreateDialogElement(win) {
    const dlg = Array.from(win.foundry.applications.instances.values())
        .reverse()
        .find(
            (app) =>
                /dialog/i.test(app.constructor.name) &&
                app.rendered &&
                app.element &&
                app.element.querySelector('select[name="type"]'),
        );
    return dlg;
}

describe("fence enforcement: experimental type marking (#959)", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    // testIsolation is off, so a `.fence-banner` query is document-wide — close
    // every sheet between tests (and scope each lookup to its own sheet) so a
    // leftover sheet's banner can't be matched by a later test.
    afterEach(() => cy.closeAllSheets().then(() => cy.cleanupWorld()));

    // ------------------------------------------------------- create-dialog label

    it("suffixes fenced actor types with (Experimental) in the create dialog", () => {
        cy.foundry((win) => {
            // No pre-seeded type → the dialog shows the type <select>. Stash the
            // promise so it can be dismissed without creating anything.
            win.__fenceDlg = win.CONFIG.Actor.documentClass.createDialog({}, {}, {});
            return null;
        });
        // Poll for the rendered dialog, then read the type-select option labels.
        cy.window({ log: false }).should((win) => {
            const dlg = openCreateDialogElement(win);
            expect(dlg, "open create dialog").to.exist;
            const byValue = {};
            dlg.element.querySelectorAll('select[name="type"] option').forEach((o) => {
                byValue[o.value] = o.textContent.trim();
            });
            // Fenced actor kinds carry the suffix…
            for (const kind of ["cohort", "structure", "vehicle"]) {
                expect(byValue[kind], `${kind} option label`).to.match(/\(Experimental\)$/);
            }
            // …the frozen Being does not.
            expect(byValue.being, "being option label").to.exist;
            expect(byValue.being).to.not.match(/Experimental/);
        });
        // Dismiss the dialog (no document created) so it can't leak into later tests.
        cy.foundry((win) => {
            openCreateDialogElement(win)?.close();
            return win.__fenceDlg.then(() => null);
        });
    });

    // --------------------------------------------------------------- sheet banner

    for (const kind of ["cohort", "structure", "vehicle"]) {
        it(`${kind} sheet shows the experimental banner, dismissible per-view`, () => {
            cy.createActor(kind, { name: `fenced ${kind}` }).then((actor) => {
                // Scope every banner lookup to this sheet's own element (queries
                // are document-wide with testIsolation off).
                cy.openSheet(actor).within(() => {
                    // The banner renders above the header with its dismiss control.
                    cy.get(".fence-banner").should("exist").and("contain.text", "Experimental");
                    cy.get('[data-action="dismissFenceNotice"]').should("exist").click();
                    // Dismissal removes it for the current view…
                    cy.get(".fence-banner").should("not.exist");
                });
                // …but re-opening the sheet brings the caution back (schema really
                // isn't final; dismissal is intentionally not persisted).
                cy.foundry((win) => {
                    win.game.actors.get(actor.id).sheet.close();
                    return null;
                });
                cy.openSheet(actor).within(() => {
                    cy.get(".fence-banner").should("exist");
                });
            });
        });
    }

    it("the frozen Being sheet shows no experimental banner", () => {
        cy.importActor().then((actor) => {
            cy.openSheet(actor).within(() => {
                cy.get("section.tab").should("exist"); // sheet rendered
                cy.get(".fence-banner").should("not.exist");
            });
        });
    });
});
