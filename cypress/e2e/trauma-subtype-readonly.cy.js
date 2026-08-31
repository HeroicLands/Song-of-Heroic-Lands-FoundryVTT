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
 * Trauma sheet sub-type is read-only after creation (#926).
 *
 * A document's sub-type is fixed at creation, so the Trauma sheet must not
 * expose an editable `system.subType` control (it previously rendered an
 * editable dropdown — the subject of #754, now removed). The sub-type stays
 * visible, read-only, in the sheet header via the localized `typeLabel`.
 */
describe("trauma sheet sub-type is read-only (#926)", () => {
    const SUBTYPE_SEL = '[name="system.subType"]';

    before(() => cy.login().then(() => cy.cleanupWorld()));
    afterEach(() => cy.cleanupWorld());

    function renderSheet(uuid) {
        cy.foundry((win) =>
            Cypress.Promise.resolve(win.fromUuidSync(uuid).sheet.render(true)).then(() => null),
        );
        cy.wait(400);
    }

    it("renders no editable sub-type control on the sheet", () => {
        cy.createActor("being", { name: "Trauma RO Being" }).then((actor) => {
            cy.createItemOn(actor, "trauma", {
                name: "Gash",
                system: { subType: "injury" },
            }).then((trauma) => {
                renderSheet(trauma.uuid);
                cy.foundry((win) => {
                    const el = win.fromUuidSync(trauma.uuid).sheet.element;
                    return el.querySelectorAll(SUBTYPE_SEL).length;
                }).should("eq", 0);
            });
        });
    });

    it("shows the localized sub-type read-only in the header", () => {
        cy.createActor("being", { name: "Trauma RO Being 2" }).then((actor) => {
            cy.createItemOn(actor, "trauma", {
                name: "Gash",
                system: { subType: "injury" },
            }).then((trauma) => {
                renderSheet(trauma.uuid);
                cy.foundry((win) => {
                    const el = win.fromUuidSync(trauma.uuid).sheet.element;
                    return el.querySelector(".sheet-header__type")?.textContent?.trim();
                }).should((label) => {
                    // Localized sub-type ("Injury"), not the raw stored value or
                    // an i18n key.
                    expect(label).to.match(/Injury/);
                    expect(label).not.to.contain("SOHL.Trauma.SubType");
                    expect(label).not.to.match(/\binjury\b/);
                });
            });
        });
    });
});
