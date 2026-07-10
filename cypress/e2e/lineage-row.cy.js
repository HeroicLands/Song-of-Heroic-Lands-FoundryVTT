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
 * Combat-tab Lineage row (#339). The lineage is a singleton: the row shows the
 * current lineage with Edit/Delete anchors, and the + Add control is disabled
 * (no action) when a lineage already exists, active only when none does.
 */
describe("Combat tab Lineage row", () => {
    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());
    Cypress.on("uncaught:exception", () => false);

    function combatLineage(win, actorId) {
        const el = win.game.actors.get(actorId).sheet.element;
        const fs = [
            ...el.querySelectorAll('section[data-tab="combat"] fieldset'),
        ].find((f) =>
            /Lineage/.test(f.querySelector("legend")?.textContent ?? ""),
        );
        const add = fs?.querySelector("legend .item-create");
        const row = fs?.querySelector("li.item[data-item-id]");
        return {
            hasFieldset: !!fs,
            addActive:
                !!add && add.getAttribute("data-action") === "createItem",
            addType: add?.getAttribute("data-type"),
            addDisabled: !!add && add.classList.contains("disabled"),
            rowName: row?.querySelector("h4")?.textContent?.trim(),
            rowItemId: row?.getAttribute("data-item-id"),
            hasEdit: !!fs?.querySelector('[data-action="editItem"]'),
            hasDelete: !!fs?.querySelector('[data-action="deleteItem"]'),
        };
    }

    it("shows the lineage with Edit/Delete and a disabled + Add when one exists", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.openSheet(actor);
            cy.switchTab("combat", "primary");
            cy.wait(400);
            cy.foundry((win) => {
                win.__lid = win.game.actors.get(
                    actor.id,
                ).itemTypes.lineage[0]?.id;
                return combatLineage(win, actor.id);
            }).should((r) => {
                expect(r.hasFieldset).to.be.true;
                expect(r.rowItemId, "row = lineage id").to.be.a("string").and
                    .not.empty;
                expect(r.rowName, "lineage name shown").to.be.a("string").and
                    .not.empty;
                expect(r.hasEdit).to.be.true;
                expect(r.hasDelete).to.be.true;
                expect(r.addActive, "+Add inert when lineage exists").to.be
                    .false;
                expect(r.addDisabled, "+Add disabled class").to.be.true;
            });
        });
    });

    it("shows an active + Add (type=lineage) and no row when no lineage exists", () => {
        cy.createActor("being", { name: "Spirit" }).then((actor) => {
            cy.prepare(actor);
            cy.openSheet(actor);
            cy.switchTab("combat", "primary");
            cy.wait(400);
            cy.foundry((win) => combatLineage(win, actor.id)).should((r) => {
                expect(r.hasFieldset).to.be.true;
                expect(r.rowItemId, "no lineage row").to.be.undefined;
                expect(r.addActive, "+Add active").to.be.true;
                expect(r.addType).to.equal("lineage");
            });
        });
    });

    it("Edit opens the lineage sheet; Delete (confirmed) removes it", () => {
        cy.importActor().then((actor) => {
            cy.prepare(actor);
            cy.openSheet(actor);
            cy.switchTab("combat", "primary");
            cy.wait(400);
            // Edit → lineage sheet opens
            cy.foundry((win) => {
                const el = win.game.actors.get(actor.id).sheet.element;
                el.querySelector(
                    'section[data-tab="combat"] [data-action="editItem"]',
                ).click();
                return null;
            });
            cy.wait(400);
            cy.foundry((win) => {
                const lid = win.game.actors.get(actor.id).itemTypes.lineage[0]
                    .id;
                const open = [
                    ...win.foundry.applications.instances.values(),
                ].some(
                    (a) =>
                        a.document?.id === lid &&
                        a.document?.documentName === "Item",
                );
                return { sheetOpen: open };
            }).should(
                (r) => expect(r.sheetOpen, "lineage sheet open").to.be.true,
            );
            // Delete → confirm → gone
            cy.foundry((win) => {
                win.game.actors
                    .get(actor.id)
                    .sheet.element.querySelector(
                        'section[data-tab="combat"] [data-action="deleteItem"]',
                    )
                    .click();
                return null;
            });
            cy.wait(400);
            cy.submitDialog("yes");
            cy.wait(500);
            cy.foundry((win) => ({
                count: win.game.actors.get(actor.id).itemTypes.lineage.length,
            })).should((r) => expect(r.count, "lineage removed").to.equal(0));
        });
    });
});
